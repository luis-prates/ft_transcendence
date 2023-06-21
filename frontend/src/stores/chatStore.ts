import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { userStore } from "./userStore";
import { env } from "@/env";
import axios from "axios";

export interface ChatMessage {
  id: string;
  objectId: any;
  message: string;
  nickname: string;
}

export interface ChatUser {
  objectId: any;
  avatar: string;
  name: string;
}

export interface channel {
  objectId: any;
  name: string;
  avatar: string;
  password?: string;
  messages: ChatMessage[];
  users: ChatUser[];
}

export const chatStore = defineStore("chat", () => {
  const channels = reactive<channel[]>([]);
  const selected = ref<channel | undefined>(undefined);
  const user = userStore().user;

  function addChannel(channel: channel) {
    const channelSelected = channels.find((c) => c.objectId === channel.objectId);
    if (channelSelected) {
      channelSelected.messages = channel.messages;
      channelSelected.users = channel.users;
    } else channels.push(channel);
  }

  function addMessage(objectId: string, message: ChatMessage) {
    const channelSelected = channels.find((c) => c.objectId === objectId);
    if (channelSelected && message) {
      channelSelected.messages.push(message);
    }
  }

  function activateMessage(message: ChatMessage) {
    if (selected.value && message) {
      selected.value.messages.push(message);
    }
  }

  function showChannel(channel: channel | undefined) {
    selected.value = channel;
  }

  async function getChannels() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };
    await fetch
      (env.BACKEND_PORT + "chat/channels", options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("response: ", response);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // async function createChannel(channel : channel) {
  //   let body = {} as any;
  //   body.color = tableColor;
  //   body.skin = tableSkin;

  //   const options = {
  //     method: "PATCH",
  //     headers: { Authorization: `Bearer ${user.access_token_server}` },
  //     body: new URLSearchParams(body),
  //   };
  //   await fetch(env.BACKEND_PORT + "/users/update_table_skin", options)
  //   .then(async (response) => console.log(await response.json()))
  //   .catch((err) => console.error(err));
  // }

  return { channels, selected, addChannel, showChannel, addMessage, getChannels };
});
