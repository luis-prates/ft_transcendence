import { reactive, ref } from "vue";
import { defineStore } from "pinia";

export interface message{
  id: number,
  message: string,
  nickname: string,
  time?: number,
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
  const selected = ref<channel>(undefined); 

  function addChannel(channel: channel)
  {
    channels.push(channel);
  }

  function sendMessage(message:message)
  {
    if (selected.value && message){
      message.time = Date.now();
      selected.value.messages.push(message);}
  }

  function showChannel(channel: channel)
  {
    selected.value = channel;
  }

  return { channels, selected, addChannel, showChannel, sendMessage };
});
