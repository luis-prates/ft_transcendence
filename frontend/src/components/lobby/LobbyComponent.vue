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
  <ChatComponent class="chat_component" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Player, Map, Lobby, Game } from "@/game";
import { socketClass } from "@/socket/SocketClass";
import { userStore, type Block, type Friendship } from "@/stores/userStore";
import ChatComponent from "@/components/chat/ChatComponent.vue";
import { ConfirmButton, STATUS_CONFIRM } from "@/game/Menu/ConfirmButton";
import Router from "@/router";
import { chatStore } from "@/stores/chatStore";

const store = userStore();
const user = userStore().user;
const game = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
let lobby: Lobby | null = null;
const isLoad = ref(false);
const socket = socketClass.getLobbySocket();

onMounted(() => {
  isLoad.value = false;
  socket.emit("join_map", { userId: store.user.id, objectId: store.user.id, map: { name: "school" } });
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
  socket.on("invite_request_game", (e: any) => {
    const confirmButton = new ConfirmButton(e.playerName, STATUS_CONFIRM.CHALLENGE_YOU);
    Game.instance.addMenu(confirmButton.menu);
    confirmButton.show((value) => {
      if (value == "CONFIRM") {
        socket.emit("challenge_game", {
          challenged: store.user.id,
          challenger: e.playerId,
        });
      }
    });
  });
  socket.on("challenge_game", (gameId: string) => {
    console.log("Challenge begin!");
    socket.off("invite_confirm_game");
    Router.push(`/game?objectId=${gameId}`);
  });

  //Block
  socket.on("block_user", (event: Block) => {
    const existingEvent = user.block.find((block: any) => block.blockerId === event.blockerId);

    if (!existingEvent) user.block.push(event);

    console.log("Block!", event, "Block List:", user.block);
  });

  //Unblock
  socket.on("unblock_user", (event: Block) => {
    user.block = user.block.filter((block: Block) => block.blockerId !== event.blockerId);

    console.log("Unblock!", event, "Block List:", user.block);
  });

  //Send Friend Request
  socket.on("sendFriendRequest", (event: Friendship) => {
    const existingEvent = user.friendsRequests.find((friend: Friendship) => friend.requestorId === event.requestorId);

    if (!existingEvent) user.friendsRequests.push(event);
    //console.log("Send Friend!", event, "Friend Request:", user.friendsRequests);
    Game.updateNotifications();
  });
  
  //Cancel Friend Request
  socket.on("cancelFriendRequest", (event: Friendship) => {
    user.friendsRequests = user.friendsRequests.filter((friend: Friendship) => friend.requestorId != event.requestorId);

    //console.log("Cancel Friend!", event, "Friend Request:", user.friendsRequests);
    Game.updateNotifications();
  });

  //Accept Friend Request
  socket.on("acceptFriendRequest",  (event: Friendship) => {
    user.friendsRequests = user.friendsRequests.filter((request: Friendship) => request.requesteeId != event.id);
    const existingEvent = user.friends.find((friend: Friendship) => friend.requesteeId === event.id);
    
    if (!existingEvent)
      user.friends.push(event);
    //console.log("Accept Friend!", event);
    Game.updateNotifications();
	});
  
  //Reject Friend Request
  socket.on("rejectFriendRequest",  (event: Friendship) => {
    user.friendsRequests = user.friendsRequests.filter((request: Friendship) => request.requesteeId != event.requesteeId);
    //console.log("Reject Friend Request!", event);
    Game.updateNotifications();
	});
  
  //Delete Friend
  socket.on("deleteFriend",  (event: Friendship) => {
    user.friends = user.friends.filter((friend: Friendship) => friend.id != event.id);
    //console.log("Delete Friend!", event);
	});

  //Update Status
  socket.on("updateStatus",  (event: any) => {
    chatStore().channels.forEach(channel => {
      const userIndex = channel.users.findIndex(user => user.id == event.id);
      if (userIndex !== -1) {
        channel.users[userIndex].status = event.status;
      }
    });
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

.chat_component {
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
