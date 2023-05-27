<template>
  <div class="chat">
    <div class="header">
      <img class="avatar" :src="selected?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'" />
      <div class="info">
        <div class="name">{{ selected?.name }}</div>
        <!-- <div class="status">{{ selected?.status }}</div> -->
      </div>
      <div class="options">
        <button style="background-color: transparent; color: #525252; font-size: x-large">⋮</button>
        <button @click="store.showChannel(undefined)" style="background-color: transparent; color: #525252; font-size: x-large">⨯</button>
      </div>
    </div>
    <div class="messages" ref="scroll">
      <div v-for="(message, index) in selected?.messages" :key="index" class="message">
        <!-- <div class="avatar"></div> -->
        <div class="content">
          <div class="name">{{ message.nickname }}</div>
          <div class="text">{{ message.message }}</div>
        </div>
      </div>
    </div>
    <div class="input">
      <input @change="sendMessage" v-model="messageText" placeholder="Say something..." />
      <button @click="sendMessage" style="background-color: transparent; color: #525252; font-size: x-large">➤</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { chatStore, type ChatMessage } from "@/stores/chatStore";
import { userStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import socket from "@/socket/Socket";

const store = chatStore();
const user = userStore();
const messageText = ref("");
const { selected } = storeToRefs(store);
const scroll = ref<HTMLDivElement>();

function sendMessage() {
  console.log(messageText.value);
  if (messageText.value) {
    const mensagem: ChatMessage = { objectId: user.user.id, id: user.user.id + "_" + Date.now(), message: messageText.value.trim(), nickname: "user_" + user.user.id };
    store.addMessage(selected.value?.objectId, mensagem);
    socket.emit("send_message", { message: mensagem, objectId: selected.value?.objectId });
    setTimeout(function () {
      if (scroll.value) scroll.value.scrollTop = scroll.value.scrollHeight - scroll.value.clientHeight;
    }, 10);
  }
  messageText.value = "";
}

onMounted(() => {
  socket.on("send_message", (data: any) => {
    console.log("send_message", data);
    store.addMessage(data.objectId, data.message);
    setTimeout(function () {
      if (scroll.value) scroll.value.scrollTop = scroll.value.scrollHeight - scroll.value.clientHeight;
    }, 10);
  });
});

onUnmounted(() => {
  socket.off("send_message");
});
</script>

<style scoped lang="scss">
.chat {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 4px 0px 0px 0px;
}

.hidden {
  display: none;
}

.header {
  background-color: #ececec;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 5px;
  border-bottom: #d4d4d4;
  border-bottom-style: ridge;
  border-bottom-width: 1px;
  background-color: #ececec;
  border-radius: 10px 0px 0px 0px;
}
.options {
  position: absolute;
  right: 1%;
}

.avatar {
  background-color: #ddd;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  color: #444653;
  font-size: 18px;
  font-weight: bold;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 70%;
}

.status {
  font-size: 14px;
}

.messages {
  overflow-y: scroll;
  flex-grow: 1;
  padding: 10px;
}

.message {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
  .content {
    background-color: #fff;
    border-radius: 5px;
    padding: 10px;
    width: 100%;
    height: 100%;
  }
}

.name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.text {
  font-size: 16px;
  overflow: hidden;
  word-wrap: break-word; /* allow long words to break onto multiple lines */
  white-space: pre-wrap;
}

.input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  border-top: #d4d4d4;
  border-top-style: ridge;
  border-top-width: 1px;
  background-color: #ececec;
}

input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 5px;
  border: none;
  font-size: 16px;
}

button {
  background-color: #444653;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  padding: 10px;
  cursor: pointer;
}
</style>
