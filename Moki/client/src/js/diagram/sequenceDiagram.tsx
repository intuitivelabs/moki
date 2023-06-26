import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScaleOrdinal, scaleOrdinal } from "d3";
import downloadIcon from "/icons/download.png";
import downloadPcapIcon from "/icons/downloadPcap.png";
import { Flow, parseFlow } from "@/js/diagram/parseFlow";
import {
  downloadPcapResource,
  downloadPcaps,
} from "@/js/helpers/download/downloadPcapResource";
import { saveFile } from "@/js/helpers/download/saveFile";
import { extractFlow } from "./extractFlow";
import { HostLines } from "./HostLine";
import { SipFlowPacket } from "./SipFlowPacket";

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
  const removedHosts = useRef<Set<string>>(new Set());
  const colorScaleSIP = useRef<ScaleOrdinal<string, string>>(scaleOrdinal());
  const diagramRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [rendered, setRendered] = useState(false);

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
    if (!diagramRef.current) return;
    setRendered(true);
  });

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

    if (checked) {
      newSelection.add(id);
      removedHosts.current.delete(id);
    } else {
      newSelection.delete(id);
      removedHosts.current.add(id);
    }

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

  // transform data
  const visibleHostsSet = new Set<string>();
  const sipPackets = data?.sipFlow.sips.filter((packet) => {
    if (selectedHosts?.has(packet.src)) {
      visibleHostsSet.add(packet.src);
      if (!removedHosts.current.has(packet.dst)) {
        visibleHostsSet.add(packet.dst);
        return true;
      }
    }
    return false;
  });
  const visibleHosts = [...visibleHostsSet];

  const margin = { top: 0, right: 20, bottom: 20, left: 0 };
  const width = 1400 - (margin.left + margin.right);

  const VERT_SPACE = width / visibleHosts.length;
  const MESSAGE_SPACE = 40;
  const CLASS_WIDTH = VERT_SPACE - 10;
  const XPAD = CLASS_WIDTH / 2;

  const flowRender = useMemo(() => {
    if (!data || !diagramRef.current || !sipPackets) return;

    const elements = [];
    let i = 0;

    for (const packet of extractFlow(data, sipPackets, visibleHostsSet)) {
      const tooltipDiv = document.createElement("div");
      tooltipDiv.dataset.sip = packet.sip.packet.id.toString();
      diagramRef.current.appendChild(tooltipDiv);

      const syslogsDiv = document.createElement("div");
      syslogsDiv.dataset.syslogs = packet.sip.packet.id.toString();
      diagramRef.current.appendChild(syslogsDiv);

      elements.push(
        <SipFlowPacket
          key={packet.sip.packet.id}
          {...{
            packet,
            i,
            tooltipDiv,
            syslogsDiv,
            diagramRef,
            activeHosts: visibleHosts,
            xPad: XPAD,
            vertSpace: VERT_SPACE,
            colorScaleSIP: colorScaleSIP.current,
          }}
        />,
      );

      i += 1;
    }

    return elements;
  }, [data, visibleHostsSet, rendered]);

  const noData = !data || !selectedHosts || !sipPackets;

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
        id="diagram1"
        ref={diagramRef}
      >
        {!error && noData && <b>Trying to get pcap file...</b>}
        {error && (
          <section
            style={{
              marginTop: "5rem",
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <b>Whoops</b>
            <p>{error}</p>
          </section>
        )}
        {!noData && !error &&
          (
            <svg
              width={width + margin.left + margin.right}
              height={(sipPackets.length + 2) * MESSAGE_SPACE + 20}
              transform={`translate(${margin.left}, ${margin.top})`}
            >
              <HostLines
                activeHosts={visibleHosts}
                classWidth={CLASS_WIDTH}
                vertSpace={VERT_SPACE}
                xPad={XPAD}
                height={sipPackets.length * (MESSAGE_SPACE + 5)}
              />
              {flowRender}
            </svg>
          )}
      </div>
    </span>
  );
}
