<template>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="box" href>
    <canvas id="canvas1"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Game } from "@/game/ping_pong/pingPong";
import { onMounted } from "vue";
import tableImage from "@/assets/images/pingpong/table_1.png";
import { Table } from "@/game/ping_pong/table";


onMounted(function () {
  const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = 1000;
  canvas.height = 750;

  const game = new Game(canvas.width, canvas.height - 228, 164);
  console.log(game);
  const table = new Image();
  table.src = tableImage;
  const tableBoard = new Table(canvas.width, canvas.height, "DarkSlateBlue", "green");

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tableBoard.draw(ctx);
    game.update();
    game.draw(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
</script>

<style scoped>
.box {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: 0;
}

#canvas1 {
  border: 5px solid black;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translate(-50%, 50%);
  max-width: 100%;
  max-height: 100%;
}
</style>