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
  socket.emit("new_game", { objectId: "gameteste", maxScore: 3, table: "green", tableSkin: "", bot: true })
  Router.push("/game?objectId=gameteste&maxScore=3&table=green&bot=true&avatar=https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bc9ffd43-db87-475c-a8f0-0e57fc3d5c43/d7piatk-383ae681-e8c5-4580-a77a-96e856cd1c3c.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2JjOWZmZDQzLWRiODctNDc1Yy1hOGYwLTBlNTdmYzNkNWM0M1wvZDdwaWF0ay0zODNhZTY4MS1lOGM1LTQ1ODAtYTc3YS05NmU4NTZjZDFjM2MucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.poDHxDZ5KSHu4L-CsyOcCoR_m3krSLS_otv-VgXLvMM&nickname=rteles&color=blue&skinPlayer=mario");
}

function entryGame() {
  Router.push("/game?objectId=gameteste&maxScore=3&avatar=https://animesher.com/orig/1/146/1463/14634/animesher.com_okama-sanji-travesti-1463471.jpg&nickname=edos-san&color=orange&skinPlayer=pacman");
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
