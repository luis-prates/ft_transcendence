import { env } from "@/env";
import { Socket, io } from "socket.io-client";

class SocketClass {
	_lobbySocket: Socket | any = undefined;
	_gameSocket: Socket | any = undefined;
  constructor() {}

  //   connect() {
  //     console.log("socket connected to ", env.SERVER_URL);
  //     this._socket = io(env.SERVER_URL);
  //   }

  public getLobbySocket(): Socket {
    return this._lobbySocket;
  }

  public setLobbySocket(query: any) {
	this._lobbySocket = io(env.LOBBY_SERVER_URL, query);
  }

  public getGameSocket(): Socket {
    return this._gameSocket;
  }

  public setGameSocket(query: any) {
	this._gameSocket = io(env.GAME_SERVER_URL, query);
  }

}
// io(env.SERVER_URL);

const socketClass = new SocketClass();

export { socketClass };
//export default socketClass._socket as Socket;