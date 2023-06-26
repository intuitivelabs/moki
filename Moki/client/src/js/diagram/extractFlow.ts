import { formatDate, formatSmallDuration } from "../helpers/formatTime";
import { getSeverityLevel } from "./Syslog";
import { Flow, PacketSIP, PacketSyslog } from "./parseFlow";

// SIP affiliated syslog
interface SipSyslog {
  packet: PacketSyslog;
  timestamp: string;
}

interface ExtractedPacket {
  unixTimestamp: number;
  sip: {
    packet: PacketSIP;
    timestamp: string;
  };
  syslog: {
    packets: SipSyslog[];
    severity: string;
  };
}

/**
 * Flow iterator
 * Give back sip packet one by one corresponding syslogs during this timeframe
 */
function* extractFlow(
  flow: Flow,
  sipPackets: PacketSIP[],
  activeHostsSet: Set<string>,
): Generator<ExtractedPacket> {
  const syslogs = flow.syslogs;

  let syslogIndex = 0;
  let lastTimestamp = 0;
  let nextTimestamp: number | undefined = 0;

  for (let i = 0; i < sipPackets.length; i++) {
    const sip = sipPackets[i];

    const extracted: ExtractedPacket = {
      unixTimestamp: sip.unixTimestamp,
      sip: {
        packet: sip,
        timestamp: "unkown",
      },
      syslog: {
        packets: [],
        severity: "",
      },
    };

    nextTimestamp = sipPackets.at(i + 1)?.unixTimestamp;

    // sip timestamp / time diff
    if (lastTimestamp === 0) {
      // first packet
      lastTimestamp = sip.unixTimestamp;
      extracted.sip.timestamp = formatDate(sip.unixTimestamp);
    } else {
      // subsequent packet
      const timeDiff = Math.max(sip.unixTimestamp - lastTimestamp, 0);
      lastTimestamp = sip.unixTimestamp;
      extracted.sip.timestamp = formatSmallDuration(timeDiff);
    }

    // get affiliated syslogs
    const sipSyslogs: SipSyslog[] = [];
    let maxLevel = 0;
    let severity = "unknown";

    while (syslogIndex < syslogs.length) {
      const syslog = syslogs[syslogIndex];
      if (nextTimestamp && syslog.unixTimestamp >= nextTimestamp) {
        break;
      }

      const level = getSeverityLevel(syslog.severity);
      if (level > maxLevel) {
        maxLevel = level;
        severity = syslog.severity;
      }

      const timeDiff = Math.max(syslog.unixTimestamp - lastTimestamp, 0);
      sipSyslogs.push({
        packet: syslog,
        timestamp: formatSmallDuration(timeDiff),
      });

      syslogIndex += 1;
    }

    // populate syslogs
    extracted.syslog.packets = sipSyslogs;
    extracted.syslog.severity = severity;

    yield extracted;
  }
}

export type { ExtractedPacket, SipSyslog };
export { extractFlow };
