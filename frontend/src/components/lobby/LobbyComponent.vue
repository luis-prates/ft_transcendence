<template>
  <div ref="game" class="game"></div>
  <div ref="menu" class="menu">
    <button style="left: 10px">Test</button>
    <button style="right: 0px">Test</button>
  </div>
  <div class="table">
    <img src="@/assets/images/lobby/table_2aaa15.png" />
    <img src="@/assets/images/lobby/table_efc120.png" />
    <img src="@/assets/images/lobby/table_de1bda.png" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Player, Map, Lobby } from "@/game";

const game = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
const lobby = new Lobby(new Map(), new Player(menu));

onMounted(() => {
  if (game.value !== undefined) {
    game.value.appendChild(lobby.canvas);
    lobby.update();
    const a: [] = [];
    a.length;
  }
});

onUnmounted(() => {
  console.log("unmounted");
  lobby.destructor();
});
</script>

<style scoped lang="scss">
.game {
  width: 2000px; /* 100% da largura da janela */
  height: 1000px; /* 100% da altura da janela */
  margin: 0;
  padding: 0;
  background-color: rgb(30, 39, 210);
}

.menu {
  /* left: 0px; */
  top: 70px;
  /* z-index: -1; */
  position: absolute;
  width: 200px;
  height: 50px;
  background-color: rgb(179, 103, 95);
  border: 2px solid red;
  padding: 5px;
  border-radius: 15px;
  box-shadow: 0px 0px 10px 0px rgba(59, 217, 15, 0.75);
  display: none;
  button {
    width: 40%;
    height: 100%;
    border-radius: 10px;
    background-color: rgb(59, 217, 15);
    border: 2px solid rgb(59, 217, 15);
    box-shadow: 0px 0px 10px 0px rgba(59, 217, 15, 0.75);
  }
  button:hover {
    background-color: rgb(200, 213, 23);
    border: 2px solid rgb(59, 217, 15);
    box-shadow: 0px 0px 10px 0px rgba(59, 217, 15, 0.75);
  }
}

.table {
  /* left: 0px; */
  top: 70px;
  /* z-index: -1; */
  position: absolute;
  width: 150px;
  height: 90px;
  right: 5px;
  top: 5px;
  background-color: rgb(179, 103, 95);
  border: 2px solid rgb(178, 120, 120);
  padding: 10px;
  border-radius: 15px;
  img {
    width: 32px;
    height: 64px;
    margin-right: 10px;
  }
}
</style>
