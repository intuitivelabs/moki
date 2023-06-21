import { accessSync, createReadStream, ReadStream } from "fs";
import { config } from "@/config.js";
// import { config } from "../../config.js";
import { spawn } from "child_process";
import { PassThrough, Readable, Transform } from "stream";
import { NextFunction } from "express";
import path from "path";

/**
 * Check if files exists, return full paths
 */
function checkFiles(urls: string[]): string[] {
  if (urls.length === 0) {
    throw new Error("Need at least one PCAP files to load");
  }
  const paths = urls.map((url) => {
    return path.join(config.pcapPath, url);
  });
  for (const path of paths) {
    accessSync(path);
  }
  return paths;
}

/**
 * Load PCAPs from disk
 * If multiple files are provided, merge them together
 * Throw an error if files aren't accessible
 */
function loadPCAPs(urls: string[], next: NextFunction): Readable {
  const paths = checkFiles(urls);

  if (paths.length > 1) {
    const child = spawn(config.decapPath, ["merge", "-i", paths.join(",")]);

    child.on("error", (err) => {
      next(err);
    })
    child.stderr.on("data", (chunk) => {
      next(chunk.toString())
    })

    return ReadStream.from(child.stdout);
  }

  return createReadStream(paths.at(0) || "");
}

/**
 * Run Decap on PCAP files, see gommon/decap for more information
 * Give back the sequence diagram in XML format
 * Throw an error if files aren't accessible
 */
function runDecap(urls: string[], next: NextFunction): Readable {
  const pcapStream = loadPCAPs(urls, next);
  const child = spawn(config.decapPath);
  pcapStream.pipe(child.stdin);

  child.on("error", (err) => {
    next(err);
  });
  child.stderr.on("data", (chunk) => {
    next(chunk.toString());
  });

  return ReadStream.from(child.stdout);
}

/**
 * Inject analyzed PCAP flow into the diagram view bundled HTML
 */
function bundlePCAPFlow(flowStream: Readable, next: NextFunction): Transform {
  const htmlPath = path.join(config.diagramPath);
  const htmlStream = createReadStream(htmlPath);

  const pattern = "D-ENTRYPOINT";
  let patternIndex = 0;
  let found = false;
  let injected = false;

  const outputStream = new PassThrough();
  const injectStream = new PassThrough();
  flowStream.pipe(injectStream);

  htmlStream.on("error", (err) => {
    outputStream.destroy(err);
  });
  injectStream.on("error", (err) => {
    outputStream.destroy(err);
  });
  outputStream.on("error", (err) => {
    next(err);
  });

  const injectData = (chunk: Buffer, i: number) => {
    outputStream.push(chunk.subarray(0, i + 1));
    htmlStream.pause();

    injectStream.on("data", (chunk) => {
      outputStream.push(chunk);
    });

    injectStream.on("end", () => {
      outputStream.push(chunk.subarray(i + 1));
      htmlStream.resume();
      injected = true;
    });
  };

  htmlStream.on("data", async (chunk: Buffer) => {
    if (!injected) {
      for (let i = 0; i < chunk.length; i++) {
        const symbol = String.fromCharCode(chunk[i]);

        // inject flow data
        if (found && symbol == "`") {
          injectData(chunk, i);
          return;
        }

        // search pattern where data will be injected
        if (!found && symbol == pattern[patternIndex]) {
          patternIndex += 1;
          if (patternIndex >= pattern.length - 1) found = true;
        } else {
          patternIndex = 0;
        }
      }
    }
    outputStream.write(chunk);
  });

  htmlStream.on("end", () => {
    outputStream.end();
  });

  return outputStream;
}

export { bundlePCAPFlow, loadPCAPs, runDecap };
