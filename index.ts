Bun.serve({
  port: 3000,
  async fetch(req) {
    return Response.json({
      hello: 'world'
    })
  }
});

console.log('Server running on http://localhost:3000');
