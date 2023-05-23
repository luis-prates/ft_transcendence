import { Socket, io } from "socket.io-client";

const sockets: Socket = io("ws://localhost:3000");

console.log("socket connected to ws://localhost:3000 ");

class SocketSingleton {
  private socket: Socket;
  private events: string[] = [];

  constructor(socket: Socket) {
    this.socket = socket;
  }

  on(event: string, listener: (...args: any[]) => void) {
    if (this.events.includes(event)) return;
    this.socket.on(event, listener);
    this.events.push(event);
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }
  off(event: string) {
    this.socket.off(event);
    this.events = this.events.filter((e) => e !== event);
  }
}

const socket = new SocketSingleton(sockets);

export default socket;
