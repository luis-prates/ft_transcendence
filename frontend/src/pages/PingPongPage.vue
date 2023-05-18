<template>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <div class="box" href>
    <canvas id="canvas1"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Game, Status } from "@/game/ping_pong/PingPong.js";
import { onMounted } from "vue";
import { Table } from "@/game/ping_pong/Table.js";
import socket from "@/socket/Socket";
import { type gameResquest, type updatePlayer, type updateBall, type gamePoint } from "@/game/ping_pong/SocketInterface";

const props = defineProps({
  objectId: String,
  maxScore: Number,
  avatar: String,
  nickname: String,
});


onMounted(function () {
  const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = 1000;
  canvas.height = 750;

  socket.emit("entry_game", props );
  console.log("pros: ", props)

  const game = new Game(canvas.width, canvas.height - 228, 164, ctx, props as gameResquest);
  console.log(props);
  const tableBoard = new Table(canvas.width, canvas.height, "DarkSlateBlue", "#1e8c2f");

  socket.on("start_game", (e: any) => {

    console.log(e);
    console.log(game);
    if (e.player === 1) {
      game.playerNumber = 1;
      game.status = e.status;
      //console.log("start game, player 1, Game Status: ", game.status)
    }
    else if (e.player === 2) {
      game.playerNumber = 2;
      game.status = e.status;
      //console.log("start game, player 2, Game Status: ", game.status)
    }
  })
  socket.on("game_update_status", (status: any) => {
    if (game.status != Status.Finish) {
      game.updateStatus(status);
    }
  })
  socket.on("game_counting", (seconds: any) => {
    if (game.status == Status.Starting) {
      game.counting = seconds;
    }
  })

  socket.on("game_update_player", (e: updatePlayer) => {

    if (e.playerNumber === 1) game.player1.updatePlayer(e.x, e.y);
    else game.player2.updatePlayer(e.x, e.y);
  })

  socket.on("game_update_ball", (e: updateBall) => {
    game.ball.updateBall(e.x, e.y, e.dir);
  })
  socket.on("game_update_point", (e: gamePoint) => {

    if (game.status == Status.InGame) {
      game.updateStatus(Status.Starting);
      if (e.playerNumber == 1) game.player1.point(e.score);
      else game.player2.point(e.score);
    }
  })
  socket.on("end_game", (e: any) => {
    game.updateStatus(Status.Finish);
    game.endMessage = e.result;
  })

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tableBoard.draw(ctx);
    game.update();
    game.draw();
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