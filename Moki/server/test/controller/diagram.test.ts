import { describe, expect, it, vi } from "vitest";
import DiagramController from "@/controller/diagram.js";
import { Response } from "express";

// Utilities

const mockStream = vi.fn(() => ({
  on: vi.fn(),
  write: vi.fn(),
  end: vi.fn(),
  once: vi.fn(),
  emit: vi.fn(),
}));

function expectError(res: Response) {
  expect(res.status).toBeCalledWith(400);
  expect(res.send).toBeCalled();
}

function testValidPcapFiles(pcapMethod: Function) {
  it("valid PCAP file", () => {
    const req = { body: { urls: ["01.pcap"] } } as any;
    const res = { writeHead: vi.fn(), ...mockStream() } as any;
    const next = vi.fn();
    pcapMethod(req, res, next);
    expect(res.writeHead).toBeCalled();
    expect(next).not.toBeCalled();
  });

  it("valid multiple PCAP files", () => {
    const req = { body: { urls: ["01.pcap", "01.pcap"] } } as any;
    const res = { writeHead: vi.fn(), ...mockStream() } as any;
    const next = vi.fn();
    pcapMethod(req, res, next);
    expect(res.writeHead).toBeCalled();
    expect(next).not.toBeCalled();
  });
}

function testFileParamsError(pcapMethod: Function) {
  it("inexistent files", () => {
    const req = { body: { urls: ["bloup"] } } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    pcapMethod(req, res);
    expectError(res);
  });

  it("files not in array", () => {
    const req = { body: { urls: "01.pcap" } } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    pcapMethod(req, res);
    expectError(res);
  });

  it("no files provided", () => {
    const req = { body: {} } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    pcapMethod(req, res);
    expectError(res);
  });
}

// Download PCAPs

describe("download PCAPs", () => {
  testValidPcapFiles(DiagramController.downloadPCAPs);
  testFileParamsError(DiagramController.downloadPCAPs);
});

// Run Decap

describe("run Decap to make a sequence diagram", () => {
  testValidPcapFiles(DiagramController.decapPCAP);
  testFileParamsError(DiagramController.decapPCAP);
});

// Give back bundled HTML with sequence diagram

describe("bundled HTML containing the sequence diagram", () => {
  testValidPcapFiles(DiagramController.bundleSequenceDiagram);
  testFileParamsError(DiagramController.bundleSequenceDiagram);
});
