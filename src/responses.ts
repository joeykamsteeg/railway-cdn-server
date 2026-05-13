export const notFound = () => {
  return new Response(undefined, {
    status: 404,
    statusText: 'Not Found',
  });
}

export const badRequest = () => {
  return new Response( undefined, {
    status: 400,
    statusText: 'Bad Request',
  });
}

export const file = (buffer: Bun.BodyInit | null | undefined, contentType: string) => {
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
