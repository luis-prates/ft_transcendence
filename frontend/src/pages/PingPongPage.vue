<template>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <div class="box" href>
    <canvas id="canvas1"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Game, Status } from "@/game/ping_pong/pingPong.js";
import { onMounted } from "vue";
import { Table } from "@/game/ping_pong/table.js";
import socket from "@/socket/Socket";
import { type gameRequest, type updatePlayer, type updateBall, type gamePoint } from "@/game/ping_pong/SocketInterface";

const props = defineProps({
  objectId: String,
  avatar: String,
  nickname: String,
  color: String,
  skinPlayer: String,
});

onMounted(function () {
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 1000;
  canvas.height = 750;

  socket.emit("entry_game", props);
  console.log("pros: ", props);

  //TODO
  const tableColor: string = "#1e8c2f";

  const game = new Game(canvas.width, canvas.height - 228, 164, ctx, props as gameRequest);
  console.log(props);
  const tableBoard = new Table(canvas.width, canvas.height, "DarkSlateBlue", tableColor);

  socket.on("start_game", (e: any) => {
    console.log(e);
    console.log(game);
    game.audio("music_play");

    game.player1.nickname = e.nickname1;
    game.player1.color = e.color1;
    game.player1.avatar.src = e.avatar1 ? e.avatar1 : game.player1.avatar.src;

    game.player2.nickname = e.nickname2;
    game.player2.color = e.color2;
    game.player2.avatar.src = e.avatar2 ? e.avatar2 : game.player2.avatar.src;

    e.skin1 ? game.player1.updateSkin(e.skin1) : "";
    e.skin2 ? game.player2.updateSkin(e.skin2) : "";

    game.status = e.status;

    if (e.player === 1) {
      game.playerNumber = 1;
    } else if (e.player === 2) {
      game.playerNumber = 2;
    }
  });
  socket.on("game_update_status", (status: any) => {
    if (game.status != Status.Finish) {
      game.updateStatus(status);
    }
  });
  socket.on("game_counting", (seconds: any) => {
    if (game.status == Status.Starting) {
      game.counting = seconds;
      
      if (seconds == 4)
        game.audio("counting");
    }
  });

  socket.on("game_update_player", (e: updatePlayer) => {
    if (e.playerNumber === 1) game.player1.updatePlayer(e.x, e.y, e.score);
    else game.player2.updatePlayer(e.x, e.y, e.score);
  });

  socket.on("game_update_ball", (e: updateBall) => {
    game.ball.updateBall(e.x, e.y, e.dir);
  });
  socket.on("game_update_point", (e: gamePoint) => {
    if (game.status == Status.InGame) {
      game.updateStatus(Status.Starting);
      if (e.playerNumber == 1) game.player1.point(e.score);
      else game.player2.point(e.score);
    }
  });
  
  socket.on("game_sound", (e: any) => {
      game.audio(e.sound);
  });
  
  socket.on("end_game", (e: any) => {
    game.updateStatus(Status.Finish);
    game.endMessage = e.result;
    game.audio("music_stop");
  });

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
