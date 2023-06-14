import { formatDate } from "../helpers/formatTime";

interface Flow {
  sipFlow: Pick<FlowSIP, "sips" | "hosts" | "branches">;
  syslogs: PacketSyslog[];
}

interface FlowSIP {
  sips: PacketSIP[];
  hosts: Set<string>;
  branches: Set<string>;
  idCounter: number;
  lastTimestamp: Date | undefined;
}

// timestep in milliseconds
interface PacketSIP {
  id: number;
  method: string;
  timestep: number;
  branch: string;
  src: string;
  dst: string;
  timestamp: string;
  payload: string;
}

interface PacketSyslog {
  facility: string;
  severity: string;
  timestamp: string;
  payload: string;
}

// utilities

function getTimestamp(node: Element): Date | null {
  const timestamp = node.getAttribute("timestamp");
  if (timestamp == null) return null;
  const parsedTimestamp = new Date(timestamp);
  if (parsedTimestamp == null) return null;
  return parsedTimestamp;
}

// Parse XML flow following decap format
// Can throw an error
function parseFlow(flowDataXML: string): Flow {
  const parser = new DOMParser();
  const doc = parser.parseFromString(flowDataXML, "text/xml");

  if (doc.documentElement.nodeName == "parsererror") {
    throw new Error(doc.documentElement.textContent ?? "parse error");
  }

  const sipFlow: FlowSIP = {
    sips: [],
    hosts: new Set(),
    branches: new Set(),
    lastTimestamp: undefined,
    idCounter: 0,
  };
  const syslogs = [];

  const flow = doc.documentElement;
  for (const node of flow.children) {
    switch (node.nodeName) {
      case "sip": {
        const packet = parseSIP(node, sipFlow);
        if (packet != null) sipFlow.sips.push(packet);
        break;
      }
      case "syslog": {
        const packet = parseSyslog(node);
        if (packet != null) syslogs.push(packet);
        break;
      }
    }
  }

  return { sipFlow, syslogs };
}

function parseSIP(node: Element, flow: FlowSIP): PacketSIP | null {
  const src = node.getAttribute("src");
  const dst = node.getAttribute("dst");
  if (!src || !dst) return null;

  // keep tracks of src and dst value
  flow.hosts.add(src);
  flow.hosts.add(dst);

  // keep track of timestamp for time difference between packets
  const parsedTimestamp = getTimestamp(node);
  if (parsedTimestamp == null) return null;

  // first sip packet
  let timestep = 0;
  if (flow.lastTimestamp == undefined) {
    flow.lastTimestamp = parsedTimestamp;
  } else {
    timestep = parsedTimestamp.getTime() -
      flow.lastTimestamp.getTime();
    flow.lastTimestamp = parsedTimestamp;
  }

  const branch = node.getAttribute("branch") ?? "unknown";
  flow.branches.add(branch);
  const id = flow.idCounter;
  flow.idCounter += 1;

  return {
    id,
    timestamp: formatDate(parsedTimestamp.getTime()),
    timestep,
    branch,
    src,
    dst,
    method: node.getAttribute("method") ?? "unknown",
    payload: node.textContent ?? "",
  };
}

function parseSyslog(node: Element): PacketSyslog | null {
  const facility = node.getAttribute("facility") ?? "unknown";
  const severity = node.getAttribute("severity") ?? "unknown";

  const parsedTimestamp = getTimestamp(node);
  if (parsedTimestamp == null) return null;

  return {
    facility,
    severity,
    timestamp: formatDate(parsedTimestamp.getTime()),
    payload: node.textContent ?? "",
  }
}

export type { Flow, PacketSIP };
export { parseFlow };
