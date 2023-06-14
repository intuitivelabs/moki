import { describe, expect, it, vi } from "vitest";
import { bundlePCAPFlow, loadPCAPs, runDecap } from "@/lib/diagram/pcap.js";
import { pipeline } from "stream/promises";
import { PassThrough } from "stream";

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
  it("valid loading", () => {
    loadPCAPs(["01.pcap"]);
  });

  it("valid merge", async () => {
    const stream = loadPCAPs(["01.pcap", "01.pcap"]);
    await pipeline(stream, new PassThrough());
  });

  testFileErrors(loadPCAPs);
});

describe("run Decap", () => {
  it("valid decap", async () => {
    const next = vi.fn() as any;
    const stream = runDecap(["01.pcap"], next);
    const ps = new PassThrough();
    ps.on("data", () => {});
    await pipeline(stream, ps);
    expect(next).not.toBeCalled();
  });

  it("valid decap merge", async () => {
    const next = vi.fn() as any;
    const stream = runDecap(["01.pcap", "01.pcap"], next);
    await pipeline(stream, new PassThrough());
    expect(next).toBeCalled();
  });

  testFileErrors(runDecap);
});

describe("bundle PCAP flow", () => {
  it("valid pcap", async () => {
    const flowStream = runDecap(["01.pcap"], vi.fn() as any);
    const next = vi.fn() as any;
    const stream = bundlePCAPFlow(flowStream, next);
    expect(next).not.toBeCalled();
    const ps = new PassThrough();
    ps.on("data", () => {});
    await pipeline(stream, ps);
  });
});
