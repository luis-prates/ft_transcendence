<template>
  <div class="parent-container">
    <div class="card mb-sm-3 mb-md-0 contacts_card">
      <button class="hide_chat" @click="toggleChat">{{buttonString}}</button>
      <div class="card-header">
        <div class="input-group">
          <input type="text" placeholder="Search..." name="" class="form-control search" />
          <div class="input-group-prepend">
            <span class="input-group-text search_btn" @click="createChannel">+<i class="fas fa-search"></i></span>
          </div>
        </div>
      </div>
      <div v-if="channelStatus == false" class="card-body contacts_body">
        <!-- Add chat list items here -->
        <div class="chat_filter">
          <button class="chat_filter_button">💬</button>
          <button class="chat_filter_button">🌐</button>
        </div>
        <ul class="contacts" @click="toggleStatus">
          <u v-for="channel in store.channels">
            <ChatListChannels :channel="channel" @click="selectChannel(channel)" />
          </u>
        </ul>
      </div>
      <div v-else class="card-body contacts_body">
        <!-- Users inside the chat selected -->
        <ul class="contacts">
          <li>
            <u v-for="(user, index) in selected?.users" :key="index">
              <ChatListUsers :user="user" />
            </u>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import ChatListChannels from "./ChatListChannels.vue";
import ChatListUsers from "./ChatListUsers.vue";
import { chatStore, type channel } from "@/stores/chatStore";
import "./App.css";
import { defineProps, ref, getCurrentInstance, type WebViewHTMLAttributes } from "vue";
import { onMounted } from 'vue';
import { storeToRefs } from "pinia";

const store = chatStore();
const { selected } = storeToRefs(store);

function selectChannel(channel: channel) {
  instance?.emit("update-create-channel", false);
  store.showChannel(channel);
}

//Creating a new channel:
const createChannel = () => {
  if (!props.channelStatus) {
    console.log("Vai criar um novo channel");
    instance?.emit("update-create-channel", true);
  }
  else {
    console.log("Vai adicionar um novo user ao channel");
  }
  //instance?.emit("update-channel-status", newStatus);
};

//Testing the number of cahnnels created//Remover depois do backend devolver o objectId do channel em questao
let maxObjectId = 0;

//Buttom + addChannel
function addChannel() {
  maxObjectId++;
  const newChannel: channel = {
    objectId: maxObjectId,
    name: "New Channel",
    avatar: "",
    password: "",
    messages: [], // initialize with an empty array of messages
    users: [] // initialize with an empty array of users
  };

  store.addChannel(newChannel);
}

// Props declaration
const props = defineProps({
  channelStatus: Boolean,
});

// Get the current component instance
const instance = getCurrentInstance();

// Emit event from the child component
const toggleStatus = () => {
  const newStatus = !props.channelStatus;
  instance?.emit("update-channel-status", newStatus);
};

// Variável para controlar o estado do chat
let isChatHidden = true;

onMounted(() => {
  toggleChat();
  // addChannel();
});

const buttonString = ref("⇑"); // Set initial button text

// Função para alternar o estado do chat
const toggleChat = () => {
  const chatElement = document.querySelector(".chat") as any;

  if (isChatHidden) {
    // Mostrar o chat
    if (props.channelStatus) {
      instance?.emit('update-channel-status', false);
    }
    chatElement.style.bottom = "-57%";
  } else {
    // Ocultar o chat
    chatElement.style.bottom = "0%";
  }
  // Update the button text based on isChatHidden
  buttonString.value = isChatHidden ? "⇑" : "⇓";
  isChatHidden = !isChatHidden;//
  instance?.emit('update-create-channel', false);
};

</script>

<style>
.parent-container {
  height: 100%;
  display: flex;
  justify-content: flex-end;
  pointer-events: all;
}

.contacts_card {
  flex: 1;
  max-height: 100%; /* Set the desired maximum height for the contacts card */
  overflow-y: auto;
}
</style>