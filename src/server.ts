export class Server {

  listen() {
    return Bun.serve({
      port: 3000,
      async fetch(req) {
        return Response.json({
          hello: 'world'
        })
      }
    })
  }
}
