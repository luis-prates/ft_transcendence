<template>
  <div class="parent-container">
    <div class="card mb-sm-3 mb-md-0 contacts_card">
      <button class="hide_chat" @click="toggleChat">{{buttonString}}</button>
      
      <div v-if="channelStatus == false" class="card-body contacts_body">
        <div class="card-header">
          <div class="input-group">
            <input id="searchChannel" type="text" placeholder="Search..." name="" class="form-control search" v-model="searchTerm" @input="handleSearch"/>
            <div class="input-group-prepend" title="Create Channel">
              <span class="input-group-text search_btn" @click="createChannel">+<i class="fas fa-search"></i></span>
            </div>
          </div>
        </div>
        <!-- Add chat list items here -->
        <div class="chat_filter">
          <button id="dmButton" class="chat_filter_button" @click="changeFilter('dm')">
            <img class="chat_filter_img" src="src/assets/chat/dm_messages.png" title="Direct Messages" />
          </button>
          <button id="insideButton" class="chat_filter_button" @click="changeFilter('inside')">
            <img class="chat_filter_img" src="src/assets/chat/my_channels.png" title="My Channels" />
          </button>
          <button id="allButton" class="chat_filter_button" @click="changeFilter('all')">
            <img class="chat_filter_img" src="src/assets/chat/all_channels.png" title="Other Channels" />
          </button>
        </div>
        <ul class="contacts" @click="toggleStatus">
          <li v-for="channel in channelsFilters">
            <ChatListChannels :channel="channel" @click="selectChannel(channel)" @contextmenu="handleContextMenu($event, channel)" />
          </li>
        </ul>
      </div>
      <div v-else class="card-body contacts_body">
        <div class="card-header">
          <div v-if="!(store.selected.type == 'DM')" class="input-group">
            <input id="searchUser" type="text" placeholder="Search..." name="" class="form-control search" v-model="searchUser" @input="handleSearchUser"/>
          </div>
        </div>
        <!-- Users inside the chat selected -->
        <ul class="contacts">
          <div v-if="imAdmin" class="chat_filter">
            <button @click="setShowUsers(1)"  class="chat_filter_button">
              <img class="chat_filter_img" src="src/assets/chat/userslist.png" title="Users" />
            </button>
            <button @click="setShowUsers(2)"  class="chat_filter_button">
              <img class="chat_filter_img" src="src/assets/chat/blacklist.png" title="Users Banned" />
            </button>
            <button @click="setShowUsers(3)"  class="chat_filter_button">
              <img class="chat_filter_img" src="src/assets/chat/add_user.png" title="Add User" />
            </button>
          </div>
          <div v-if="showUsers">
            <li v-for="(user, id) in usersFilters" :key="id">
              <ChatListUsers :user="user" @click="selectUser(user)" @contextmenu="handleContextMenuUser($event, user)" />
            </li>
          </div>
          <div v-else-if="showBanUsers">
            <li v-for="(bannedUser, id) in bannedUsersFilters" :key="id">
              <ChatListUsers :user="bannedUser" @click="selectUser(bannedUser)" @contextmenu="handleContextMenuBanUser($event, bannedUser)" />
            </li>
          </div>
          <div v-else-if="showAddUsers">
            <li v-for="(friendUser, id) in friendListFilter" :key="id">
              <ChatListUsers :user="friendUser" @click="selectUser(friendUser)" @contextmenu="handleContextMenuFriendUser($event, friendUser)" />
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
import { Game, Lobby } from "@/game";
import { Profile } from "@/game/Menu/Profile";
import { userStore } from "@/stores/userStore";
import { YourProfile } from "@/game/Menu/YourProfile";
import ContextMenu from '@imengyu/vue3-context-menu'
import { Menu } from "./Menu";



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
const friendListFilter = ref([] as ChatUser[]);
const searchUser = ref('');
const isChatFilterType = ref("inside");
const menu = new Menu();

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
const showBanUsers = ref(false);
const showAddUsers = ref(false);

const setShowUsers = (value:any) => {
  if (value == 1) {
    showUsers.value = true;
    showBanUsers.value = false;
    showAddUsers.value = false;
  }
  else if (value == 2) {
    showUsers.value = false;
    showBanUsers.value = true;
    showAddUsers.value = false;
  }
  else if (value == 3) {
    showUsers.value = false;
    showBanUsers.value = false;
    showAddUsers.value = true;
  }
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
    channelsFilters.value.forEach((channel) => {
      const userInChannel = channel.users.find((user) => user.id != userStore().user.id);
      if (userInChannel)
      {
        channel.name = userInChannel.nickname;      
        channel.avatar = userInChannel.image;
      }
    });
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
  if (channel.banList.find((banList) => banList.id === userStore().user.id))
    return;
  if (selected.value != channel && isMenuOpen.value) {
    toggleMenu();
  }
  store.selectChannel(channel);
  openChannel(store.selected);
  if (isMenuOpen.value)
  toggleMenu();
}

