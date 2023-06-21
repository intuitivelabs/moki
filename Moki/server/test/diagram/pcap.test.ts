import { describe, expect, it, vi } from "vitest";
import { bundlePCAPFlow, loadPCAPs, runDecap } from "@/lib/diagram/pcap.js";
import { pipeline } from "stream/promises";
import { PassThrough } from "stream";

function emptyPassThrough() {
  const ps = new PassThrough();
  ps.on("data", () => {});
  return ps;
}

async function testStreamMethod(
  method: Function,
  params: Object,
  shouldFail = false,
  onEnd: Function | undefined = undefined,
) {
  const next = vi.fn() as any;
  const stream = method(params, next, onEnd);
  await pipeline(stream, emptyPassThrough());
  if (shouldFail) expect(next).toBeCalled();
  else expect(next).not.toBeCalled();
}

function testFilePCAPs(pcapMethod: Function) {
  it("valid pcap file", async () => {
    await testStreamMethod(pcapMethod, ["01.pcap"]);
  });

  it("valid multiple pcap files", async () => {
    await testStreamMethod(pcapMethod, ["01.pcap", "02.pcap"]);
  });
}

function testFileErrors(pcapMethod: Function) {
  it.fails("inexistent file", () => {
    pcapMethod(["bloup"]);
  });

  it.fails("inexistent files", () => {
    pcapMethod(["01.pcap", "bloup"]);
  });

  it.fails("inexistent files", () => {
    pcapMethod(["bloup", "blap"]);
  });

  it.fails("no files", () => {
    pcapMethod([]);
  });
}

describe("load PCAPs", () => {
  it("invalid pcap file", () =>
    new Promise<void>((done) => {
      const onEnd = vi.fn(() => done());
      testStreamMethod(loadPCAPs, ["invalid.pcap", "01.pcap"], true, onEnd);
    }));

  testFilePCAPs(loadPCAPs);
  testFileErrors(loadPCAPs);
});

describe("run Decap", () => {
  it("invalid pcap file", () =>
    new Promise<void>((done) => {
      const onEnd = vi.fn(() => done());
      testStreamMethod(runDecap, ["invalid.pcap"], true, onEnd);
    }));

  it("invalid merged pcap files", async () =>
    new Promise<void>((done) => {
      const onEnd = vi.fn(() => done());
      testStreamMethod(runDecap, ["01.pcap", "invalid.pcap"], true, onEnd);
    }));

  testFilePCAPs(runDecap);
  testFileErrors(runDecap);
});

describe("bundle PCAP flow", () => {
  it("valid pcap", async () => {
    const flowStream = runDecap(["01.pcap"], vi.fn() as any);
    await testStreamMethod(bundlePCAPFlow, flowStream);
  });

  it("valid multiple pcaps", async () => {
    const flowStream = runDecap(["01.pcap", "01.pcap"], vi.fn() as any);
    await testStreamMethod(bundlePCAPFlow, flowStream);
  });
});
