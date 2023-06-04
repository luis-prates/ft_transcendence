<template>
  <div style="width: 100%; height: 100%;">
    <!-- <button class="hiddenbuttom" :class="{ active: showbuttom }" @click="toggleTesss">⇕</button> -->
    <!-- <div class="tesss" :class="{ active: showTesss }"> -->
      <!-- <div style="width: 65%"> -->
        <ChatMessageComponent class="chat_mensagen" ></ChatMessageComponent>
      <!-- </div> -->
      <ChatListComponent class="chat_list"></ChatListComponent>
    <!-- </div>   -->
</div>
</template>

<script setup lang="ts">
import ChatListComponent from "./ChatListComponent.vue";
import ChatMessageComponent from "./ChatMessageComponent.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { chatStore, type channel, type ChatMessage } from "@/stores/chatStore";
import socket from "@/socket/Socket";

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
</script>

<style scoped lang="scss">

.chat_mensagen
{
  width: 100%;
  left: 0px;
  padding: 0px;
  margin: 0px;
  position: inherit;
}

.chat_list
{
  max-width: 200px;
  width: 40%;
  right: 0px;
  padding: 0px;
  margin: 0px;
  position: inherit;

}
</style>
