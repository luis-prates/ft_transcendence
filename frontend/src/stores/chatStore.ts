import { reactive, ref } from "vue";
import { defineStore } from "pinia";

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

  return { channels, selected, addChannel, showChannel, addMessage };
});
