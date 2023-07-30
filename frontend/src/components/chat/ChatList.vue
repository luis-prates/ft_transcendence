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
          <button id="dmButton" class="chat_filter_button" @click="changeFilter('dm')">
            <img class="chat_filter_img" src="src/assets/chat/dm_messages.png" alt="DMs" />
          </button>
          <button id="insideButton" class="chat_filter_button" @click="changeFilter('inside')">
            <img class="chat_filter_img" src="src/assets/chat/my_channels.png" alt="My Channels" />
          </button>
          <button id="allButton" class="chat_filter_button" @click="changeFilter('all')">
            <img class="chat_filter_img" src="src/assets/chat/all_channels.png" alt="All Channels" />
          </button>
        </div>
        <ul class="contacts" @click="toggleStatus">
          <li v-for="channel in channelsFilters">
            <ChatListChannels :channel="channel" @click="selectChannel(channel)" @contextmenu="handleContextMenu(channel)" />
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
          <div v-if="imAdmin" class="chat_filter">
            <button @click="setShowUsers(true)"  class="chat_filter_button">
              <img class="chat_filter_img" src="src/assets/chat/userslist.png" title="Users" />
            </button>
            <button @click="setShowUsers(false)"  class="chat_filter_button">
              <img class="chat_filter_img" src="src/assets/chat/blacklist.png" title="Users Banned" />
            </button>
          </div>
          <div v-if="showUsers">
            <li v-for="(user, id) in usersFilters" :key="id">
              <ChatListUsers :user="user" @click="selectUser(user)" @contextmenu="handleContextMenuUser(user)" />
              <div class="menu-container" v-if="isMenuOpen">
                <Menus @toggleMenu="toggleMenu" :user="user" @kickUser="kickUser" @muteOrUnmute="muteOrUnmute" @makeOrDemoteAdmin="makeOrDemoteAdmin" @openPerfilUser="openPerfilUser" v-show="userSelect.id == user.id && userSelect.id != userStore().user.id" />/>
              </div>
            </li>
          </div>
          <div v-else>
            <li v-for="(bannedUser, id) in bannedUsersFilters" :key="id">
              <ChatListUsers :user="bannedUser" @click="selectUser(bannedUser)" @contextmenu="handleContextMenuUser(bannedUser)" />
              <div class="menu-container" v-if="isMenuOpen">
                <Menus @toggleMenu="toggleMenu" :user="bannedUser" @kickUser="kickUser" @muteOrUnmute="muteOrUnmute" @makeOrDemoteAdmin="makeOrDemoteAdmin" @openPerfilUser="openPerfilUser" v-show="userSelect.id == bannedUser.id && userSelect.id != userStore().user.id" />/>
              </div>
            </li>
          </div>
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
import { onMounted, computed } from 'vue';
import { storeToRefs } from "pinia";
import Menus from './Menu.vue';
import { Game, Lobby } from "@/game";
import { Profile } from "@/game/Menu/Profile";
import { userStore } from "@/stores/userStore";
import { YourProfile } from "@/game/Menu/YourProfile";




const store = chatStore();
const userSelect = ref('' as any);
const { selected } = storeToRefs(store);
const isMenuOpen = ref(false);
const channelsFilters = ref([] as channel[]);
const searchTerm = ref('');
const usersInChannelSelect = ref([] as ChatUser[]);
const bannedUsersInChannelSelect = ref([] as ChatUser[]);
const usersFilters = ref([] as ChatUser[]);
const bannedUsersFilters = ref([] as ChatUser[]);
const searchUser = ref('');
const isChatFilterType = ref("inside");

const imAdmin =  computed(() => {
  const user = userStore().user;
  const selectedChannel = selected;

  if (!selectedChannel)
    return false;

    if (selectedChannel.value.users && selectedChannel.value.users.some((u: any)=> u.id === user.id && u.isAdmin)) {
    return true;
  }
  return false;
})


const showUsers = ref(true);

const setShowUsers = (value:boolean) => {
  showUsers.value = value;
}

const handleSearch = () => {
  getFilteredChannels();
};

const handleSearchUser = () => {
  if (!usersFilters.value || !bannedUsersFilters.value)
    return;

  const searchBar = document.getElementById('searchUser') as HTMLInputElement;
  const searchValue = searchBar.value.toLowerCase();
  usersFilters.value = usersInChannelSelect.value.filter((user: ChatUser) => {
    const userName = user.nickname.toLowerCase();
    return userName.includes(searchValue);
  });
  return usersFilters;
};

function changeFilter (filter: string)
{
  isChatFilterType.value = filter;
  
  const dmButton = document.getElementById('dmButton') as HTMLElement;
  const insideButton = document.getElementById('insideButton') as HTMLElement;
  const allButton = document.getElementById('allButton') as HTMLElement;

  dmButton.style.backgroundColor = isChatFilterType.value == "dm" ? "rgba(17, 9, 9, 0.5)" : "transparent";
  insideButton.style.backgroundColor = isChatFilterType.value == "inside" ? "rgba(17, 9, 9, 0.5)" : "transparent";
  allButton.style.backgroundColor = isChatFilterType.value == "all" ? "rgba(17, 9, 9, 0.5)" : "transparent";

  getFilteredChannels();
}

