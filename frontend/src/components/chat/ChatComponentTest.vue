<template>
  <div v-if="createChannel" class="card">
    <div class="card-header msg_head">
      <div class="d-flex bd-highlight">
        <!-- cabeca do formulario -->
        <div class="user_info">
          <span>New Channel</span>
        </div>
        <div class="video_cam">
          <!-- <button class="config_chat">⚙</button> -->
          <button @click="toggleStatus" class="close_chat">✖</button>
        </div>
      </div>
    </div>
    <div class="card-body msg_card_body" ref="scrollContainer">
      <!-- corpo do formulario -->
      <form @submit.prevent="createNewChannel">
        <div class="form-group">
          <label for="channelName">Channel Name</label>
          <input type="text" id="channelName" class="form-control" v-model="channelName" required>
        </div>
        <div class="form-group">
          <label for="channelAvatar">Avatar (Image)</label>
          <input type="file" id="channelAvatar" class="form-control" accept="image/*" @change="handleAvatarChange">
        </div>
        <div class="form-group">
          <label for="channelPassword">Password</label>
          <input type="password" id="channelPassword" class="form-control" v-model="channelPassword">
        </div>
        <div class="form-group">
          <label for="channelType">Channel Type</label>
          <select id="channelType" class="form-control" v-model="channelType" required>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Create Channel</button>
      </form>
    </div>

    
  </div>
  <div v-else-if="channelStatus" class="card">
    <div class="card-header msg_head">
      <div class="d-flex bd-highlight">
        <div class="img_cont">
          <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img" />
        </div>
        <div class="user_info">
          <span>Chat with jassa</span>
          <p>1767 Messages</p>
        </div>
        <div class="video_cam">
          <button class="config_chat">⚙</button>
          <button @click="toggleStatus" class="close_chat">✖</button>
        </div>
      </div>
    </div>

    <div class="card-body msg_card_body" ref="scrollContainer">
      <ChatComponentTestStart type="start" mensagem="." time="8:40 AM" />
      <ChatComponentTestStart type="end" mensagem="Ola" time="8:40 AM" />
      <ChatComponentTestStart type="start" mensagem="ehehehe" time="8:40 AM" />
      <ChatComponentTestStart type="start" mensagem="testing" time="8:40 AM" />
      <ChatComponentTestStart type="start" mensagem="lolol" time="8:40 AM" />
      <ChatComponentTestStart type="start" mensagem="scroll tes asdasdasd asd asd asd asd t asd asd asdasd asd asd asdasd asd" time="8:40 AM" />
    </div>

    <div class="card-footer">
      <div class="input-group">
        <textarea ref="text" name="" class="form-control type_msg" placeholder="Type your message..." style="resize: none"></textarea>
        <div class="input-group-append">
          <span class="input-group-text send_btn" @click="send"><i class="fas fa-location-arrow"></i>➤</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { ref } from "vue";
import ChatComponentTestStart from "./ChatComponentTestStart.vue";
import { defineProps, getCurrentInstance, watch } from "vue";
import { chatStore, type channel } from "@/stores/chatStore";

// Props declaration
const props = defineProps({
  createChannel: Boolean,
  channelStatus: Boolean,
});

// Get the current component instance
const instance = getCurrentInstance();

// Emit event from the child component
const toggleStatus = () => {
  instance?.emit("update-channel-status", false);
  instance?.emit("update-create-channel", false);
};

const text = ref();

function send() {
  console.log(text.value.value);
}

const scrollContainer = ref<HTMLElement | null>(null);

watch(
  () => scrollContainer.value,
  (newContainer) => {
    if (newContainer) {
      scrollToBottom();
    }
  }
);

function scrollToBottom() {
  const container = scrollContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

//form testing
// Define reactive variables for form inputs
const channelName = ref('');
const channelPassword = ref('');
const channelType = ref('public');
const channelAvatar = ref(null);

// Handle avatar file change
const handleAvatarChange = (event:any) => {
  const file = event.target.files[0];
  // You can handle the file as needed, e.g., upload it to a server or display a preview
  channelAvatar.value = file;
};

const store = chatStore();
let channelID = 10;
// Create new channel function
const createNewChannel = () => {
  // Retrieve the form values and do something with them
  const name = channelName.value;
  const password = channelPassword.value;
  const type = channelType.value;
  const avatar = channelAvatar.value; // This is the File object

  // Perform your logic here, e.g., make an API call to create the channel
  // You can use the values (name, password, type, avatar) as needed
  const newChannel: channel = {
    objectId: channelID++,
    name: channelName.value,
    avatar: channelAvatar.value ? channelAvatar.value : "",
    password: channelPassword.value,
    messages: [], // initialize with an empty array of messages
    users: [] // initialize with an empty array of users
  };

  store.addChannel(newChannel);


  // Reset form inputs
  channelName.value = '';
  channelPassword.value = '';
  channelType.value = 'public';
  channelAvatar.value = null;
  instance?.emit("update-create-channel", false);
};
</script>

<style lang="scss">
.form-group {
  margin-bottom: 10px;
}

label {
  color: white;
}

input[type="text"],
input[type="password"],
select {
  color: white;
  background-color: #333;
  border: 1px solid #555;
  padding: 5px;
}

button[type="submit"] {
  background-color: #007bff;
  color: white;
}
</style>
