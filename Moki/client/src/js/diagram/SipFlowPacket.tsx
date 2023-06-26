import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { Line, LinePath } from "@visx/shape";
import { MarkerArrow } from "@visx/marker";
import { ExtractedPacket } from "./extractFlow";
import { curveBasisClosed, ScaleOrdinal } from "d3";
import { formatSIPPayload } from "./formatPayloadSIP";
import {
  flip,
  FloatingPortal,
  offset,
  size,
  useFloating,
} from "@floating-ui/react";
import { DiagramTooltip } from "./DiagramTooltip";
import { useState } from "react";
import SyslogsWindow from "./SyslogsWindow";
import { IconTerminal2 } from "@tabler/icons-react";
import { formatDate } from "../helpers/formatTime";
import { getSeverityColor } from "./Syslog";

const MESSAGE_SPACE = 40;
const MESSAGE_LABEL_X_OFFSET = -30;
const MESSAGE_LABEL_Y_OFFSET = 75;
const MESSAGE_ARROW_Y_OFFSET = 80;

interface Props {
  packet: ExtractedPacket;
  i: number;
  tooltipDiv: HTMLDivElement;
  syslogsDiv: HTMLDivElement;
  diagramRef: React.RefObject<HTMLDivElement>;
  activeHosts: string[];
  xPad: number;
  vertSpace: number;
  colorScaleSIP: ScaleOrdinal<string, string>;
}

