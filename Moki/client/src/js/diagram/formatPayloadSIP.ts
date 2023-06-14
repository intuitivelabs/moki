import { PacketSIP } from "./parseFlow";

function escapeHTML(text: string) {
  const element = document.createElement("div");
  const textNode = document.createTextNode(text);
  element.appendChild(textNode);
  return element.innerHTML;
}

function formatSIPPayload(packet: PacketSIP): string {
  // remove first line
  const lines = packet.payload.split("\n");
  lines.shift();
  let formatted = `<div><b>${packet.method}</b></div>`;

  // first part: headers
  for (let i = 0; i < lines.length; i++) {
    const line = lines.shift();
    if (!line || line.length === 0 || line === "\r") {
      lines.shift();
      break;
    }
    // split header name and value
    const index = line.indexOf(":");
    if (index === -1) {
      formatted += `<div><span className="value">${line}</span></div>`;
    } else {
      const [name, value] = [line.slice(0, index), line.slice(index + 1)];
      formatted += `<div>
        <span className="key"><b>${name}: </b></span>
        <span className="value">${escapeHTML(value)}</span>
      </div>`;
    }
  }

  formatted += "<br />";
  // second part: payload
  for (const line of lines) {
    // syntax highlight
    const highlight = /^c=|^m=/.test(line);
    formatted += `<div>
      <span className="value" style=${highlight ? "color:green" : ""}>
        ${line}
      </span></div>`;
  }

  return formatted;
}

export { formatSIPPayload };
