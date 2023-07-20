<template>
  <div v-if="createChannel" class="card">
    <div class="card-header msg_head">
      <div class="d-flex bd-highlight">
        <!-- cabeca do formulario -->
        <div class="img_cont">
          <img :src=defaultAvatar class="user_img" />
        </div>
        <div class="user_info">
          <span>{{ channelName }}</span>
        </div>
        <div class="video_cam">
          <!-- <button class="config_chat">⚙</button> -->
          <button @click="toggleStatus" class="close_chat">
            <img class="close_chat" src="src/assets/chat/close_channel.png" alt="Close" />
          </button>
        </div>
      </div>
    </div>
    <div class="card-body msg_card_body">
      <!-- corpo do formulario -->
      <form @submit.prevent="createNewChannel">
        <div class="form-group">
          <label for="channelName">*Channel Name</label>
          <input type="text" id="channelName" class="form-control" v-model="channelName" required>
        </div>
        <div class="form-group">
          <label for="channelAvatar">Avatar (Image)</label>
          <input type="file" id="channelAvatar" class="form-control" accept="image/*" @change="handleAvatarChange">
        </div>
        <div class="form-group" v-if="channelType !== 'PRIVATE'">
          <label for="channelPassword">Password</label>
          <input type="password" id="channelPassword" class="form-control" v-model="channelPassword" pattern=".{0}|.{3,}" :title='"Password must be at least 3 characters long."'>
        </div>
        <div class="form-group">
          <label for="channelType">*Channel Type</label>
          <select id="channelType" class="form-control" v-model="channelType" required>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">{{ getButtomOp() }}</button>
        <!-- Display error message if channel creation failed -->
      <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
      </form>
    </div>

    
  </div>
  <div v-else-if="channelStatus" class="card">
    <!-- Channel Messages here: -->
    <div class="card-header msg_head">
      <div class="d-flex bd-highlight">
        <div class="img_cont">
          <img :src=getChatAvatar() class="user_img" />
        </div>
        <div class="user_info">
          <span>{{ getChannelName() }}</span>
          <p>{{selected?.messages?.length + " Messages"}}</p>
        </div>
        <div class="video_cam">
          <button v-if=imOwner() @click="editChannel" class="config_chat">
            <img class="config_chat" src="src/assets/chat/edit_channel.png" alt="Edit" />
          </button>
          <button @click="toggleStatus" class="close_chat">
            <img class="close_chat" src="src/assets/chat/close_channel.png" alt="Close" />
          </button>
        </div>
      </div>
    </div>

    <div class="card-body msg_card_body" ref="scrollContainer">
      <div v-for="(message, index) in selected?.messages" :key="index">
        <div>
          <ChatContentMessages :message="message" :displayUser="index == 0 || message.user.nickname !=  selected?.messages[index - 1].user.nickname"/>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="input-group">
        <textarea v-model="text" name="" @keyup.enter="send" class="form-control type_msg" placeholder="Type your message..." style="resize: none"></textarea>
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
import ChatContentMessages from "./ChatContentMessages.vue";
import { nextTick, getCurrentInstance, watch } from "vue";
import { chatStore, type channel, type ChatMessage } from "@/stores/chatStore";
import { storeToRefs } from "pinia";
import { userStore } from "@/stores/userStore";
import type { Socket } from "socket.io-client";
import { socketClass } from "@/socket/SocketClass";
import { onMounted, onUnmounted, ref } from "vue";

const store = chatStore();
const user = userStore();
const { selected } = storeToRefs(store);

socketClass.setChatSocket({ query: { userId: user.user.id } });
const chatSocket: Socket = socketClass.getChatSocket();
console.log("Socket criado na instancia do componente: ", chatSocket);

let defaultAvatar = ref("src/assets/chat/chat_avatar.png");

//Check if the user is the owner of channel
const imOwner = () => {
  if (selected.value?.ownerId == user.user.id)
    return true;
  return false;
}

// Get channel name from chatStore
const getChannelName = () => {
  // console.log("Channel name: " + store.selected?.name);
  return store.selected?.name;
};

// Vai retornar a operacao createChannel ou Save channel consoante a operacao
const getButtomOp = () => {
  if (props.channelStatus && props.createChannel)
    return "Update Channel";
  return "Create Channel";
}

function getChatAvatar() {
  if (selected.value?.avatar == "" || !selected.value?.avatar){
    return defaultAvatar.value;
  }
  return selected.value?.avatar;
  }
  
  // Props declaration
  const props = defineProps({
    createChannel: Boolean,
    channelStatus: Boolean,
  });
  
  // Define reactive variables
  const errorMessage = ref('');
  
  // Get the current component instance
  const instance = getCurrentInstance();
  
  //form testing
  // Define reactive variables for form inputs
  const channelName = ref('');
  const channelPassword = ref('');
  const channelType = ref('PUBLIC');
  const channelAvatar = ref(null);

