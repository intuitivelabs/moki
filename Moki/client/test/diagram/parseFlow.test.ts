import { parseFlow } from "@/js/diagram/parseFlow";
import { expect, it } from "vitest";
import xml from "./flow.xml?raw";

it("Parse flow", () => {
  const { sipFlow, syslogs } = parseFlow(xml);

  // sip
  expect(sipFlow.branches).toEqual(new Set(["bloup-blap", "bloup-blap-blop"]));
  expect(sipFlow.hosts).toEqual(
    new Set([
      "bloupbloup:1020",
      "bla:1020",
      "bla:3040",
      "blou:2010",
      "bloupbloup:3040",
    ]),
  );
  expect(sipFlow.sips.length).toEqual(3);

  expect(sipFlow.sips[0].method).toEqual("INVITE sip:bloup");
  expect(sipFlow.sips[0].unixTimestamp).toEqual(1685108127583);
  expect(sipFlow.sips[1].method).toEqual("BLOUP sip:bloup");
  expect(sipFlow.sips[2].method).toEqual("100 Trying");

  // syslogs
  expect(syslogs.length).toEqual(2);

  expect(syslogs[0].facility).toEqual("daemon");
  expect(syslogs[0].severity).toEqual("debug");
  expect(syslogs[0].unixTimestamp).toEqual(1685108426307);
});
