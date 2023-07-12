import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { userStore, type User } from "./userStore";
import { env } from "@/env";
import axios from "axios";

export interface ChatMessage {
  id: string;
  content: string;
  channelId: number;
  userId: number;
  createdAt?: string;
  user: any;
}

export interface ChatUser {
  id: any;
  image: string;
  nickname: string;
  status: any;
}

export interface channel {
  objectId: any;
  name: string;
  avatar: any;
  password?: string;
  messages: ChatMessage[];
  users: ChatUser[];
  type: string;
  ownerId?: number;
  messagesLoaded?: boolean;
}


export const chatStore = defineStore("chat", () => {
  const channels = reactive<channel[]>([]);
  const selected = ref<channel | undefined>(undefined);
  const user = userStore().user;

  function addChannel(newChannel: any, message: String) {
    const channel: channel = {
      objectId: newChannel.id,
      name: newChannel.name,
      avatar: newChannel.avatar ? newChannel : "",
      password: "",
      messages: [],
      users: newChannel.users,
      type: newChannel.type,
      ownerId: newChannel.ownerId,
      messagesLoaded: false,
    };
    const channelSelected = channels.find((c) => {
      return c.objectId === channel.objectId;
    });
    if (!channelSelected) {
      channels.push(channel);
    }
    else {
      console.log("Channel already exists!");
    }
  }

  function addMessage(message: ChatMessage) {
    const channelSelected = channels.find((c) => c.objectId === message.channelId);
    console.log("channelSelected: ", channelSelected);
    console.log("ObjectId: ", message.channelId);
    if (channelSelected && message) {
      message.createdAt = new Date().toString();

    // Search for the user in channel.users
    const userChat = channelSelected.users.find((user) => user.id === message.userId);
    if (userChat) {
      message.user = userChat;
    }
      if (channelSelected.messagesLoaded == false) {
        getMessages(channelSelected);
      }
      channelSelected.messages.push(message);
      console.log("Vai adicionar a messagem ao chat");
    }
    console.log("Os channels do store: ", channels);
  }

  function activateMessage(message: ChatMessage) {
    if (selected.value && message) {
      selected.value.messages.push(message);
    }
  }

  function selectChannel(channel: channel | undefined) {
    if (channel) {
      selected.value = channel;
    } else {
      selected.value = undefined;
    }
  }

  async function getMessages(channel: channel | undefined) {
    if (channel) {
      selected.value = channel;
      try {
        if (channel.messagesLoaded == false) {
          channel.messagesLoaded = true;
          const response = await axios.get(`${env.BACKEND_PORT}/chat/channels/${channel.objectId}/messages`, {
            headers: { Authorization: `Bearer ${user.access_token_server}` },
          });
          const messages = response.data;
          // Process the messages as needed
          selected.value.messages = messages;
          console.log("RESPOSTA DO SERVER: ", messages);
        }
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
            image: user.user.image ?? "",
            nickname: user.user.nickname ?? "",
            status: user.user.status ?? "",
          })) ?? [];
          return {
            objectId: channelData.id ?? "",
            name: channelData.name ?? "",
            avatar: channelData.avatar ?? "",
            password: channelData.password ?? "",
            users: transformedUsers,
            type: channelData.type ?? "",
            messages: channelData.messages ?? [],
            messagesLoaded: false, // Messages not Initialized
            ownerId: channelData.ownerId ?? "",
        };
      });

      // Update the channels array with the transformed data
      channels.splice(0, channels.length, ...transformedChannels);
      console.log("RESULTADO DO GETCHANNELS: ", channels);
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
      avatar: channel.avatar,
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
        //store.getChannels();
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

  return { channels, selected, addChannel, getMessages, addMessage, getChannels, createChannel, activateMessage, selectChannel };
});
