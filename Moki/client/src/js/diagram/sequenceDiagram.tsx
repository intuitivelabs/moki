import React, { useEffect, useRef, useState } from "react";
import {
  curveBasisClosed,
  line,
  ScaleOrdinal,
  scaleOrdinal,
  select,
  selectAll,
} from "d3";

import downloadIcon from "/icons/download.png";
import downloadPcapIcon from "/icons/downloadPcap.png";
import { Flow, parseFlow } from "@/js/diagram/parseFlow";
import { formatSIPPayload } from "@/js/diagram/formatPayloadSIP";
import {
  downloadPcapResource,
  downloadPcaps,
} from "@/js/helpers/download/downloadPcapResource";
import { saveFile } from "@/js/helpers/download/saveFile";

const Tableau10 = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
];

export default function SequenceDiagram() {
  let filenames: string[] | undefined = undefined;

  // pcap files
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    filenames = id.split(",");
  }

  /* Load data */
  async function load() {
    if (!filenames || filenames.length === 0) {
      throw new Error("No PCAP filenames specified in id search parameter");
    }

    try {
      const res = await downloadPcapResource(filenames, "api/diagram");
      return await res.text();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Problem while receiving data: " + error.message);
      }
    }

    throw new Error("No data");
  }

  return <SequenceDiagramRender {...{ load, filenames }} />;
}

function formatSmallDuration(duration: number) {
  if (duration < 1000) return `+ ${Math.round(duration)}ms`;
  else return `+ ${Math.round(duration / 1000)}s`;
}

interface RenderProps {
  filenames: string[] | undefined;
  load: () => Promise<string>;
  download?: boolean;
}

