import z4 from "zod/v4";
import { imageFormats } from "./src/constants";
import { badRequest, file, notFound } from "./src/responses";

const bucket = new Bun.S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
})

const querySchema = z4.object({
  w: z4.coerce
    .number()
    .optional(),
  h: z4.coerce
    .number()
    .optional(),
  format: z4
    .enum(['webp', 'jpeg', 'png', 'heic', 'avif'])
    .optional(),
  fit: z4
    .enum(['inside', 'fill'])
    .optional(),
})

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const key = url.pathname.slice(1);
    if (key == null || key.length === 0) {
      return notFound();
    }

    const storedFile = bucket.file(key);
    if ( !await storedFile.exists()) {
      return notFound();
    }

    const stat = await storedFile.stat();

    try {
      if (stat.type.startsWith('image/')) {
        const query = querySchema.safeParse({
          w: url.searchParams.get('w') ?? undefined,
          h: url.searchParams.get('h') ?? undefined,
          format: url.searchParams.get('format') ?? undefined,
          fit: url.searchParams.get('fit') ?? undefined,
        });

        if (query.success === false) {
          return badRequest();
        }

        const image = storedFile.image()

        if (query.data.w) {
          image.resize(query.data.w, query.data.h ?? undefined, {
            fit: query.data.fit ?? 'inside'
          });
        }

        if (
          query.data.format &&
          typeof image[query.data.format] === 'function'
        ) {
          image[query.data.format]();
        }

        const metadata = await image.metadata();

        return file(await image.toBuffer(), query.data.format ? imageFormats[query.data.format].mime : `image/${metadata.format}`);
      }
    } catch (ex) { }

    return file(await storedFile.arrayBuffer(), stat.type ?? 'application/octet-stream')
  }
});

console.info('Server running on http://localhost:3000');