function SipFlowPacket(
  {
    packet,
    i,
    activeHosts,
    tooltipDiv,
    syslogsDiv,
    diagramRef,
    xPad,
    vertSpace,
    colorScaleSIP,
  }: Props,
) {
  const sipPacket = packet.sip.packet;

  // tooltip
  const pushBackTooltips = () => {
    if (!diagramRef.current) return;
    diagramRef.current.querySelectorAll<HTMLElement>(
      "[data-sip], [data-syslogs]",
    )
      .forEach((tooltip) => {
        tooltip.style.zIndex = "10";
      });
  };

  // sip tooltip popup
  const [isOpenSIP, setIsOpenSIP] = useState(false);
  const { refs: refsSIP, floatingStyles: floatingStylesSIP } = useFloating({
    open: isOpenSIP,
    onOpenChange: setIsOpenSIP,
    placement: "bottom-start",
    middleware: [flip(), offset(5)],
  });

  const pushFrontTooltipSIP = () => {
    pushBackTooltips();
    tooltipDiv.style.zIndex = "20";
  };

  // syslogs window popup
  const [isOpenSyslogs, setIsOpenSyslogs] = useState(false);
  const { refs: refsSyslogs, floatingStyles: floatingStylesSyslogs } =
    useFloating({
      open: isOpenSyslogs,
      onOpenChange: setIsOpenSyslogs,
      placement: "right-start",
      middleware: [
        flip(),
        offset(5),
        size({
          apply({ availableWidth, elements }) {
            Object.assign(elements.floating.style, {
              maxWidth: `${availableWidth - 10}px`,
              width: "fit-content",
            });
          },
        }),
      ],
    });

  const pushFrontTooltipSyslogs = () => {
    pushBackTooltips();
    syslogsDiv.style.zIndex = "20";
  };

  const messageX = xPad + MESSAGE_LABEL_X_OFFSET;
  const messageY = MESSAGE_LABEL_Y_OFFSET + i * MESSAGE_SPACE;

  const arrowY = MESSAGE_ARROW_Y_OFFSET + i * MESSAGE_SPACE;
  const srcIndex = activeHosts.indexOf(sipPacket.src);
  const dstIndex = activeHosts.indexOf(sipPacket.dst);
  const srcArrowX = xPad + srcIndex * vertSpace;
  const dstArrowX = xPad + dstIndex * vertSpace;
  const markerArrowId = `marker-arrow-${sipPacket.id}`;

  const labelOffset = ((dstIndex - srcIndex) * vertSpace) / 2;
  const labelX = xPad + MESSAGE_LABEL_X_OFFSET + srcIndex * vertSpace +
    labelOffset;
  const labelY = MESSAGE_LABEL_Y_OFFSET + i * MESSAGE_SPACE;

  return (
    <>
      <Group
        transform={`translate(${messageX}, ${messageY})`}
        className="first"
      >
        {packet.syslog.packets.length > 0 &&
          (
            <IconTerminal2
              x={5}
              y={-11}
              size={14}
              cursor="grab"
              pointerEvents={"fill"}
              ref={refsSyslogs.setReference}
              className={getSeverityColor(packet.syslog.severity)}
              onClick={() => {
                setIsOpenSyslogs(!isOpenSyslogs);
                pushFrontTooltipSyslogs();
              }}
            />
          )}
        <Text textAnchor="end" fontSize={10}>
          {packet.sip.timestamp}
        </Text>
      </Group>
      {/* arrow style */}
      <MarkerArrow
        id={markerArrowId}
        fill={colorScaleSIP(sipPacket.branch)}
        size={6}
      />
      {/* curved arrow: src -> src */}
      {sipPacket.src === sipPacket.dst &&
        (
          <LinePath
            stroke={colorScaleSIP(sipPacket.branch)}
            fill="transparent"
            markerEnd={`url(#${markerArrowId})`}
            curve={curveBasisClosed}
            data={[
              [srcArrowX - 10, arrowY - 20],
              [srcArrowX + 10, arrowY + 45],
              [srcArrowX + 45, arrowY + 10],
            ]}
          />
        )}
      {/* straight arrow: src -> dst */}
      {sipPacket.src !== sipPacket.dst &&
        (
          <Line
            stroke={colorScaleSIP(sipPacket.branch)}
            markerEnd={`url(#${markerArrowId})`}
            from={{ x: srcArrowX, y: arrowY }}
            to={{ x: dstArrowX, y: arrowY }}
          />
        )}
      {/* message label */}
      <Group transform={`translate(${labelX}, ${labelY})`}>
        <Text
          innerRef={refsSIP.setReference}
          onClick={() => {
            setIsOpenSIP(!isOpenSIP);
            pushFrontTooltipSIP();
          }}
          dx={5}
          dy={-2}
          textAnchor="start"
          cursor={"grab"}
          fontSize={10}
        >
          {sipPacket.method}
        </Text>
      </Group>
      {/* sip tooltip */}
      <FloatingPortal root={tooltipDiv}>
        <DiagramTooltip
          {...{
            isOpen: isOpenSIP,
            setIsOpen: setIsOpenSIP,
            refs: refsSIP,
            floatingStyles: floatingStylesSIP,
            pushFront: pushFrontTooltipSIP,
            headerStyle: { background: "var(--main)" },
            headerContent: (
              <span
                style={{
                  display: "block",
                  overflow: "hidden",
                  color: "white",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {sipPacket.method}
              </span>
            ),
            bodyContent: (
              <div
                className="tooltipDiagramBody"
                dangerouslySetInnerHTML={{
                  __html: formatSIPPayload(sipPacket),
                }}
              />
            ),
          }}
        />
      </FloatingPortal>
      {/* syslog view */}
      <FloatingPortal root={syslogsDiv}>
        <DiagramTooltip
          {...{
            isOpen: isOpenSyslogs,
            setIsOpen: setIsOpenSyslogs,
            refs: refsSyslogs,
            floatingStyles: floatingStylesSyslogs,
            pushFront: pushFrontTooltipSyslogs,
            headerStyle: { background: "steelblue" },
            headerContent: (
              <span
                style={{
                  display: "block",
                  overflow: "hidden",
                  color: "white",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(packet.unixTimestamp, true)}
              </span>
            ),
            bodyContent: <SyslogsWindow syslogs={packet.syslog.packets} />,
          }}
        />
      </FloatingPortal>
    </>
  );
}

export { SipFlowPacket };
