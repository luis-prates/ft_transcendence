import { Socket, io } from "socket.io-client";

const socket: Socket = io("ws://localhost:3000");

console.log("socket connected to ws://localhost:3000 ");

export default socket;
