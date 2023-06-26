import { SipSyslog } from "./extractFlow";

type SeverityType = "warning" | "error" | "info" | "unknown";


function getSeverityType(severity: string): SeverityType {
  switch (severity) {
    case "debug":
    case "info":
      return "info";

    case "unknown":
    case "notice":
    case "warning":
      return "warning";

    case "err":
    case "crit":
    case "alert":
    case "emerg":
      return "error";

    default:
      return "unknown";
  }
}

function getSeverityLevel(severity: string): number {
  const severityType = getSeverityType(severity);
  return {
    unknown: 0,
    info: 1,
    warning: 2,
    error: 3,
  }[severityType];
}

function getSeverityColor(severity: string): string {
  const severityType = getSeverityType(severity);
  return {
    unknown: "text-warning",
    info: "text-info",
    warning: "text-warning",
    error: "text-danger",
  }[severityType];
}

interface Props {
  sipLog: SipSyslog;
}

function Syslog({ sipLog }: Props) {
  const log = sipLog.packet;
  const color = getSeverityColor(log.severity)

  return (
    <div
      className="d-flex px-1 my-0"
      style={{ fontFamily: "monospace" }}
    >
      <span
        className="text-secondary"
        style={{
          display: "inline-block",
          fontSize: "0.88rem",
          whiteSpace: "nowrap",
        }}
      >
        {sipLog.timestamp.slice(2)}:
      </span>
      <p
        className="pl-2 my-0"
        style={{ fontSize: "0.9rem", paddingTop: "0.05rem" }}
      >
        <span className={color}>{`<${log.severity}> `}</span>
        {log.payload}
      </p>
    </div>
  );
}

export { getSeverityColor, getSeverityLevel }
export default Syslog;
