<template>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <div class="box" href>
    <canvas id="canvas1"></canvas>
  </div>
</template>

<script setup lang="ts">
import { GamePong, TablePong, Status } from "@/game/ping_pong";
import { onMounted, onUnmounted, ref } from "vue";
import { type gameRequest, type updatePlayer, type updateBall, type gamePoint, type gameEnd } from "@/game/ping_pong/SocketInterface";
import { userStore, type Historic } from "@/stores/userStore";
import { socketClass } from "@/socket/SocketClass";

import avatar_marvin from "@/assets/images/pingpong/marvin.jpg";

const props = defineProps({
  objectId: String,
});

const status = ref(Status.Waiting);

let socket = socketClass.getGameSocket();

onMounted(function () {
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 1000;
  canvas.height = 750;

  const user = userStore().user;
  if (!socket)
	socketClass.setGameSocket({
		query: {
			userId: user.id,
		}
	});
	socket = socketClass.getGameSocket();
  socket.emit("entry_game", { 
    objectId: props.objectId,
	userId: user.id, 
    nickname: user.nickname,
    avatar: user.image,
    color: user.infoPong.color,
    skin: user.infoPong.skin.default.paddle,
	isPlayer: user.isPlayer,
  });

  console.log("pros: ", props);
  
  const tableBoard = new TablePong(canvas.width, canvas.height, "DarkSlateBlue", "#1e8c2f");
  const game = new GamePong(canvas, canvas.width, canvas.height - 228, 164, ctx, props as gameRequest, tableBoard);
  console.log(props);

  socket.on("start_game", (e: any) => {
    console.log(e);
    console.log(game);
    game.audio("music_play");

    game.table.color = e.data.table;
    game.table.skin.src = e.data.tableSkin ? e.data.tableSkin : "";

    game.player1.nickname = e.nickname1 ? e.nickname1 : game.player1.nickname;
    game.player1.color = e.color1;
    game.player1.avatar.src = e.avatar1 ? e.avatar1 : game.player1.avatar.src;

    game.player2.nickname = e.nickname2 ? e.nickname2 : game.player1.nickname;;
    game.player2.color = e.color2;
    game.player2.avatar.src = e.avatar2 ? e.avatar2 : game.player2.avatar.src;

    if (game.player2.nickname == "Marvin" && e.avatar2 == "marvin") game.player2.avatar.src = avatar_marvin;

    e.skin1 ? game.player1.updateSkin(e.skin1) : "";
    e.skin2 ? game.player2.updateSkin(e.skin2) : "";

    game.status = e.status;
    status.value = e.status;

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

      if (seconds == 4) game.audio("counting");
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

  socket.on("game_view", (e: number) => {
    game.updateWatchers(e);
  });

  socket.on("end_game", (e: gameEnd) => {
    status.value = Status.Finish;
    game.updateStatus(Status.Finish);
    console.log(e);
    game.endGame = e;

    //Add info in storage
    if (game.playerNumber == 1 || game.playerNumber == 2) {

      user.money += e.max_money;
      user.infoPong.xp += e.max_exp;

      //Up Level!
      while (user.infoPong.xp >= user.infoPong.level * 200)
      {
        user.infoPong.xp -= user.infoPong.level * 100;
		    user.infoPong.level += 1;
      }
    
      const player_2 = game.playerNumber == 1 ? game.player2 : game.player1;
      const history_game: Historic = {
        winner: e.result == "You Win!" ? user.nickname : player_2.nickname,
        loser: e.result == "You Lose!" ? user.nickname : player_2.nickname,
        player1: game.player1.nickname,
        player2: game.player2.nickname,
        result: game.player1.score + "-" + game.player2.score,
      }
      user.infoPong.historic.push(history_game as never);

      game.animation_points();
    }

    game.audio("music_stop");
  });

  onUnmounted(() => {
    socket.off("start_game");
    socket.off("game_update_status");
    socket.off("game_counting");
    socket.off("game_update_player");
    socket.off("game_update_ball");
    socket.off("game_update_point");
    socket.off("game_sound");
    socket.off("game_view");
    socket.off("end_game");
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

<style scoped lang="scss">
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

