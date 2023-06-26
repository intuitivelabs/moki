interface Flow {
  sipFlow: Pick<FlowSIP, "sips" | "hosts" | "branches">;
  syslogs: PacketSyslog[];
}

interface FlowSIP {
  sips: PacketSIP[];
  hosts: Set<string>;
  branches: Set<string>;
  idCounter: number;
}

interface PacketSIP {
  id: number;
  unixTimestamp: number;
  method: string;
  branch: string;
  src: string;
  dst: string;
  payload: string;
}

interface PacketSyslog {
  unixTimestamp: number;
  facility: string;
  severity: string;
  payload: string;
}

/*
 * first pass
 * extract data from the XML, put it in the Flow structure
 * second pass
 * sort by timestamp
 */

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

  // order sip by timestamp
  // order sylogs by timestamp
  const sortTimestamp = (
    a: { unixTimestamp: number },
    b: { unixTimestamp: number },
  ) => (a.unixTimestamp - b.unixTimestamp);

  sipFlow.sips.sort(sortTimestamp);
  syslogs.sort(sortTimestamp);

  return { sipFlow, syslogs };
}

// utilities

function getTimestamp(node: Element): Date | null {
  const timestamp = node.getAttribute("timestamp");
  if (timestamp == null) return null;
  const parsedTimestamp = new Date(timestamp);
  if (parsedTimestamp == null) return null;
  return parsedTimestamp;
}

function parseSIP(node: Element, flow: FlowSIP): PacketSIP | null {
  const srcIP = node.getAttribute("src");
  const srcPort = node.getAttribute("src-port");
  const dstIP = node.getAttribute("dst");
  const dstPort = node.getAttribute("dst-port");
  if (!srcIP || !dstIP || !srcPort || !dstPort) return null;

  const src = `${srcIP}:${srcPort}`;
  const dst = `${dstIP}:${dstPort}`;
  flow.hosts.add(src);
  flow.hosts.add(dst);

  const parsedTimestamp = getTimestamp(node);
  if (parsedTimestamp == null) return null;

  const branch = node.getAttribute("branch") ?? "unknown";
  flow.branches.add(branch);
  const id = flow.idCounter;
  flow.idCounter += 1;

  return {
    id,
    unixTimestamp: parsedTimestamp.getTime(),
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
    unixTimestamp: parsedTimestamp.getTime(),
    payload: node.textContent ?? "",
  };
}

export type { Flow, PacketSIP, PacketSyslog };
export { parseFlow };
