import { env } from "@/env";
import { Socket, io } from "socket.io-client";

class SocketClass {
  _socket: Socket | any = undefined;
  constructor() {}

  //   connect() {
  //     console.log("socket connected to ", env.SERVER_URL);
  //     this._socket = io(env.SERVER_URL);
  //   }

  get socket(): Socket {
    return this._socket || io(env.SERVER_URL);
  }
}
// io(env.SERVER_URL);

const socketClass = new SocketClass();

export { socketClass };
export default socketClass.socket as Socket;
