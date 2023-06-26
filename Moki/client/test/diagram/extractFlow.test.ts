import { parseFlow } from "@/js/diagram/parseFlow";
import { extractFlow } from "@/js/diagram/extractFlow";
import { expect, it } from "vitest";
import xml from "./flow.xml?raw";

// +2 hours because of Berlin timezone
it("Extract Flow", () => {
  const flow = parseFlow(xml);
  const it = extractFlow(flow, flow.sipFlow.sips, flow.sipFlow.hosts);

  expect(it.next()).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "sip": {
          "packet": {
            "branch": "bloup-blap",
            "dst": "blou:2010",
            "id": 1,
            "method": "INVITE sip:bloup",
            "payload": "
      ",
            "src": "bla:3040",
            "unixTimestamp": 1685108127583,
          },
          "timestamp": "26 May, 2023 15:35:27",
        },
        "syslog": {
          "packets": [],
          "severity": "unknown",
        },
        "unixTimestamp": 1685108127583,
      },
    }
  `);
  expect(it.next()).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "sip": {
          "packet": {
            "branch": "bloup-blap",
            "dst": "bla:1020",
            "id": 0,
            "method": "BLOUP sip:bloup",
            "payload": "
      ",
            "src": "bloupbloup:1020",
            "unixTimestamp": 1685108247583,
          },
          "timestamp": "+ 120s",
        },
        "syslog": {
          "packets": [
            {
              "packet": {
                "facility": "daemon",
                "payload": "
        sems 5406: [Am100rel.cpp:26] DEBUG:  reliable_1xx = 3
      ",
                "severity": "debug",
                "unixTimestamp": 1685108426307,
              },
              "timestamp": "+ 179s",
            },
          ],
          "severity": "debug",
        },
        "unixTimestamp": 1685108247583,
      },
    }
  `);
  expect(it.next()).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "sip": {
          "packet": {
            "branch": "bloup-blap-blop",
            "dst": "bloupbloup:3040",
            "id": 2,
            "method": "100 Trying",
            "payload": "
      ",
            "src": "blou:2010",
            "unixTimestamp": 1685108427583,
          },
          "timestamp": "+ 180s",
        },
        "syslog": {
          "packets": [
            {
              "packet": {
                "facility": "daemon",
                "payload": "
        sems 5406: [Am100rel.cpp:26] DEBUG:  reliable_1xx = 1
      ",
                "severity": "debug",
                "unixTimestamp": 1685108493307,
              },
              "timestamp": "+ 66s",
            },
          ],
          "severity": "debug",
        },
        "unixTimestamp": 1685108427583,
      },
    }
  `);
});
