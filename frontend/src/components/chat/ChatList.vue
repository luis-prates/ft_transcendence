<template>
  <div class="parent-container">
    <div class="card mb-sm-3 mb-md-0 contacts_card">
      <button class="hide_chat" @click="toggleChat">{{buttonString}}</button>
      
      <div v-if="channelStatus == false" class="card-body contacts_body">
        <div class="card-header">
          <div class="input-group">
            <input id="searchChannel" type="text" placeholder="Search..." name="" class="form-control search" v-model="searchTerm" @input="handleSearch"/>
            <div class="input-group-prepend">
              <span class="input-group-text search_btn" @click="createChannel">+<i class="fas fa-search"></i></span>
            </div>
          </div>
        </div>
        <!-- Add chat list items here -->
        <div class="chat_filter">
          <button id="dmButton" class="chat_filter_button" @click="changeFilter('dm')">💬</button>
          <button id="insideButton" class="chat_filter_button" @click="changeFilter('inside')">🗪</button>
          <button id="allButton" class="chat_filter_button" @click="changeFilter('all')">🌐</button>
        </div>
        <ul class="contacts" @click="toggleStatus">
          <li v-for="channel in channelsFilters">
            <ChatListChannels :channel="channel" @click="selectChannel(channel)" />
            <div class="menu-container" v-if="isMenuOpen">
              <Menus @toggleMenu="toggleMenu" @openChannel="openChannel" :channel="channel" @update-channel-status="updateChannelStatus" @update-create-channel="updateCreateChannel" v-show="selected?.objectId == channel.objectId" />
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="card-body contacts_body">
        <div class="card-header">
          <div class="input-group">
            <input id="searchUser" type="text" placeholder="Search..." name="" class="form-control search" v-model="searchUser" @input="handleSearchUser"/>
            <div class="input-group-prepend">
              <span class="input-group-text search_btn" @click="createChannel">+<i class="fas fa-search"></i></span>
            </div>
          </div>
        </div>
        <!-- Users inside the chat selected -->
        <ul class="contacts">
          <li v-for="(user, id) in selected?.users" :key="id">
            <ChatListUsers :user="user" @click="selectUser(user)" />
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
import { chatStore, type channel, type ChatUser } from "@/stores/chatStore";
import "./App.css";
import { ref, getCurrentInstance, type WebViewHTMLAttributes, reactive, onUnmounted } from "vue";
import { onMounted } from 'vue';
import { storeToRefs } from "pinia";
import Menus from './Menu.vue';
import { Game, Lobby } from "@/game";
import { Profile } from "@/game/Menu/Profile";
import { userStore } from "@/stores/userStore";
import { YourProfile } from "@/game/Menu/YourProfile";

const store = chatStore();
const { selected } = storeToRefs(store);
const isMenuOpen = ref(false);
const channelsFilters = ref([] as channel[]);
const searchTerm = ref('');
const usersFilters = ref([] as ChatUser[]);
const searchUser = ref('');
let isChatFilterType = "inside";

const saveChannel = () => {
  usersFilters.value = selected?.value.users.value;
  console.log("USERS CHANEL", usersFilters);
};

const handleSearch = () => {
  getFilteredChannels();
};

//TODO SEARCH USERS
const handleSearchUser = () => {
  if (!usersFilters.value)
    return;
  console.log("USERS CHANEL", usersFilters.value)

  const searchBar = document.getElementById('searchUser') as HTMLInputElement;
  const searchValue = searchBar.value.toLowerCase();
  usersFilters.value = selected?.value.users.value.filter((user: ChatUser) => {
    const userName = user.nickname.toLowerCase();
    return userName.includes(searchValue);
  });
  console.log("USER SEARCH;", usersFilters)
  return usersFilters;
};

function changeFilter (filter: string)
{
  isChatFilterType = filter;
  
  const dmButton = document.getElementById('dmButton') as HTMLElement;
  const insideButton = document.getElementById('insideButton') as HTMLElement;
  const allButton = document.getElementById('allButton') as HTMLElement;

  dmButton.style.backgroundColor = isChatFilterType == "dm" ? "rgba(17, 9, 9, 0.2)" : "transparent";
  insideButton.style.backgroundColor = isChatFilterType == "inside" ? "rgba(17, 9, 9, 0.2)" : "transparent";
  allButton.style.backgroundColor = isChatFilterType == "all" ? "rgba(17, 9, 9, 0.2)" : "transparent";

  getFilteredChannels();
}

