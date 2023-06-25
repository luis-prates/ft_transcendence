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
  type: string;
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
    await axios
      .get(env.BACKEND_PORT + "/chat/channels", options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("response: ", response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function createChannel(channel: channel) {
    const createChannelDto = {
      name: channel.name,
      usersToAdd: channel.users,
      channelType: channel.type,
      password: channel.password ? channel.password : undefined,
    };
    console.log("createChannelDto:", createChannelDto);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token_server}`,
      },
      body: JSON.stringify(createChannelDto),
    };
    try {
      const response = await fetch(`${env.BACKEND_PORT}/chat/channels`, options);
      const data = await response.json();
      console.log("CREATE CHANNEL:", data);

      // Check if the response indicates a successful operation
      if (response.ok) {
        // Return any relevant data here if needed
        return false;
      } else if (response.status == 409) {
        return "409";
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return { channels, selected, addChannel, showChannel, addMessage, getChannels, createChannel };
});
