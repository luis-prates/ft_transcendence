<template>
  <div class="chat">
    <ChatComponentTest  @update-channel-status="updateChannelStatus" :channelStatus="channel" class="chat_mensagen" />
    <ChatComponentTestList @update-channel-status="updateChannelStatus" :channelStatus="channel" class="chat_list" />
  </div>
</template>

<script setup lang="ts">
import ChatComponentTestList from "./ChatComponentTestList.vue";
import ChatComponentTest from "./ChatComponentTest.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { chatStore, type channel, type ChatMessage } from "@/stores/chatStore";
import socket from "@/socket/Socket";
import { provide } from 'vue';//channelStatus

const store = chatStore();

const showTesss = ref(false);
const showbuttom = ref(false);

function toggleTesss() {
  showTesss.value = !showTesss.value;
  showbuttom.value = !showbuttom.value;
}

onMounted(() => {
  socket.on("join_chat", (data: channel) => {
    console.log("join_chat", data);
    store.addChannel(data);
  });
});

onUnmounted(() => {
  socket.off("join_chat");
});

// Data initialization
const channel = ref(false);
// Provide the channel status to chld components
provide('channelValue', channel);
// Method to update channelStatus when emitted from child component
const updateChannelStatus = (newStatus: boolean) => {
  console.log("chamou a funcao!");
  channel.value = newStatus;
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
