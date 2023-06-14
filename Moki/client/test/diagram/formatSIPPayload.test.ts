import { formatSIPPayload } from "@/js/diagram/formatPayloadSIP";
import { PacketSIP } from "@/js/diagram/parseFlow";
import { expect, it } from "vitest";

it("Format SIP Payload", () => {
  const packet = {
    method: "INVITE",
    payload: `
Call-ID: bliup@bloup
CSeq: 213 INVITE
Content-Length: 232

o=bloup
c=bla
awdc=bloup
m=audio`,
  } as PacketSIP;
  expect(formatSIPPayload(packet)).toMatchSnapshot()
});