const handleContextMenu = (e: any, channel: channel)  => {
  store.selectChannel(channel);
  const isAdmin = (channel.users && channel.users.some((u: any)=> u.id === userStore().user.id && u.isAdmin));
  store.selected = channel;
  const items = [
      ...(!channel.banList.find((banList) => banList.id === userStore().user.id)? [{ 
        label: store.isUserInSelectedChannel(userStore().user.id) ? "Open" : "Join", 
        onClick: () => openChannel(channel)
      }] : [{label: "🚫"}]),
      ...(store.isUserInSelectedChannel(userStore().user.id) && (channel.ownerId != userStore().user.id) && (channel.type != "DM")
      ? [
          {
            label: "Leave",
            onClick: () => store.leaveChannel(channel.objectId),
          },
        ]
      : []),
      ...((channel.ownerId == userStore().user.id) 
      ? [
          {
            label: "Delete", 
            onClick: () => chatStore().deleteChannel(channel.objectId),
          }
        ]
      : [])
    ]
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: items,
    customClass: "custom-context-menu",
  });
};

const handleContextMenuBanUser = (e: any, user: ChatUser)  => {
  const items = [
  { 
    label: "Open Profile", 
    onClick: () => openPerfilUser(user)
    },
    { 
      label: "UnBan", 
      onClick: () => store.banUser(selected?.value.objectId, user.id, "unban"),
    }
  ]
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: items,
    customClass: "custom-context-menu",
  });
};

const handleContextMenuFriendUser = (e: any, user: ChatUser)  => {
  const items = [
  { 
    label: "Open Profile", 
    onClick: () => openPerfilUser(user)
    },
    { 
      label: "Add User", 
      onClick: () => chatStore().addUserToChannel(chatStore().selected.objectId, user.id)
    }
  ]
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: items,
    customClass: "custom-context-menu",
  });
};

async function DMHandling(user : any){
  console.log("DMHandling: ", user);
  const isDMSent = await menu.sendDM(user);
  if (isDMSent) {
    
    const currentUserId = userStore().user.id;
    const otherUserId = user.id;
    const dmChannel = chatStore().channels.find(channel =>
      channel.type === "DM" &&
      channel.users.some(user => user.id === currentUserId) &&
      channel.users.some(user => user.id === otherUserId)
    );

    if (dmChannel)
      openChannel(dmChannel);
  }
}

