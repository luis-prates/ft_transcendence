<template>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <div class="box" href>
    <LobbyComponent />
    <!-- <MapEditComponent /> -->
  </div>
</template>

<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import LobbyComponent from "@/components/lobby/LobbyComponent.vue";
import MapEditComponent from "@/components/lobby/MapEditComponent.vue";

import { onBeforeRouteLeave } from "vue-router";

const store = userStore();
onBeforeRouteLeave((to, from, next) => {
  next();
});
</script>

<style scoped>
.box {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: chocolate;
  /* z-index: 0; */
}

.profile {
  width: 30%;
}
</style>
