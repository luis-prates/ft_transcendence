<template>
  <div class="box" href>
    <canvas ref="canvas" id="canvas" width="500" height="500"></canvas>
    <!-- <button @click="edit.nextBody">Body</button>
    <button @click="edit.nextHair">Hair</button>
    <button @click="edit.nextTorso">Torso</button> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
// import body from "@/assets/images/character/body/male/dark.png";
</script>

<style scoped>
.box {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  /* background-color: chocolate; */
  /* z-index: 0; */
  /* z-index: -1; */
}

.profile {
  width: 30%;
}

#canvas {
  position: absolute;
  left: 200px;
  top: 0;
  /* width: 500px;
  height: 500px; */
  z-index: 1;
}
</style>