const handleContextMenuUser = (e: any, user: ChatUser)  => {
  const items = [
    { 
      label: "Open Profile", 
      onClick: () => openPerfilUser(user)
      },
      ...((user.id != userStore().user.id) ?
      [
      { 
        label: "Send DM", 
        onClick: async () => {
          DMHandling(user);
        },
      },
      { 
        label: menu.getFriend(user), 
        onClick: () => {
          const label = menu.getFriend(user);

          if (label === "Add Friend") {
            userStore().sendFriendRequest(user.id, user.nickname);
          } else if (label === "Cancel Request") {
            userStore().cancelFriendRequest(user.id);
          } else if (label === "You have a Request") {
            // Do nothing or show a message, as needed
            return;
          } else if (label === "Remove Friend") {
            userStore().deleteFriend(user.id);
          } else {
            // Handle other cases or default action, if needed
          }
        },
      },
      { 
        label: menu.getBlock(user), 
        onClick: () => {
          const label = menu.getBlock(user);
          if (label == "Block")
            userStore().blockUser(user.id, user.nickname, user.image);
          else if (label == "UnBlock")
            userStore().unblockUser(user.id);
        }
      },
      { 
        label: "Challenge", 
        onClick: () => menu.getChallenge(user),
      }] : []),
      //para admins do channel
      ...(imAdmin.value && (user.isAdmin == false) && (user.id != userStore().user.id) ? [
      ...(user.isMuted == false ? [{ 
        label: "Mute", 
        children: [
            { label: "1  min", onClick: () => {store.muteUser(selected?.value.objectId, user.id, 1)} },
            { label: "5  min", onClick: () => {store.muteUser(selected?.value.objectId, user.id, 5)} },
            { label: "15 min", onClick: () => {store.muteUser(selected?.value.objectId, user.id, 15)} },
            { label: "30 min", onClick: () => {store.muteUser(selected?.value.objectId, user.id, 30)} },
            { label: "60 min", onClick: () => {store.muteUser(selected?.value.objectId, user.id, 60)} },
          ]
      }] : [
      { 
        label: "UnMute", 
        onClick: () => {
          store.unmuteUser(selected?.value.objectId, user.id);
        }
      }
      ]),
      { 
        label: "Kick", 
        onClick: () => kickUser(user),
      },
      { 
        label: "Ban", 
        onClick: () => store.banUser(selected?.value.objectId, user.id, "ban"),
      },
      ] : []),
      //para owners
      ...(chatStore().selected.ownerId == userStore().user.id && (user.id != userStore().user.id) ? [
      { 
        label: menu.getAdmistrator(user) + " Adminstrator", 
        onClick: () => makeOrDemoteAdmin(user),
      }] : []),
      ...((chatStore().selected.ownerId == userStore().user.id) && (user.isAdmin == true) && (user.id != userStore().user.id)? [
      { 
        label: "Give Owner", 
        onClick: () => chatStore().makeOwner(chatStore().selected.objectId, user.id),
      }] : [])
    ]
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: items,
    customClass: "custom-context-menu",
  });
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
    instance?.emit('protected-channel', false);
    instance?.emit("update-channel-status", true);
    usersInChannelSelect.value = channel.users;
    bannedUsersInChannelSelect.value = channel.banList;
    usersFilters.value = channel.users;
    bannedUsersFilters.value = channel.banList;
    friendListFilter.value = userStore().user.friends.filter((friend) => {
      const isNotInSelectedUsers = !store.selected.users.some((selectedUser:any) => selectedUser.id === friend.id);
      const isNotInBanList = !store.selected.banList.some((bannedUser:any) => bannedUser.id === friend.id);
      return isNotInSelectedUsers && isNotInBanList;
    });
  }
  else
  {
    if (channel.type == "PUBLIC" || channel.type == "DM"){
      await store.joinChannel(channel.objectId);
      store.getMessages(channel);
      instance?.emit('update-create-channel', false);
      instance?.emit('protected-channel', false);
      instance?.emit("update-channel-status", true);
      usersInChannelSelect.value = channel.users;
      bannedUsersInChannelSelect.value = channel.banList;
      usersFilters.value = channel.users;
      bannedUsersFilters.value = channel.banList;
      friendListFilter.value = userStore().user.friends.filter((friend) => {
        const isNotInSelectedUsers = !store.selected.users.some((selectedUser:any) => selectedUser.id === friend.id);
        const isNotInBanList = !store.selected.banList.some((bannedUser:any) => bannedUser.id === friend.id);
        return isNotInSelectedUsers && isNotInBanList;
      });
    }
    else{
      console.log("I will try to put the password!");
      instance?.emit("protected-channel", true);
      // store.joinChannel(channel.objectId, "privado")
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
let isChatHidden = ref(true);

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

    Menu.chatListRef = (user: ChatUser) => {
      console.log("chatListRef: ", user);
      if (!isChatHidden.value)
        toggleChat();
      DMHandling(user)
  };
});

const buttonString = ref("⇑"); // Set initial button text

// Função para alternar o estado do chat
const toggleChat = () => {
  const chatElement = document.querySelector(".chat") as any;
  const searchUser = document.getElementById('searchUser') as HTMLInputElement;
  const searchChannel = document.getElementById('searchChannel') as HTMLInputElement;

  if (isChatHidden.value) {
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
  buttonString.value = isChatHidden.value ? "⇑" : "⇓";
  isChatHidden.value = !isChatHidden.value;//
  instance?.emit('update-create-channel', false);
  instance?.emit("protected-channel", false);

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
  max-height: 100%;
  overflow-y: auto;
}

.menu-container {
  position: absolute;
    z-index: 10;
    right: 0;
    width: 128%;
    top: calc(0px - var(--scrollY, 0px));
}

.custom-context-menu {
  background-color: #000000;
  cursor: pointer; 
}

.custom-context-menu .label {
  color: white;
}

/* .custom-context-menu .label :hover{
  color: gray !important;
} */
.mx-context-menu-item:hover
{
  background-color: rgb(57, 57, 57);
}

.mx-context-menu-item.open
{
  background-color: rgb(57, 57, 57);
}

.mx-context-menu-item.open:hover
{
  background-color: rgb(57, 57, 57);
}


</style>
