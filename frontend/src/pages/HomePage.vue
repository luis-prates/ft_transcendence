<template>
  <div class="box" href>
    <!-- <ProfileComponent class="profile" />     -->
    <!-- <LobbyComponent /> -->
    <ChatComponent/>
    <!-- <ProfileComponent class="profile" />    -->
  </div>
</template>

<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import {  ChatComponent} from "@/components";

const store = userStore();

console.log(store.user);
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
