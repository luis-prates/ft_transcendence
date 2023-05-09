<template>
  <div ref="game" class="game"></div>
  <button @click="send">Start</button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Lobby } from "@/game/lobby/Lobby";
import { Player } from "@/game/base/Player";
import socket from "@/socket/Socket";

const game = ref<HTMLDivElement>();
const lobby = new Lobby();

onMounted(() => {
  if (game.value !== undefined) {
    game.value.appendChild(lobby.canvas);
    lobby.addGameObject(new Player());
    // lobby.addGameObject(new Player2());

    lobby.update();
  }
});

onUnmounted(() => {
 console.log("unmounted");
});

function send() {
  socket.emit("start", "hello word");
}

</script>

<style scoped>
.game {
  width: 2000px; /* 100% da largura da janela */
  height: 1000px; /* 100% da altura da janela */
  margin: 0;
  padding: 0;
  background-color: rgb(30, 39, 210);
}
</style>
