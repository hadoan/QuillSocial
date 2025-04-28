// download.ts
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

async function downloadFile(fileUrl: string, outputPath: string) {
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    await writeFile(outputPath, buffer);
}

export default downloadFile;
