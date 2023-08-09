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
    <div class="button-container" v-if="isLoad">
      
      <div class="retro-button" @click="onLeaveClick">
        <img src="@/assets/images/lobby/menu/leave.png" alt="Leave Icon"/>
        <div class="button-text">
          <span>Leave</span>
        </div>
      </div>
      <div class="retro-button" @click="onMessagesClick(clearNotification)">
        <img src="@/assets/images/lobby/menu/message.png" alt="Messages Icon"/>
        <div class="button-text">
          <span>Messages</span>
        </div>
        <div class="notification-badge" v-if="notification > 0">
          {{ notification > 99 ? 99 : notification }}
        </div>
      </div>
      <div class="retro-button" @click="onFriendsClick">
        <img src="@/assets/images/lobby/menu/your_friend.png" alt="Friends Icon"/>
        <div class="button-text">
          <span>Friends</span>
        </div>
      </div>
      <div class="retro-button" @click="onBattlesClick">
        <img src="@/assets/images/lobby/menu/battle_.png" alt="Battles Icon"/>
        <div class="button-text">
          <span>Battles</span>
        </div>
      </div>
      <div class="retro-button" @click="onLeaderboardClick">
        <img src="@/assets/images/lobby/menu/trofeo.png" alt="Leaderboard Icon"/>
        <div class="button-text">
          <span>Leaderboard</span>
        </div>
      </div>
    </div>
  <ChatComponent class="chat_component"/>
  <ProfileComponent class="profile_component"/>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Player, Map, Lobby, Game } from "@/game";
import { socketClass } from "@/socket/SocketClass";
import { userStore, type Block, type Friendship, type GAME } from "@/stores/userStore";
import ChatComponent from "@/components/chat/ChatComponent.vue";
import { ConfirmButton, STATUS_CONFIRM } from "@/game/Menu/ConfirmButton";
import Router from "@/router";
import { chatStore } from "@/stores/chatStore";
import { MyLobbyButtons } from "@/composables/MyLobbyButtons";
import ProfileComponent from "../menus/ProfileComponent.vue";
import type { ChatMessage, channel } from "@/stores/chatStore";

const store = userStore();
const user = userStore().user;
const game = ref<HTMLDivElement>();
const menu = ref<HTMLDivElement>();
let lobby: Lobby | null = null;
let notification = ref(0);
const isLoad = ref(false);
const socket = socketClass.getLobbySocket();

const {
  onLeaveClick,
  onMessagesClick,
  onFriendsClick,
  onBattlesClick,
  onLeaderboardClick,
} = MyLobbyButtons();

function clearNotification () {
  notification.value = 0;
}