export function SequenceDiagramRender(
  { load, filenames, download = true }: RenderProps,
) {
  const [data, setData] = useState<Flow | undefined>();
  const [selectedHosts, setSelectedHosts] = useState<Set<string>>();
  const colorScaleSIP = useRef<ScaleOrdinal<string, string>>(scaleOrdinal());
  const [error, setError] = useState<string | undefined>(undefined);

  const noData = !data;

  useEffect(() => {
    const loadData = async () => {
      try {
        const xmlData = await load();
        if (xmlData === "") {
          setError("Error: Empty diagram");
          return;
        }
        const data = parseFlow(xmlData);
        colorScaleSIP.current = scaleOrdinal<string, string>(
          data.sipFlow.branches,
          Tableau10,
        );
        setData(data);
        setSelectedHosts(data.sipFlow.hosts);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };
    loadData();
  }, [load]);

  useEffect(() => {
    draw();
  }, [selectedHosts]);

  /**
   * update current selection of node names
   */
  const updateSelection = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    if (!data) return;

    const id = e.currentTarget.id;
    const checked = e.currentTarget.checked;
    const newSelection = new Set(selectedHosts);

    if (checked) newSelection.add(id);
    else newSelection.delete(id);

    setSelectedHosts(newSelection);
  };

  const getPcap = async () => {
    if (!filenames) return;
    downloadPcaps(filenames, filenames[0]);
  };

  const getDiagram = async () => {
    if (!filenames) return;
    try {
      const res = await downloadPcapResource(
        filenames,
        "api/diagram/bundle",
      );
      const blob = new Blob([await res.blob()], { type: "html" });
      saveFile(blob, filenames[0].slice(0, -5) + ".html");
    } catch (error) {
      if (error instanceof Error) {
        alert("Could not download bundled HTML: " + error.message);
      }
    }
  };

  const draw = () => {
    if (noData || !selectedHosts) return;

    const margin = { top: 0, right: 20, bottom: 20, left: 0 };
    const width = 1200 - (margin.left + margin.right);

    // transform data
    const activeHostsSet = new Set<string>();
    const sipPackets = data.sipFlow.sips.filter((packet) => {
      if (selectedHosts.has(packet.src)) {
        activeHostsSet.add(packet.src);
        return true;
      }
      return false;
    });
    const activeHosts = [...activeHostsSet];

    const chart = document.getElementById("diagramSVG");
    if (chart) {
      chart.remove();
    }

    const svg = select("#diagram")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("id", "diagramSVG")
      .attr("transform", `translate(${margin.left}, ${margin.right})`);

    const VERT_SPACE = width / activeHosts.length;
    const VERT_PAD = 20;

    const MESSAGE_SPACE = 30;
    svg.attr("height", (sipPackets.length + 2) * MESSAGE_SPACE + 20);

    const MESSAGE_LABEL_X_OFFSET = -40;
    const MESSAGE_LABEL_Y_OFFSET = 75;
    const MESSAGE_ARROW_Y_OFFSET = 80;

    const CLASS_WIDTH = VERT_SPACE - 10;

    const XPAD = CLASS_WIDTH / 2;
    const YPAD = 30;

    for (const [i, name] of activeHosts.entries()) {
      // Draw vertical lines
      svg.append("line")
        .style("stroke", "#888")
        .style("stroke-dasharray", "3, 3")
        .attr("x1", XPAD + i * VERT_SPACE)
        .attr("y1", YPAD + 20)
        .attr("x2", XPAD + i * VERT_SPACE)
        .attr(
          "y2",
          YPAD + VERT_PAD + sipPackets.length * (MESSAGE_SPACE + 5),
        );

      // Draw classes
      const x = XPAD + i * VERT_SPACE;
      svg.append("g")
        .attr("transform", `translate(${x}, ${YPAD})`)
        .attr("class", "class-rect")
        .append("rect")
        .attr("x", -CLASS_WIDTH / 2)
        .attr("width", CLASS_WIDTH)
        .attr("height", "24px")
        .attr("opacity", 0.1)
        .attr("rx", 5);

      // Draw class labels
      svg.append("g")
        .attr("transform", `translate(${x}, ${YPAD})`)
        .append("text")
        .attr("class", "class-label")
        .attr("text-anchor", "middle")
        .text(name)
        .attr("dy", "16px");
    }

    for (const [i, packet] of sipPackets.entries()) {
      if (!activeHostsSet.has(packet.dst)) continue;

      // draw timestamp labels
      let timestamp = packet.timestamp;
      if (i !== 0) {
        timestamp = formatSmallDuration(packet.timestep);
      }

      svg.append("g")
        .attr(
          "transform",
          `translate(${XPAD + MESSAGE_LABEL_X_OFFSET}, ${
            MESSAGE_LABEL_Y_OFFSET + i * MESSAGE_SPACE
          })`,
        )
        .attr("class", "first")
        .attr("text-anchor", "middle")
        .append("text")
        .style("font-size", "10px")
        .text(timestamp);

      // Draw message arrows
      const arrowY = MESSAGE_ARROW_Y_OFFSET + i * MESSAGE_SPACE;
      const srcIndex = activeHosts.indexOf(packet.src);
      const dstIndex = activeHosts.indexOf(packet.dst);
      const srcArrowX = XPAD + srcIndex * VERT_SPACE;
      const dstArrowX = XPAD + dstIndex * VERT_SPACE;

      if (packet.src === packet.dst) {
        // curved arrow: src -> src
        const pathData = line().curve(curveBasisClosed)([
          [srcArrowX - 10, arrowY - 20],
          [srcArrowX + 10, arrowY + 45],
          [srcArrowX + 45, arrowY + 10],
        ]);
        svg.append("path")
          .attr("d", pathData)
          .attr("stroke", colorScaleSIP.current(packet.branch))
          .attr("fill", "transparent")
          .attr("marker-end", "url(#end" + packet.id + ")");
      } else {
        // straight arrow: src -> dst
        svg.append("line")
          .style("stroke", colorScaleSIP.current(packet.branch))
          .attr("x1", srcArrowX)
          .attr("y1", arrowY)
          .attr("x2", dstArrowX)
          .attr("y2", arrowY)
          .attr("marker-end", "url(#end" + packet.id + ")");
      }

      // Create tooltips for each record
      select("#diagram").append("div")
        .attr("class", "tooltipDiagram tooltiptextCSS")
        .attr("id", "tooltip" + i)
        .style("display", "none")
        .style("opacity", 0);
      dragElement(document.getElementById("tooltip" + i));

      // Draw message labels
      const labelOffset = ((dstIndex - srcIndex) * VERT_SPACE) / 2;
      const labelX = XPAD + MESSAGE_LABEL_X_OFFSET + srcIndex * VERT_SPACE +
        labelOffset;
      const labelY = MESSAGE_LABEL_Y_OFFSET + i * MESSAGE_SPACE;

      svg.append("g")
        .attr("transform", `translate(${labelX}, ${labelY})`)
        .append("text")
        .attr("dx", "5px")
        .attr("dy", "-2px")
        .attr("text-anchor", "begin")
        .style("cursor", "grab")
        .style("font-size", "10px")
        .text(packet.method)
        .on("click", function (event) {
          // set z-index to front when you click on popup
          selectAll(".tooltipDiagram").style("z-index", 10);
          select("#tooltip" + i)
            .transition()
            .duration(200)
            .style("display", "inline-block")
            .attr("clicked", "true")
            .style("z-index", 20)
            .style("opacity", 1);

          let top = event.clientY;
          const maxY = document.documentElement.scrollHeight;
          const y = event.clientY;
          const x = event.clientX;
          if (maxY - top < 150) top = maxY - 200;

          select("#tooltip" + i).html(`
            <div class="tooltipDiagramHeader">
              <span style="cursor: default; margin-right: 10px; 
                margin-left: 3px; font-size: 12px; color: black;" 
                onclick=getElementById("${"tooltip" + i}").style.display="none">
                X
              </span>
              ${packet.method}
            </div>
            <div class="tooltipDiagramBody">
              ${formatSIPPayload(packet)}
            </div>`)
            .style("left", x + "px")
            .style("top", y + "px");
        });
    }

    // Arrow style
    svg.append("svg:defs").selectAll(".arrows")
      .data(sipPackets)
      .enter()
      .append("svg:marker")
      .attr("id", (d) => "end" + d.id)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .style("fill", (d) => colorScaleSIP.current(d.branch))
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    function dragElement(element: HTMLElement | null) {
      if (!element) return;
      let mouseOffsetX = 0;
      let mouseOffsetY = 0;

      const header = document.getElementById(element.id + "Header");
      if (header) header.onmousedown = dragMouseDown;
      else element.onmousedown = dragMouseDown;

      function dragMouseDown(e: MouseEvent) {
        if (!element) return;
        const path = e.composedPath();
        const firstEl = path.at(0) as HTMLElement;
        if (
          firstEl.getAttribute("class") === "tooltipDiagramHeader"
        ) {
          e = e || window.event;
          e.preventDefault();

          const elRect = element.getBoundingClientRect();

          // get the mouse cursor offset to the element at startup:
          mouseOffsetX = e.clientX - elRect.x;
          mouseOffsetY = e.clientY - elRect.y;

          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }

        //set z-index to front when you click on popup
        const allTooltips = document.getElementsByClassName(
          "tooltipDiagram",
        ) as HTMLCollectionOf<HTMLElement>;
        for (const tooltip of allTooltips) {
          tooltip.style.zIndex = "10";
        }
        const firstElParent = firstEl.parentElement;
        if (firstElParent) firstElParent.style.zIndex = "20";

        function elementDrag(e: MouseEvent) {
          if (!element) return;
          e = e || window.event;
          e.preventDefault();

          // calculate the new element position:
          const elTop = e.clientY - mouseOffsetY;
          const elLeft = e.clientX - mouseOffsetX;

          // set the element's new position:
          element.style.top = elTop + "px";
          element.style.left = elLeft + "px";
        }
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  };

  return (
    <span
      style={{ width: "100%", marginLeft: "30px", marginTop: "20px" }}
    >
      <span>
        {download &&
          (
            <>
              <button
                className="noFormatButton"
                key="downloadPCAP"
                onClick={getPcap}
              >
                <img
                  className="icon"
                  alt="downloadIcon"
                  src={downloadPcapIcon}
                  title="download PCAP"
                />
              </button>
              <button
                className="noFormatButton"
                key="downloadSD"
                onClick={getDiagram}
              >
                <img
                  className="icon"
                  alt="downloadIcon"
                  src={downloadIcon}
                  title="download chart"
                />
              </button>
            </>
          )}
        {[...data?.sipFlow.hosts ?? []].map((name) => (
          <span style={{ "marginLeft": "5px" }} key={name}>
            <input
              type="checkbox"
              defaultChecked
              id={name}
              onClick={updateSelection}
              style={{ "verticalAlign": "middle" }}
            >
            </input>
            <label
              style={{ "marginLeft": "5px", "verticalAlign": "middle" }}
            >
              {name}
            </label>
          </span>
        ))}
      </span>
      <div
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
        id="diagram"
      >
        {error || noData &&
            (
              <div
                style={{
                  "textAlign": "center",
                  "margin": "auto",
                  "marginTop": "10%",
                  "marginLeft": "80px",
                }}
              >
                {noData &&
                  <b>Trying to get pcap file...</b>}
                {error &&
                  (
                    <>
                      <b>Whoops</b>
                      <p>{error}</p>
                    </>
                  )}
              </div>
            )}
      </div>
    </span>
  );
}
