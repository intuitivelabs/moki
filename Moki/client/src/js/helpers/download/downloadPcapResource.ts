import querySrv from "../querySrv";
import { saveFile } from "./saveFile";
const BASE_NAME = import.meta.env.BASE_URL;

/**
 * Download ressource linked to PCAPs
 * Can throw error
 */
async function downloadPcapResource(urls: string[], path: string) {
  const res = await querySrv(BASE_NAME + path, {
    method: "POST",
    timeout: 10000,
    credentials: "include",
    body: JSON.stringify({
      urls,
    }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "include",
    },
  });

  if (!res.ok) {
    throw new Error("File not found, You can extend storage in settings page.");
  }

  return res;
}

/**
 * Download PCAP as file
 * If multiple urls are provided, merge and give back a single PCAP
 */
async function downloadPcaps(urls: string[], filename: string) {
  try {
    const res = await downloadPcapResource(urls, "api/download/pcap");
    const blob = new Blob([await res.blob()], { type: "pcap" });
    saveFile(blob, filename);
  } catch (err) {
    if (err instanceof Error) {
      alert(`Could not download PCAPs: ${err.message} (${urls})`);
    }
  }
}

export { downloadPcapResource, downloadPcaps };
