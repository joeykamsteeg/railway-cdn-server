import { fileTypeFromBuffer } from "file-type";

const bucket = new Bun.S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
})

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const key = url.pathname.slice(1);
    if ( key == null || key.length === 0) {
      return new Response(undefined, {
        status: 404,
        statusText: 'Not Found'
      });

    }
    const s3file = bucket.file(key);
    if (!await s3file.exists()) {
      return new Response(undefined, {
        status: 404,
        statusText: 'Not Found'
      });
    }

    const buffer = await s3file.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    const detected = await fileTypeFromBuffer(uint8);

    return new Response(buffer, {
      headers: {
        'Content-Type': detected?.mime ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      }
    })
  }
});

console.log('Server running on http://localhost:3000');
