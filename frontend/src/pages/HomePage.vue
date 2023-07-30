<template>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <input id="fileInput" type="file" style="display: none" accept="image/*" />
  <div class="box" href>
    <!-- <ProfileComponent class="profile" />     -->
    <!-- <LobbyComponent /> -->
    <MapEditComponent />
    <!-- <ProfileComponent class="profile" /> -->
  </div>
  <input id="inputName" type="text" pattern="[A-Za-z0-9]+" value="" disabled="false" style="display: none; background-color: transparent; font-family: 'Press Start 2P'" @input="cleanInput" :maxlength="15" />
  <input id="inputTwoFactor" type="text" pattern="[0-9]+" value="" disabled="false" style="display: none; background-color: transparent; font-family: 'Press Start 2P'" :maxlength="6" />
</template>

<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import { ChatComponent } from "@/components";
import LobbyComponent from "@/components/lobby/LobbyComponent.vue";
import MapEditComponent from "@/components/lobby/MapEditComponent.vue";

import { onBeforeRouteLeave } from "vue-router";

const store = userStore();
onBeforeRouteLeave((to, from, next) => {
  //console.log("to", to);
  //// Aqui você pode executar a lógica desejada quando o usuário tenta sair da página
  //
  //// Por exemplo, exibir uma mensagem de confirmação
  //const shouldLeave = window.confirm("Deseja sair desta página?");
  //if (shouldLeave) {
  //  // Se o usuário confirmar, permita a saída
  //  next();
  //} else {
  //  // Caso contrário, cancele a navegação
  //  next(false);
  //}
  next();
});

console.log(store.user);

// function newGame() {
//   console.log("createGame")
//   socket.emit("new_game", { objectId: "gameteste", maxScore: 3, table: "green", tableSkin: "", bot: true })
//   Router.push("/game?objectId=gameteste&maxScore=3&table=green&bot=true&avatar=https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bc9ffd43-db87-475c-a8f0-0e57fc3d5c43/d7piatk-383ae681-e8c5-4580-a77a-96e856cd1c3c.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2JjOWZmZDQzLWRiODctNDc1Yy1hOGYwLTBlNTdmYzNkNWM0M1wvZDdwaWF0ay0zODNhZTY4MS1lOGM1LTQ1ODAtYTc3YS05NmU4NTZjZDFjM2MucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.poDHxDZ5KSHu4L-CsyOcCoR_m3krSLS_otv-VgXLvMM&nickname=rteles&color=blue&skinPlayer=mario");
// }

// function entryGame() {
//   Router.push("/game?objectId=gameteste&maxScore=3&avatar=https://animesher.com/orig/1/146/1463/14634/animesher.com_okama-sanji-travesti-1463471.jpg&nickname=edos-san&color=orange&skinPlayer=pacman");
// }

function cleanInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const inputValue = input.value;

  const sanitizedValue = inputValue.replace(/[^A-Za-z0-9_-]+/g, "");

  const firstChar = sanitizedValue.charAt(0);
  if (/[0-9]/.test(firstChar)) input.value = sanitizedValue.substring(1);
  else input.value = sanitizedValue;
}
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
