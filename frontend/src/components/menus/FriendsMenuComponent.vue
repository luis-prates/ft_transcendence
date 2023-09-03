<template>
	<div class="friend_board">
		<img class="background_friends" :src="friend_image">
		<div class="friend_title">Friends</div>
		<transition name="fade" mode="out-in">
			<div class="grid-container" :key="currentPage">
				<div v-for="(friend, index) in currentPageBoard()" :key="index">
					<div class="friend_content" @click="openProfile(friend.id)">
						<img class="friend_image" :src="getPhoto(friend)">
						<span id="user-status" :class="getStatus(friend.status)"></span>
						<p class="friend_nickname">{{ friend.nickname }}</p>
					</div>
					<button class="friend_message" @click="sendDm">
						<img class="friend_message button" :src="message_image">
					</button>
				</div>
			</div>
		</transition>
		<div class="pagination-buttons">
			<i class="arrow-icon left" @click="changePage(-1)"></i>
			<i class="arrow-icon right" @click="changePage(1)"></i>
		</div>
		<div class="close-button" @click="closerBoard()"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue';
import { userStore } from '@/stores/userStore';
import sound_close_tab from "@/assets/audio/close.mp3";
import default_Avatar from "@/assets/chat/avatar.png";

import friendImage from "@/assets/images/lobby/menu/your_friend.png";
import messageImage from "@/assets/chat/dm_messages.png";
import avatarDefault from "@/assets/chat/avatar.png";

const defaultAvatar = default_Avatar;
const message_image = messageImage;
const friend_image = friendImage;
const close_sound = new Audio(sound_close_tab);

const instance = getCurrentInstance();

const currentPage = ref(0);
const usersPerPage = 10;

const users = ref(userStore().user.friends);

function getStatus(status: string) {
	return "online_icon " + status;
}

function currentPageBoard() {
	const startIndex = currentPage.value * usersPerPage;
	const endIndex = startIndex + usersPerPage;
	const leaderBoard = users.value;
	return leaderBoard.slice(startIndex, endIndex);
}

function changePage(step: number) {
	if (currentPage.value + step >= 0 && currentPage.value + step < Math.ceil(users.value.length / usersPerPage)) {
		currentPage.value += step;
		currentPageBoard();
		close_sound.play();
	}
}

function getPhoto(player: any) {
	return player.image ? player.image : defaultAvatar;
}

function openProfile(userId: number) {
	close_sound.play();
	if (userId != userStore().user.id)
		userStore().userSelected = userId;
	else
		userStore().userSelected = "me";
}

function closerBoard() {
	close_sound.play();
	instance?.emit("close-friends");
}

function sendDm() {
	// TODO SEND DM
	console.log("send DM");
}

onMounted(async () => {

});
</script>

<style scoped lang="scss">
.friend_board {
	position: absolute;
	width: 450px;
	height: 555px;
	left: 50%;
	top: 10%;
	background-color: rgba(192, 192, 192, 0.6);
	border-radius: 10px;
	border: 2px solid #8B4513;
	transform: translate(-50%);
}

.background_friends {
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 3%;
}

.grid-container {
	position: absolute;
	left: 5%;
	top: 11%;
	width: 90%;
	height: 75%;
	display: grid;
	gap: 1%;
	font-size: 10px;
	grid-template-rows: repeat(auto-fill, minmax(37px, 1fr));
	align-items: center;
}


.friend_title {
	position: absolute;
	left: 50%;
	transform: translate(-50%);
	top: 1%;
	font-size: 20px;
	font-family: 'Press Start 2P';
	color: gold;
	-webkit-text-stroke-width: 1.1px;
	-webkit-text-stroke-color: #8B4513;
}

.gridpaddle-item {
	position: relative;
}

.friend_content {
	position: relative;
	font-family: "Press Start 2P";
	font-size: 20px;
	transition: opacity 0.3s ease;
	height: 35px;
	width: 95%;
	left: 2.5%;
	background-color: grey;
	border-radius: 10px;
	border: 1px solid black;
	-webkit-text-stroke-width: 1px;
	-webkit-text-stroke-color: black;
	color: silver;
}

.friend_content:hover {
	cursor: pointer;
	opacity: 0.8;
}

.friend_image {
	position: absolute;
	width: 30px;
	height: 27.5px;
	left: 2%;
	top: 10%;
	border-radius: 10px;
	border: 1px solid black;
}

#user-status {
	position: absolute;
	left: 8%;
	top: 65%;
	height: 10px;
	width: 10px;
	border: 1px solid #000000;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.friend_nickname {
	position: absolute;
	width: 10px;
	height: 10px;
	left: 15%;
	top: 15%;
	font-size: 16px;
	transform: translateX(-50%);
}

.friend_message {
	position: absolute;
	right: 5%;
	width: 30px;
	height: 30px;
	top: 50%;
	transform: translateY(-50%);
	background-color: transparent;
	border: 0px;
}

.friend_message.button {
	position: absolute;
	height: 100%;
	width: 100%;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.1s;
}


.fade-enter,
.fade-leave-to {
	opacity: 0;
}

.pagination-buttons {
	top: 92.5%;
}

.arrow-icon {
	position: absolute;
	width: 0;
	height: 0;
	border-style: solid;
	cursor: pointer;
	border-width: 16px 20px 16px 20px;
}

.arrow-icon.left {
	left: 10%;
	border-color: transparent black transparent transparent;
	transition: border-color 0.3s ease;
}

.arrow-icon.left:hover {
	border-color: transparent grey transparent transparent;
}

.arrow-icon.right {
	right: 10%;
	border-color: transparent transparent transparent black;
	transition: border-color 0.3s ease;
}

.arrow-icon.right:hover {
	border-color: transparent transparent transparent grey;
}


.close-button {
	position: absolute;
	background-color: red;
	border: 2px solid black;
	color: black;
	font-size: 16px;
	width: 17.5px;
	height: 17.5px;
	top: 2%;
	left: 2%;
	cursor: pointer;
	transition: background-color 0.3s ease, color 0.3s ease;
}

.close-button:hover {
	background-color: darkred;
	color: white;
}
</style>