onMounted(() => {

  notification.value = userStore().user.friendsRequests.filter((friendship) => friendship.requesteeId === userStore().user.id).length;
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
      console.log("Challenge begin!")
			socket.off("invite_confirm_game");
			Router.push(`/game?objectId=${gameId}`);
		});

    //Block
    socket.on("block_user",  (event: Block) => {
      const existingEvent = user.block.find((block: any) => block.blockerId === event.blockerId);
      
      if (!existingEvent)
        user.block.push(event);
      // console.log("Block!", event, "Block List:", user.block);
		});

    //Unblock
    socket.on("unblock_user", (event: Block) => {
      user.block = user.block.filter((block: Block) => block.blockerId !== event.blockerId);

      console.log("Unblock!", event, "Block List:", user.block);
		});

    //Send Friend Request
    socket.on("sendFriendRequest",  (event: Friendship) => {
      const existingEvent = user.friendsRequests.find((friend: Friendship) => friend.requestorId === event.requestorId);
      
      if (!existingEvent)
        user.friendsRequests.push(event);
      //console.log("Send Friend!", event, "Friend Request:", user.friendsRequests);
      notification.value = userStore().user.friendsRequests.filter((friendship) => friendship.requesteeId === userStore().user.id).length;;
      //      Game.updateNotifications();
    });

    //Cancel Friend Request
    socket.on("cancelFriendRequest",  (event: Friendship) => {
      user.friendsRequests = user.friendsRequests.filter((friend: Friendship) => friend.requestorId != event.requestorId);

      //console.log("Cancel Friend!", event, "Friend Request:", user.friendsRequests);
      notification.value = userStore().user.friendsRequests.filter((friendship) => friendship.requesteeId === userStore().user.id).length;;
      //      Game.updateNotifications();
    });

    //Accept Friend Request
    socket.on("acceptFriendRequest",  (event: Friendship) => {
      user.friendsRequests = user.friendsRequests.filter((request: Friendship) => request.requesteeId != event.id);
      const existingEvent = user.friends.find((friend: Friendship) => friend.requesteeId === event.id);
      
      if (!existingEvent)
        user.friends.push(event);
      //console.log("Accept Friend!", event);
      notification.value = userStore().user.friendsRequests.filter((friendship) => friendship.requesteeId === userStore().user.id).length;;
      //      Game.updateNotifications();
		});
    
    //Reject Friend Request
    socket.on("rejectFriendRequest",  (event: Friendship) => {
      user.friendsRequests = user.friendsRequests.filter((request: Friendship) => request.requesteeId != event.requesteeId);
      //console.log("Reject Friend Request!", event);
      notification.value = userStore().user.friendsRequests.filter((friendship) => friendship.requesteeId === userStore().user.id).length;;
      //      Game.updateNotifications();
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
      //TODO
      const userFriend = userStore().user.friends.findIndex(user => user.id == event.id);
        if (userFriend !== -1) {
          userStore().user.friends[userFriend].status = event.status;
        }
    });

    //Update Nickname
    socket.on("updateNickname",  (event: any) => {
      chatStore().channels.forEach(channel => {
        const userIndex = channel.users.findIndex(user => user.id == event.id);
        if (userIndex !== -1) {
          channel.users[userIndex].nickname = event.nickname;
        }
      });
      userStore().user.friends.forEach(function (user)
      {
        if (user.id == event.id)
          user.nickname = event.nickname;
      });
      userStore().user.block.forEach(function (user: Block)
      {
        if (user.blocker?.id == event.id)
          user.blocker.nickname = event.nickname;
      });
      userStore().user.infoPong.historic.forEach(function (game: GAME)
      {
        if (game.winnerId == event.id)
          game.winnerNickname = event.nickname;
        else
          game.loserNickname = event.nickname;
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

.button-container {
	display: flex;
	flex-direction: row;
  	align-items: center;
	position: absolute;
	width: auto;
	text-align: center;
  height: auto;
  right: 50%;
  top: 1%;
  transform: translateX(50%);
  z-index: 20;
  gap: 10px;
}

.retro-button {
	  display: flex;
	  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  height: 4vw;
  width: 4vw;
  background: #0000006f;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 15px;
  font-size: 1.2rem;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease-in-out;
}

.retro-button:hover {
  background: #fff;
  color: #ffffff;
  border-color: #000;
}

.retro-button img {
  width: 3vw;
  height: 3vw;
  //margin-bottom: 10px;
}

.button-text {
	position: absolute;
	width: max-content; /* Takes the full width of the parent */
	font-size: calc(min(max(1rem, 1vw), 2rem));
	text-shadow: 
    -1px -1px 0 #000,  
     1px -1px 0 #000,
    -1px 1px 0 #000,
     1px 1px 0 #000;
  top: 100%; /* Positions the text right below the button */
  left: 50%;
  transform: translateX(-50%);
  text-align: center; /* Center the text */
  visibility: hidden;
  //transition: visibility 0.3s ease-in-out;
}

.retro-button:hover .button-text {
  visibility: visible;
}

.notification-badge {
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 2vw;
  height: 2vw;
  font-size: 1.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -0.5vw;
  left: 2.5vw;
  z-index: 3;
}

</style>
