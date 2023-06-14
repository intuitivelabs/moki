/**
 * Save blob as file
 * TODO: Everything is loaded from memory, would be better streamed
 */
function saveFile(blob: Blob, filename: string) {
  const element = document.createElement("a");
  element.download = filename;
  element.href = URL.createObjectURL(blob);
  document.body.appendChild(element);
  element.click();
}

export { saveFile };
