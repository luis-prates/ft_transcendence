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
      <!-- <button @click="toggleMenu">Toggle Menu</button> -->
      
        <ul style="color: aliceblue;">
          <li @click="handleMenuItemClick(1)">Open</li>
        </ul>
      
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

  function getOpenJoin(){
    if (store.isUserInSelectedChannel(userStore().user.id))
      return "Open";
    return "Join";
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

  
  
  
  
  
  
  