function editChannel() {
  instance?.emit("update-channel-status", true);
  instance?.emit("update-create-channel", true);
  channelName.value = selected.value?.name as any;
  channelPassword.value = selected.value?.password as any;
  channelType.value = selected.value?.type as any;
  if (selected.value?.avatar != "")
    defaultAvatar.value = selected.value?.avatar as any;
  else
    defaultAvatar.value = "src/assets/chat/chat_avatar.png";
}

// Emit event from the child component
const toggleStatus = () => {
  instance?.emit("update-channel-status", false);
  instance?.emit("update-create-channel", false);
  channelName.value = '';
  channelPassword.value = '';
  channelType.value = 'PUBLIC';
  defaultAvatar.value = "src/assets/chat/chat_avatar.png";
};

const text = ref();

function send() {
  console.log("Chat Emit event: ", text.value);
  const message = text.value.trim();
  if (message) {
    //store.addMessage(selected.value?.objectId, menreceived message fromsagem);
    const channelId = selected.value?.objectId;
    chatSocket.emit("message", { message: message, channelId: channelId });
    text.value = "";
    // Use nextTick to wait for the DOM to update
    nextTick(() => {
      scrollToBottom();
    });
  }
}


onMounted(() => {
  //const chatSocket: Socket = socketClass.getChatSocket();
  //console.log("Socket criado onMounted: ", chatSocket);
 /* chatSocket.on('message', (data: { channelId: string, message: string }) => {
    const { channelId, message } = data;
    
    console.log(`Received message in channel ${channelId}: ${message}`);
  });*/
  // chatSocket.on("message", (data: any) => {
  //   store.addMessage(data.objectId, data.message);
  //   scrollToBottom();
  // });
});

onUnmounted(() => {
  //socket.off("send_message");
  //chatSocket.off("message");
});

const scrollContainer = ref<HTMLElement | null>(null);

watch(
  [() => store.selected?.messages?.length, () => props.channelStatus],
  ([newMessageLength, newChannelStatus], [oldMessageLength, oldChannelStatus]) => {
    if (
      newMessageLength !== oldMessageLength ||
      (newChannelStatus && !oldChannelStatus) ||
      (scrollContainer.value && scrollContainer.value.scrollTop + scrollContainer.value.clientHeight >= scrollContainer.value.scrollHeight)
    ) {
      // Use nextTick to wait for the DOM to update
      nextTick(() => {
        scrollToBottom();
      });
    }
  }
);

function scrollToBottom() {
  const container = scrollContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}


// Define reactive variable for the base64 string
const avatarBase64 = ref('');

// Handle avatar file change
const handleAvatarChange = (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];

  if (file) {
    convertFileToBase64(file)
      .then((base64String) => {
        avatarBase64.value = base64String;
        defaultAvatar.value = URL.createObjectURL(file);
        console.log("Base64 string:", base64String);
      })
      .catch((error) => {
        console.error("Error converting file to base64:", error);
      });
  }
};

// Convert file to base64 string
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Invalid file type"));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

// Create new channel function
const createNewChannel = async () => {
  try {
    // Retrieve the form values and do something with them
    const name = channelName.value;
    const password = channelType.value == "PUBLIC" ? channelPassword.value : undefined;
    const type = password ? "PROTECTED" : channelType.value;
    const avatar = avatarBase64.value ? avatarBase64.value : ""; // This is the File object
    console.log("Avatar base64 string:", avatar);

    // Perform your logic here, e.g., make an API call to create the channel
    // You can use the values (name, password, type, avatar) as needed
    const newChannel = {
      objectId: 1,
      name: name,
      avatar: avatar,
      password: password,
      messages: [], // initialize with an empty array of messages
      users: [], // initialize with an empty array of users
      type: type
    };

    const response = await store.createChannel(newChannel);

    if (!response) {
      // Reset form inputs
      channelName.value = '';
      channelPassword.value = '';
      channelType.value = 'PUBLIC';
      channelAvatar.value = null;
      errorMessage.value = '';
      instance?.emit("update-create-channel", false);
    } else if (response == "409"){
      // Handle channel creation failure here
      errorMessage.value = 'Failed to create channel. Channel name is already taken';
      // Display error message in the form or take any other action
    } else {
      console.log("Error response: " + response);
      errorMessage.value = 'Failed to create channel. Please try again.';
    }
  } catch (error) {
    console.error(error);
    // Handle any other errors that occurred during channel creation
  }
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
