/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ROOM: DurableObjectNamespace;
}

// Worker

export default {
  async fetch(request: Request, env: Env) {
    // 本来は部屋ごとにユニークな名前をつける
    const id = env.ROOM.idFromName("test");
    const obj = env.ROOM.get(id);

    //Durable Objectのfetchメソッドを呼び出す
    return await obj.fetch(request);
  },
};

// Durable Object

export class Room {
  state: DurableObjectState;
  sockets: WebSocket[] = [];

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  // Handle HTTP requests from clients.
  async fetch(request: Request) {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // @ts-expect-error accept() が定義されてないらしい
    server.accept();

    this.sockets.push(server);

    const num = this.sockets.length;
    this.broadcast(`${num} connections are opened`);

    server.addEventListener("message", (message) => {
      console.log("received from client: ", message.data);
      this.broadcast(message.data, server);
    });
    server.addEventListener("close", () => {
      console.log("closed");
      this.sockets = this.sockets.filter((s) => s !== server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  broadcast(message: string, without?: WebSocket) {
    for (const webSocket of this.sockets) {
      if (webSocket !== without) {
        webSocket.send(message);
      }
    }
  }
}
