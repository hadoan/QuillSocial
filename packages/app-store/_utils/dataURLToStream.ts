import { Readable } from "stream";

export function dataURLToStream(dataUrl: string) {
    // Split the Data URL to get the base64 part
    const base64String = dataUrl.split(',')[1];
    // Convert base64 string to a buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Indicate the end of the stream
    return stream;
}

export function getFileExtensionFromImageDataUrl(imageDataUrl: string): string | null {
    const match = imageDataUrl.match(/^data:image\/([a-zA-Z+-.]+);base64,/);
    return match ? match[1] : null;
}

