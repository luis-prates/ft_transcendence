<template>
  <div class="box" href>
    <!-- <ProfileComponent class="profile" />     -->
    <!-- <LobbyComponent /> -->
    <div class="menu">
      <button @click="newGame">New game</button>
      <button @click="entryGame">Enter</button>
    </div>

    <!-- <ProfileComponent class="profile" />    -->
  </div>
</template>

<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import { ProfileComponent, LobbyComponent } from "@/components";
import Router from "@/router";
import socket from "@/socket/Socket";

const store = userStore();

console.log(store.user);

function newGame() {
  console.log("createGame")
  socket.emit("new_game", { objectId: "gameteste", maxScore: 3, status: 0 })
  Router.push("/game?objectId=gameteste&maxScore=3&avatar=&nickname=rteles");
}

function entryGame() {
  Router.push("/game?objectId=gameteste&maxScore=3&avatar=&nickname=edos-san");
}


</script>


<style scoped>
.box {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: chocolate;
}

.profile {
  width: 30%;
}

.menu {
  top: 0px;
  left: 0px;
  background-color: chocolate;
  position: absolute;
  width: 100px;
  height: 100px;
}
</style>
