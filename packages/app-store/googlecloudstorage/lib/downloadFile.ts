// download.ts
import { writeFile } from "fs/promises";
import fetch from "node-fetch";

async function downloadFile(fileUrl: string, outputPath: string) {
  const response = await fetch(fileUrl);
  const buffer = await response.buffer();
  await writeFile(outputPath, buffer);
}

export default downloadFile;
