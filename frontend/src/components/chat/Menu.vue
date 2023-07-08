<template>
    <div>
      <!-- <button @click="toggleMenu">Toggle Menu</button> -->
      <div class="menu" :style="menuStyles">
        <ul style="color: aliceblue;">
          <li @click="handleMenuItemClick(1)">Open</li>
          <li @click="handleMenuItemClick(2)">Item 2</li>
          <li @click="handleMenuItemClick(3)">Item 3</li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, getCurrentInstance } from 'vue';
  import { chatStore, type channel } from "@/stores/chatStore";

  // Get the current component instance
  const instance = getCurrentInstance();
  
  const isMenuOpen = ref(false);
  const mouseX = ref(0);
  const mouseY = ref(0);
  
  const props = defineProps({
  channel: {
    type: Object as () => channel, // Specify the type as channel
    required: true,
  },
});

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    instance?.emit('toggleMenu');
  };
  
  const handleMenuItemClick = (item: number) => {
    // Handle menu item click logic
    if (item == 1) {
      instance?.emit('openChannel', props.channel);
      instance?.emit('update-create-channel', false);
      instance?.emit("update-channel-status", true);
      console.log("Vai abrir o chat" + instance?.isMounted);
    }
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
    position: absolute;
    background-color: #161616;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
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
  }
  </style>

  
  
  
  
  
  
  