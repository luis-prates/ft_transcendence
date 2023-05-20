<template>
  <div ref="game" class="game"></div>
  <div class="table">
    <button @click="action(0)" :class="MapObject.action.value == 0 ? 'buttonSelect' : ''">Colission</button>
    <button @click="action(1)" :class="MapObject.action.value == 1 ? 'buttonSelect' : ''">Start Possition</button>
    <button @click="action(2)" :class="MapObject.action.value == 2 ? 'buttonSelect' : ''">Player</button>
    <button @click="action(3)" :class="MapObject.action.value == 3 ? 'buttonSelect' : ''">Tree</button>

    <button @click="Game.Map.saveMap">Save Map</button>
    <input type="file" ref="file" @change="loadMap" style="display: none" accept=".json" />
    <button @click="file?.click">Load Map</button>

    <br />
    <h3>Action: {{ MapObject.action }}</h3>

    <!-- <button @click="test">Test</button> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onUpdated, computed } from "vue";
import { Player, Map, Lobby, Game } from "@/game";
import { userStore } from "@/stores/userStore";
import img from "@/assets/images/lobby/layer_1.png";
import { MapEdit, MapObject } from "@/game/base/MapEdit";

const game = ref<HTMLDivElement>();
const file = ref<HTMLInputElement>();

onMounted(() => {
  const imagem = new Image();
  imagem.src = img;
  imagem.onload = () => {
    const lobby = new MapEdit(imagem);
    console.log("Map: Imagem carregada");
    if (game.value === undefined) return;
    game.value.appendChild(lobby.canvas);
    lobby.update();
  };
});

function Colission() {
  MapObject.action.value = 0;
}

function startPossition() {
  MapObject.action.value = 1;
}

function action(n: number) {
  MapObject.action.value = n;
}

function loadMap(event: any) {
  const file = event.target.files[0];
  if (file.type === "application/json") {
    const reader: any = new FileReader();
    reader.onload = () => {
      const j = JSON.parse(reader.result);
      console.log("json: ", j);
      Game.Map.setData(j);
    };
    reader.readAsText(file);
  }
  //
}
</script>

<style scoped lang="scss">
.game {
  width: 100%; /* 100% da largura da janela */
  height: 100%; /* 100% da altura da janela */
  margin: 0;
  padding: 0;
  background-color: rgb(30, 39, 210);
  overflow: scroll;
  max-height: 100%;
  max-width: 100%;
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
  height: auto;
  right: 50px;
  top: 5px;
  background-color: rgb(179, 103, 95);
  border: 2px solid rgb(178, 120, 120);
  padding: 10px;
  border-radius: 15px;
  h3 {
    margin-top: 5px;
    text-align: center;
    width: 100%;
  }
  img {
    width: 32px;
    height: 64px;
    margin-right: 10px;
  }
  button {
    margin-top: 5px;
    width: 100%;
  }
  .buttonSelect {
    background-color: rgb(200, 213, 23);
    border: 2px solid rgb(59, 217, 15);
    box-shadow: 0px 0px 10px 0px rgba(59, 217, 15, 0.75);
  }
  button:active {
    background-color: rgb(59, 217, 15);
    border: 2px solid rgb(59, 217, 15);
    box-shadow: 0px 0px 10px 0px rgba(59, 217, 15, 0.75);
  }
}
</style>
