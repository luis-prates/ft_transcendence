import { reactive } from "vue";
import { defineStore } from "pinia";

export interface message{
  id: number,
  message: string,
  nickname: string,
  time: Date,
}

export interface channel{
  name: string,
  status: string,
  avatar: string,
  password?: string,
  messages: message[],

}

export const chatStore = defineStore("chat", () => {
  const channels =  reactive<channel[]>([]);


  function addChannel(channel: channel)
  {
    channels.push(channel);
  }

  return { channels, addChannel};
});
