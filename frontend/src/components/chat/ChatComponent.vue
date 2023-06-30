<template>
  <div class="chat">
    <ChatContent  @update-channel-status="updateChannelStatus" :channelStatus="channel" @update-create-channel="updateCreateChannel" :createChannel="createChannel" class="chat_mensagen" />
    <ChatList @update-channel-status="updateChannelStatus" :channelStatus="channel" @update-create-channel="updateCreateChannel" :createChannel="createChannel" class="chat_list" />
  </div>
</template>

<script setup lang="ts">
import ChatList from "./ChatList.vue";
import ChatContent from "./ChatContent.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { chatStore, type channel, type ChatMessage } from "@/stores/chatStore";
import { userStore } from "@/stores/userStore";
import { socketClass } from "@/socket/SocketClass";
import { provide } from 'vue';//channelStatus
import type { Socket } from "socket.io-client";
//import { send } from "process";
//import { AxiosHeaders } from "axios";

const store = chatStore();
const user = userStore();

const showTesss = ref(false);
const showbuttom = ref(false);

let socket: Socket = socketClass.getChatSocket();

function toggleTesss() {
  showTesss.value = !showTesss.value;
  showbuttom.value = !showbuttom.value;
}

onMounted(() => {
  if (!socket)
  {
    socketClass.setChatSocket({ query: { userId: user.user.id } });
  }
  socket = socketClass.getChatSocket();  
  store.getChannels();

 /* socket.on("join_chat", (data: channel) => {
    console.log("join_chat", data);
    store.addChannel(data);
  });*/
  socket.on('message', (data: { channelId: number, senderId: number, message: string }) => {
    const { channelId, senderId, message } = data;
    
    console.log(`Received message from ${senderId} in channel ${channelId}: ${message}`);
    store.addMessage(channelId, {id: "1", objectId: 1, message: message, nickname: "user_" + senderId.toString()})
    console.log("Channels: do socket ", store.channels);
    //store.addMessage(channelId, message);
  });
});

onUnmounted(() => {
  socket.off("message");
});

// Data initialization
const channel = ref(false);
const createChannel = ref(false);

// Provide the channel status to chld components
provide('channelValue', channel);
// Method to update channelStatus when emitted from child component
const updateChannelStatus = (newStatus: boolean) => {
  console.log("chamou a funcao!");
  channel.value = newStatus;
};

// Method to update createChannel var when emitted from child component
const updateCreateChannel = (newStatus: boolean) => {
  console.log("chamou a funcao!");
  createChannel.value = newStatus;
};
</script>

<style scoped lang="scss">

.chat
{
    bottom: 0px;
    position: absolute;
    padding: 0px;
    margin: 0px;
    display: flex;
    flex-direction: row;
    pointer-events: none;
}
.chat_mensagen {
  flex-grow: 1;
  margin-right: 10px;
}

.chat_list {
  width: 40%;
  max-width: 250px;
  margin-left: auto;
}
</style>
