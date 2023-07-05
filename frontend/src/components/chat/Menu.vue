<template>
    <div @mousemove="updateMousePosition" @mouseleave="hideMenu">
      <!-- <button @click="toggleMenu">Toggle Menu</button> -->
      <div class="menu" :style="menuStyles">
        <ul>
          <li @click="handleMenuItemClick(1)">Item 1</li>
          <li @click="handleMenuItemClick(2)">Item 2</li>
          <li @click="handleMenuItemClick(3)">Item 3</li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  
  const isMenuOpen = ref(false);
  const mouseX = ref(0);
  const mouseY = ref(0);
  
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };
  
  const updateMousePosition = (event: MouseEvent) => {
    mouseX.value = event.clientX;
    mouseY.value = event.clientY;
  };
  
  const hideMenu = () => {
    isMenuOpen.value = false;
  };
  
  const handleMenuItemClick = (item: number) => {
    // Handle menu item click logic
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
    background-color: #f1f1f1;
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
    background-color: #ddd;
  }
  </style>

  
  
  
  
  
  
  