function getFilteredChannels()
{
  if (isChatFilterType.value == "dm")
  {
    channelsFilters.value = store.channels.filter((channel: channel) => channel.type == "DM" && channel.users.some((user) => user.id === userStore().user.id));    
  }
  else if (isChatFilterType.value == "inside") //need verific i'm inside
  {
    channelsFilters.value = store.channels.filter((channel: channel) => (channel.type == "PROTECTED" || channel.type == "PRIVATE" || channel.type == "PUBLIC") && channel.users.some((user) => user.id == userStore().user.id)); 
  }
  else //need verific i'm inside
  {
    channelsFilters.value = store.channels.filter((channel: channel) => (channel.type == "PROTECTED" || channel.type == "PUBLIC") && !channel.users.some((user) => user.id == userStore().user.id));    
  }
  const searchBar = document.getElementById('searchChannel') as HTMLInputElement;
  let searchValue = '';
  if (searchBar) {
    searchValue = searchBar.value.toLowerCase();
  }
  channelsFilters.value = channelsFilters.value.filter((channel: channel) => {
  const channelName = (channel?.name ?? '').toLowerCase();
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
  openChannel(store.selected);
  if (isMenuOpen.value)
    toggleMenu();
}

const handleContextMenu = (channel: channel)  => {
  //instance?.emit("update-create-channel", false);
  if (selected.value != channel && isMenuOpen.value) {
    toggleMenu();
  }
  store.selectChannel(channel);
  toggleMenu();
};


const handleContextMenuUser = (user: ChatUser)  => {
  //instance?.emit("update-create-channel", false);
  console.log("click direito:", user.nickname)
  if (selected.value != user && isMenuOpen.value) {
    toggleMenu();
  }
  userSelect.value = user;
  toggleMenu();
};
  
let isProfileOpen: boolean = false;
let userProfileSelect: ChatUser;
let profile: any;

const selectUser = (user: ChatUser) => {
//instance?.emit("update-create-channel", false);

console.log("user Selecionado:", user.nickname);
if (selected.value != user && isMenuOpen.value) {
    toggleMenu();
  }
  userSelect.value = user;
  openPerfilUser(user);
  if (isMenuOpen.value)
    toggleMenu();
}

function openPerfilUser (user: ChatUser){
  if (isProfileOpen)
  {
    if (userProfileSelect == user)
      return;
    else
      profile.menu.close();
  }

  isProfileOpen = true;
  userProfileSelect = user;

  if (userStore().user.id == user.id)
    profile = new YourProfile(Lobby.getPlayer());
  else
    profile = new Profile(user.id);

  profile.show((value: string) => {
  	if (value == "EXIT") {
      isProfileOpen = false;
  	}
  });
}

function makeOrDemoteAdmin (userChannel: ChatUser){
  const channel = chatStore().selected as channel;

  if (!channel)
    return ;

  if (userChannel.isAdmin)
    chatStore().demoteAdmin(channel, userChannel);
  else
    chatStore().makeAdmin(channel, userChannel);
}

function muteOrUnmute (userChannel: ChatUser){
  const channel = chatStore().selected as channel;

  if (!channel)
    return ;
  if (userChannel.isMuted)
    chatStore().unmuteUser(channel, userChannel);
  else
    chatStore().muteUser(channel, userChannel);
}

function kickUser (userChannel: ChatUser){
  const channel = chatStore().selected as channel;

  if (channel)
    chatStore().kickUserFromChannel(channel, userChannel);
}

const openChannel = async function (channel: channel) {
  if (store.isUserInSelectedChannel(userStore().user.id))
  {
    store.getMessages(channel);
    instance?.emit('update-create-channel', false);
    instance?.emit("update-channel-status", true);
    usersInChannelSelect.value = channel.users;
    bannedUsersInChannelSelect.value = channel.banList;
    usersFilters.value = channel.users;
    bannedUsersFilters.value = channel.banList;
  }
  else
  {
    if (channel.type == "PUBLIC"){
      await store.joinChannel(channel.objectId);
      store.getMessages(channel);
    }
    else{
      console.log("I will try to put the password!");
    }
  }
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

  const cardBody = document.querySelector(".card-body") as HTMLElement;
    const handleScroll = () => {
      document.documentElement.style.setProperty('--scrollY', `${cardBody.scrollTop}px`);
    };

    cardBody.addEventListener('scroll', handleScroll);
    onUnmounted(() => {
      cardBody.removeEventListener('scroll', handleScroll);
    });
});

const buttonString = ref("⇑"); // Set initial button text

// Função para alternar o estado do chat
const toggleChat = () => {
  const chatElement = document.querySelector(".chat") as any;
  const searchUser = document.getElementById('searchUser') as HTMLInputElement;
  const searchChannel = document.getElementById('searchChannel') as HTMLInputElement;

  if (isChatHidden) {
    // Ocultar o chat
    if (props.channelStatus) {
      instance?.emit('update-channel-status', false);
    }
    chatElement.style.bottom = "-57%";
    //Limpar Conteudo
    if (searchUser)
      searchUser.value = '';
    if (searchChannel)
      searchChannel.value = '';
    
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

defineExpose({
        getFilteredChannels
    });

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
    top: calc(0px - var(--scrollY, 0px));
}
</style>