function getFilteredChannels()
{
  if (isChatFilterType == "dm")
  {
    channelsFilters.value = store.channels.filter((channel: channel) => channel.type == "DM" && channel.users.some((user) => user.id === userStore().user.id));    
  }
  else if (isChatFilterType == "inside") //need verific i'm inside
  {
    channelsFilters.value = store.channels.filter((channel: channel) => (channel.type == "PROTECTED" || channel.type == "PRIVATE" || channel.type == "PUBLIC") && channel.users.some((user) => user.id == userStore().user.id)); 
  }
  else //need verific i'm inside
  {
    channelsFilters.value = store.channels.filter((channel: channel) => (channel.type == "PROTECTED" || channel.type == "PUBLIC") && !channel.users.some((user) => user.id == userStore().user.id));    
  }
  const searchBar = document.getElementById('searchChannel') as HTMLInputElement;
  const searchValue = searchBar.value.toLowerCase();
  channelsFilters.value = channelsFilters.value.filter((channel: channel) => {
  const channelName = channel.name.toLowerCase();
  return channelName.includes(searchValue);
  });
  console.log("FILTRO COM SEARCH", channelsFilters);

  return channelsFilters;
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const selectChannel = (channel: channel) => {
  //instance?.emit("update-create-channel", false);
  if (selected.value != channel && isMenuOpen.value) {
    toggleMenu();
  }
  store.selectChannel(channel);
  toggleMenu();
}

let isProfileOpen: boolean = false;

const selectUser = (user: ChatUser) => {
  if (isProfileOpen)
    return;

  isProfileOpen = true;
  //instance?.emit("update-create-channel", false);
  let profile;
  if (userStore().user.id == user.id)
    profile = new YourProfile(Lobby.getPlayer());
  else
    profile = new Profile(user.id);
  
  profile.show((value) => {
		if (value == "EXIT") {
      isProfileOpen = false;
		}
	});
  /*if (selected.value != user && isMenuOpen.value) {
    toggleMenu();
  }
  store.selectUser(user);
  toggleMenu();*/
}


const openChannel = (channel: channel) => {
  store.getMessages(channel);
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

// Method to update channelStatus when emitted from child component
const updateChannelStatus = (newStatus: boolean) => {
  instance?.emit('update-channel-status', newStatus);
};

// Method to update createChannel var when emitted from child component
const updateCreateChannel = (newStatus: boolean) => {
  instance?.emit("update-create-channel", newStatus);
};

//Testing the number of cahnnels created//Remover depois do backend devolver o objectId do channel em questao
// let maxObjectId = 0;

// //Buttom + addChannel
// function addChannel() {
//   maxObjectId++;
//   const newChannel: channel = {
//     objectId: maxObjectId,
//     name: "New Channel",
//     avatar: "",
//     password: "",
//     messages: [], // initialize with an empty array of messages
//     users: [] // initialize with an empty array of users
//   };

//   store.addChannel(newChannel);
// }

// Props declaration
const props = defineProps({
  channelStatus: Boolean,
});

// Get the current component instance
const instance = getCurrentInstance();

// Emit event from the child component
const toggleStatus = () => {
  //const newStatus = !props.channelStatus;
  //instance?.emit("update-channel-status", newStatus);
};

// Variável para controlar o estado do chat
let isChatHidden = true;

onMounted(() => {
  toggleChat();
  changeFilter("inside");
  // addChannel();
});

const buttonString = ref("⇑"); // Set initial button text

// Função para alternar o estado do chat
const toggleChat = () => {
  const chatElement = document.querySelector(".chat") as any;

  if (isChatHidden) {
    // Ocultar o chat
    if (props.channelStatus) {
      instance?.emit('update-channel-status', false);
    }
    chatElement.style.bottom = "-57%";
  } else {
    // Mostrar o chat
    chatElement.style.bottom = "0%";
    getFilteredChannels();
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
  position: relative;
}

.contacts_card {
  flex: 1;
  max-height: 100%; /* Set the desired maximum height for the contacts card */
  overflow-y: auto;
}

.menu-container {
  position: absolute;
    z-index: 10;
    right: 0;
    width: 128%;
    top: 0%;
}
</style>
