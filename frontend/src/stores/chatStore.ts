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
  id: any;
  avatar: string;
  nickname: string;
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

  async function showChannel(channel: channel | undefined) {
    if (channel) {
      selected.value = channel;
      try {
        const response = await axios.get(`${env.BACKEND_PORT}/chat/channels/${channel.objectId}/messages`, {
          headers: { Authorization: `Bearer ${user.access_token_server}` },
        });
        const messages = response.data;
        // Process the messages as needed
        selected.value.messages = messages;
        console.log("RESPOSTA DO SERVER: ", messages);
      } catch (error) {
        console.error(error);
      }
    } else {
      selected.value = undefined;
    }
  }

  async function getChannels() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };
    try {
      const response = await axios.get(env.BACKEND_PORT + "/chat/channels", options);
      const responseData = response.data;
      console.log("response: ", responseData);

      // Transform the response data into an array of channels
      const transformedChannels = responseData.map((channelData: any) => {
        const transformedUsers =
          channelData.users?.map((user: any) => ({
            id: user.user.id ?? "",
            avatar: user.user.avatar ?? "",
            nickname: user.user.nickname ?? "",
          })) ?? [];
        return {
          objectId: channelData.id ?? "",
          name: channelData.name ?? "",
          avatar: channelData.avatar ?? "",
          password: channelData.password ?? "",
          users: transformedUsers,
          type: channelData.type ?? "",
        };
      });

      // Update the channels array with the transformed data
      channels.splice(0, channels.length, ...transformedChannels);
      console.log("RESULTADO DO GETCHANNELS: ", channels);
      console.log("RESULTADO DOS USERS: ", channels[0].users);
    } catch (error) {
      console.error(error);
    }
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
		  getChannels();
        return false;
      } else if (response.status == 409) {
        return "409"; //409 == Conflit error (same name || same id?)
      } else {
        return "GENERIC_ERROR";
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return { channels, selected, addChannel, showChannel, addMessage, getChannels, createChannel };
});
