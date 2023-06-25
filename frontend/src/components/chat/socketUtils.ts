import { Socket } from "socket.io-client";

export function emitMessage(socket: Socket, senderId: number, message: string, channelId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    socket.emit(
      "message",
      {
        senderId: senderId,
        message: message,
        channelId: channelId,
      },
      (response: any) => {
        if (response && response.event === "success") {
          resolve(response.data);
        } else {
          reject(response);
        }
      }
    );
  });
}
