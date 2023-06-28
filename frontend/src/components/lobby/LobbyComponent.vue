<template>
  <div>
    <div ref="game" class="game"></div>

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

    <img class="laod" src="@/assets/images/load/load_2.gif" v-if="!isLoad" />
  </div>
  <ChatComponent class="chat_component"/>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Player, Map, Lobby, Game } from "@/game";
import { socketClass } from "@/socket/SocketClass";
import { userStore } from "@/stores/userStore";
import ChatComponent from "@/components/chat/ChatComponent.vue";

const store = userStore();
const game = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
let lobby: Lobby | null = null;
const isLoad = ref(false);
const socket = socketClass.getLobbySocket();

onMounted(() => {
  isLoad.value = false;
  socket.emit("join_map", { userId: store.user.id, objectId: store.user.id, map: { name: "lobby" } });
  socket.on("load_map", (data: any) => {
    console.log("load_map", data.data);
    setTimeout(() => {
      if (lobby) lobby.destructor();
      const map = new Map();
      map.setData(data.map).then(() => {
        lobby = new Lobby(map, new Player(menu, data.player));
        if (game.value !== undefined) {
          game.value.appendChild(lobby.canvas);
          data.data.forEach((d: any) => {
            lobby?.addGameObjectData(d);
          });
          isLoad.value = true;
          lobby.update();
        }
        console.log("isConcted.value : ", isLoad.value);
      });
    }, 1000);
  });
});

onUnmounted(() => {
  console.log("unmounted");
  socket.off("load_map");
  if (lobby) lobby.destructor();
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

.chat_component
{
  width: 70%;
  height: 60%;
  right: 0px;
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
