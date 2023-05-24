import { env } from "@/env";
import { Socket, io } from "socket.io-client";

const socket: Socket = io(env.SERVER_URL);

console.log("socket connected to ", env.SERVER_URL);

export default socket;
