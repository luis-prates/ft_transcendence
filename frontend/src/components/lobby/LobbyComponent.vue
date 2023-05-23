<template>
  <div>
    <div id="game_lobby" class="game"></div>
    <div ref="menu" class="menu">
      <button style="left: 10px">Test</button>
      <button style="right: 0px">Test</button>
    </div>
    <div class="table">
      <img src="@/assets/images/lobby/table_2aaa15.png" />
      <img src="@/assets/images/lobby/table_efc120.png" />
      <img src="@/assets/images/lobby/table_de1bda.png" />
      <button @click="test">Test</button>
    </div>
    <img class="laod" src="@/assets/images/load/load_3.gif" v-if="!isConcted" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Player, Map, Lobby, Game } from "@/game";
import socket from "@/socket/Socket";
import { userStore } from "@/stores/userStore";
// class MyClass {
//   constructor(a: any[]) {
//     console.log("Uma instância de MyClass foi criada.: ", a);
//   }
// }

// const className = "MyClass";

const store = userStore();
// const game = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
let lobby: Lobby | null = null;
const isConcted = ref(false);

onMounted(() => {
  isConcted.value = false;
  socket.emit("join_map", { objectId: store.user.id, map: { name: "lobby" } });
  socket.on("load_map", (data: any) => {
    setTimeout(() => {
      console.log("load_map_4444");
      console.log("load_map", data);
      if (lobby) lobby.destructor();
      const map = new Map();
      map.setData(data.map).then(() => {
        lobby = new Lobby(map, new Player(menu, data.player));
        document.getElementById("game_lobby")?.appendChild(lobby.canvas);
        data.data.forEach((d: any) => {
          lobby?.addGameObjectData(d);
        });
        isConcted.value = true;
        lobby.update();
        console.log("isConcted.value : ", isConcted.value);
      });
    }, 1000);
  });
});

onUnmounted(() => {
  console.log("unmounted");
  lobby?.destructor();
  lobby = null;
});

function salvarDesenhoComoImagem() {
  // const canvaElement = lobby?.canvas as HTMLCanvasElement;
  // const imgData = canvaElement.toDataURL("image/png");
  // const link = document.createElement("a");
  // link.href = imgData;
  // link.download = "desenho.png";
  // link.click();
  Game.Map.saveMap();
  console.log("salvarDesenhoComoImagem");
}

function test() {
  salvarDesenhoComoImagem();
  // const dynamicInstance = eval(`new ${className}('${a}')`);
}
</script>

<style scoped lang="scss">
.laod {
  width: 100%; /* 100% da largura da janela */
  height: 100%;
  position: fixed;
  margin: 0;
  padding: 0;
}
.game {
  width: 100%; /* 100% da largura da janela */
  height: 100%; /* 100% da altura da janela */
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
