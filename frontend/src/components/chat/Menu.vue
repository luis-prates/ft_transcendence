<template>
    <div v-if="$props.channel">
      <!-- <button @click="toggleMenu">Toggle Menu</button> -->
      <div class="menu" :style="menuStyles">
        <ul style="color: aliceblue;">
          <li @click="handleMenuItemClick(1)">{{ getOpenJoin() }}</li>
          <li v-if="store.isUserInSelectedChannel(userStore().user.id)" @click="handleMenuItemClick(2)">Leave</li>
        </ul>
      </div>
    </div>
    <div v-else-if="$props.user">
      <div class="menu" :style="menuStyles">
        <ul style="color: aliceblue;">
          <!-- COMMANDS USER -->
          <li @click="handleMenuItemUserClick(1)">Open Profile</li>
          <li @click="handleMenuItemUserClick(2)">{{ getFriend($props.user) }} Friend</li>
          <li @click="handleMenuItemUserClick(3)">{{ getBlock($props.user) }}</li>
          <li @click="handleMenuItemUserClick(4)">Challenge</li>
          <!-- COMMANDS ADMINSTRADOR -->
          <!-- <li @click="handleMenuItemUserClick(5)">{{ getMute($props.user) }}</li>
          <li @click="handleMenuItemUserClick(6)">Kick</li> -->
          <!-- COMMANDS OWNER -->
          <!-- <li @click="handleMenuItemUserClick(7)">Give Adminstrator</li> -->
          <!-- <li @click="handleMenuItemUserClick(8)">Give OwnerShip</li> -->
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, getCurrentInstance } from 'vue';
  import { chatStore, type channel, type ChatUser } from "@/stores/chatStore";
  import { storeToRefs } from "pinia";
  import { userStore } from "@/stores/userStore";

  const store = chatStore();
  const { selected } = storeToRefs(store);
  // Get the current component instance
  const instance = getCurrentInstance();
  
  const isMenuOpen = ref(false);
  const mouseX = ref(0);
  const mouseY = ref(0);
  
  const props = defineProps({
  channel: {
    type: Object as () => channel, // Specify the type as channel
    required: false,
  },
  user: {
    type: Object as () => ChatUser, // Specify the type as channel
    required: false,
  },
});

  const handleMenuItemUserClick = (item: number) => {
    // Handle menu item click logic
    if (item == 1) {
      console.log("ABRE O MENU DO:", props.user?.nickname)
      instance?.emit('openPerfilUser', props.user);
    }
    else if (item == 2){
      // console.log("O id do channel onde vai dar elave: ", selected.value.objectId)
      // store.leaveChannel(selected.value.objectId);
    }
    //Friends
    else if (item == 3){
      if (!props.user)
        return ;
     /* const label = getFriend(props.user);
      if (label == "Remove Friend")
        //TODO
      else if (label == "You have a Request")
        //TODO
      else if (label == "Add Friend")
        //TODO
      else if (label == "Cancel Request")
        //TODO
      else if (label == "Remove Friend")
        //TODO*/
    }
    else if (item == 4){
      if (props.user)
        getChallenge(props.user)
    }
    else if (item == 5){
      // console.log("O id do channel onde vai dar elave: ", selected.value.objectId)
      // store.leaveChannel(selected.value.objectId);
    }
    else if (item == 6){
      // console.log("O id do channel onde vai dar elave: ", selected.value.objectId)
      // store.leaveChannel(selected.value.objectId);
    }
    else if (item == 7){
      // console.log("O id do channel onde vai dar elave: ", selected.value.objectId)
      // store.leaveChannel(selected.value.objectId);
    }
    else if (item == 8){
      // console.log("O id do channel onde vai dar elave: ", selected.value.objectId)
      // store.leaveChannel(selected.value.objectId);
    }
    if (isMenuOpen)
      toggleMenu();
  };

  function getOpenJoin(){
    if (store.isUserInSelectedChannel(userStore().user.id))
    return "Open";
    return "Join";
  };


  function getFriend(chatUser: ChatUser){
    let index = userStore().user.friends.findIndex(user => user.id == chatUser.id);
    const isYourFriend = index == -1 ? false : true;

    index = userStore().user.friendsRequests.findIndex((friendship) => friendship.requestorId === chatUser.id);
		const heSendARequestFriend = index == -1 ? false : true;
    
		index = userStore().user.friendsRequests.findIndex((friendship) => friendship.requesteeId === chatUser.id);
		let friend = isYourFriend ? "-" : (heSendARequestFriend ? "0" : (index == -1 ? "+" : "-"));
    
    return isYourFriend ? "Remove Friend" : (heSendARequestFriend ? "You have a Request" : (friend == "+" ? "Add Friend" : "Cancel Request"));
  };

  function getBlock(chatUser: ChatUser){
    console.log("USER:", chatUser.nickname)
    const userIndex = userStore().user.block.findIndex(block => block.blockedId == chatUser.id);
    if (userIndex !== -1) {
      return "UnBlock"
    }
    return "Block";
  };

  function getChallenge(chatUser: ChatUser){
    userStore().challengeUser(chatUser.id, chatUser.nickname);
  };

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    instance?.emit('toggleMenu');
  };
  
  const handleMenuItemClick = (item: number) => {
    // Handle menu item click logic
    if (item == 1) {
      instance?.emit('openChannel', props.channel);
    }
    else if (item == 2){
      console.log("O id do channel onde vai dar elave: ", selected.value.objectId)
      store.leaveChannel(selected.value.objectId);
    }
    if (isMenuOpen)
      toggleMenu();
  };

  
  const menuStyles = ref({});
  
  // Watch for changes in mouse position and update the menu position accordingly
  watch([mouseX, mouseY], () => {
    if (isMenuOpen.value) {
      menuStyles.value = {
        left: `${mouseX.value}px`,
        top: `${mouseY.value}px`,
      };
    }
  });
  
  </script>
  
  <style>
  .menu {
    position: fixed;
    background-color: #161616;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    border-radius: 10px;
  }
  
  .menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .menu ul li {
    padding: 12px;
    cursor: pointer;
  }
  
  .menu ul li:hover {
    background-color: #424242;
    border-radius: 10px;
  }
  </style>

  
  
  
  
  
  
  