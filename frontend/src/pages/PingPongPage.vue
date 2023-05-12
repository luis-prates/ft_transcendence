<template>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="box" href>
    <canvas id="canvas1"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Game, type gameResquest } from "@/game/ping_pong/pingPong";
import { onMounted } from "vue";
import { Table } from "@/game/ping_pong/table";
import socket from "@/socket/Socket";

const props = defineProps({
  objectId: String
});

onMounted(function () {
  const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = 1000;
  canvas.height = 750;

  socket.emit("entry_game",  { objectId: props.objectId });
  console.log("pros: ", props)

  const game = new Game(canvas.width, canvas.height - 228, 164, props as gameResquest);
  console.log(props.objectId);
  const tableBoard = new Table(canvas.width, canvas.height, "DarkSlateBlue", "#1e8c2f");

  socket.on("start_game", (e: any) =>{
      
      if (e.data === 1)
      {
        game.playerNumber = 1;
        
      }
      else if (e.data === 2)
      {
        game.playerNumber = 2;
        
      }
        
      console.log("start_game: ", e)
    })
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tableBoard.draw(ctx);
    game.update(ctx);
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
  top: 0%;
  left: 50%;
  transform: translate(-50%, 5%);
  max-width: 100%;
  max-height: 100%;
}
</style>