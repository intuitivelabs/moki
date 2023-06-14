import { parseFlow } from "@/js/diagram/parseFlow";
import { expect, it } from "vitest";

it("Parse flow", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <flow>
    <sip branch="bloup-blap" method="INVITE sip:bloup" 
      src="bla" dst="blou" 
      timestamp="2023-05-26T13:35:27.583467Z">
    </sip>
    <sip branch="bloup-blap" method="BLOUP sip:bloup" 
      src="bloupbloup" dst="bla" 
      timestamp="2023-05-26T13:37:27.583467Z">
    </sip>
    <syslog facility="daemon" severity="debug" 
      timestamp="2023-06-08T17:13:29.307871Z">
      sems 5406: [Am100rel.cpp:26] DEBUG:  reliable_1xx = 3
    </syslog>
    <sip branch="bloup-blap-blop" method="100 Trying" 
      src="blou" dst="bloupbloup" 
      timestamp="2023-05-26T13:40:27.583467Z">
    </sip>
    <sip/>
    <syslog/>
    </flow>`;

  const { sipFlow, syslogs } = parseFlow(xml);

  // sip
  expect(sipFlow.branches).toEqual(new Set(["bloup-blap", "bloup-blap-blop"]));
  expect(sipFlow.hosts).toEqual(new Set(["bla", "blou", "bloupbloup"]));
  expect(sipFlow.sips.length).toEqual(3);

  expect(sipFlow.sips[0].method).toEqual("INVITE sip:bloup");
  expect(sipFlow.sips[0].timestamp).toEqual("26 May, 2023 15:35:27");
  expect(sipFlow.sips[0].timestep).toEqual(0);

  expect(sipFlow.sips[1].method).toEqual("BLOUP sip:bloup");
  expect(sipFlow.sips[1].timestep).toEqual(120000);

  expect(sipFlow.sips[2].method).toEqual("100 Trying");
  expect(sipFlow.sips[2].timestep).toEqual(180000);

  // syslogs
  expect(syslogs.length).toEqual(1);

  expect(syslogs[0].facility).toEqual("daemon");
  expect(syslogs[0].severity).toEqual("debug");
  expect(syslogs[0].timestamp).toEqual(" 8 June, 2023 19:13:29");
});
