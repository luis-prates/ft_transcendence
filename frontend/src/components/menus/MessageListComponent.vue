<template>
	<div class="friendRequest_board">
		<img class="background_friendsRequest" :src="friend_image">
		<div class="friendRequest_title">{{ getTitle() }}</div>
		<transition name="fade" mode="out-in">
			<div class="grid-container" :key="currentPage">
				<div v-for="(friend, index) in currentPageBoard()" :key="index">
					<div style="height: 100%; height: 100%;">
						<div class="friendRequest_content" @click="openProfile(friend)" :style="{ width: getwidth() }">
							<!-- <img class="friendRequest_image" :src="getPhoto(friend)"> -->
							<p class="friendRequest_nickname">{{ getNickname(friend) }}</p>
						</div>
						<button v-if="button1IsVisible()" class="friend_accept" @click="clickButton1(friend)">
							Accept
						</button>
						<button v-if="button2IsVisible()" class="friend_accept" :style="{ backgroundColor: getColor() }"
							style="right: 0%;" @click="clickButton2(friend)">
							{{ getLabelButton() }}
						</button>
					</div>
				</div>
			</div>
		</transition>
		<div class="pagination-buttons">
			<i class="arrow-icon left" @click="changePage(-1)"></i>
			<i class="arrow-icon right" @click="changePage(1)"></i>
		</div>
		<div class="close-button" @click="closeBoard()"></div>
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

const props = defineProps<{ menu: number }>();

const defaultAvatar = default_Avatar;
const message_image = messageImage;
const friend_image = friendImage;
const close_sound = new Audio(sound_close_tab);

const instance = getCurrentInstance();

const currentPage = ref(0);
const usersPerPage = 8;

const users = ref([] as any);

function getTitle() {
	if (props.menu == 1)
		return "Request";
	else if (props.menu == 2)
		return "Block";
	else if (props.menu == 3)
		return "Blocked";
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

function getNickname(friend: any) {
	if (props.menu == 1)
		return friend.requestorName;
	else if (props.menu == 2)
		return friend.blocked.nickname;
	else
		return friend.blocker.nickname;
}

function openProfile(friend: any) {
	let userId;
	if (props.menu == 1)
		userId = friend.requestorId;
	else if (props.menu == 2)
		userId = friend.blockedId;
	else
		userId = friend.blockerId;

	close_sound.play();
	if (userId != userStore().user.id)
		userStore().userSelected = userId;
	else
		userStore().userSelected = "me";
}

function closeBoard() {
	close_sound.play();
	instance?.emit("close-message-list");
}

async function clickButton1(friend: any) {
	close_sound.play();
	if (props.menu == 1) {
		await userStore().acceptFriendRequest(friend.requestorId, friend.requestorName);
		users.value = userStore().user.friendsRequests.filter((request: { requestorId: number; }) => request.requestorId !== userStore().user.id);
	}
}

async function clickButton2(friend: any) {
	close_sound.play();
	if (props.menu == 1) {
		await userStore().rejectFriendRequest(friend.requestorId);
		users.value = userStore().user.friendsRequests.filter((request: { requestorId: number; }) => request.requestorId !== userStore().user.id);
	}
	else if (props.menu == 2) {
		await userStore().unblockUser(friend.blockedId);
		users.value = userStore().user.block.filter((block: any) => block.blockedId !== userStore().user.id);
	}
}

function button1IsVisible() {
	if (props.menu == 1)
		return true;
	return false;
}

function button2IsVisible() {
	if (props.menu == 3)
		return false;
	return true;
}

function getColor() {
	if (props.menu == 1)
		return "red";
	return "green";
}

function getwidth() {
	if (props.menu == 1)
		return "65%";
	else if (props.menu == 2)
		return "80%";
	return "95%";
}

function getLabelButton() {
	if (props.menu == 1)
		return "Reject";
	return "Unblock";
}

onMounted(async () => {
	if (props.menu == 1)
		users.value = userStore().user.friendsRequests.filter((request: { requestorId: number; }) => request.requestorId !== userStore().user.id);
	else if (props.menu == 2)
		users.value = userStore().user.block.filter((block: any) => block.blockedId !== userStore().user.id);
	else
		users.value = userStore().user.block.filter((block: any) => block.blockerId !== userStore().user.id);
});
</script>

<style scoped lang="scss">
.friendRequest_board {
	position: absolute;
	width: 350px;
	height: 450px;
	left: 50%;
	top: 10%;
	background-color: rgba(192, 192, 192, 0.6);
	border-radius: 10px;
	border: 2px solid #8B4513;
	transform: translate(-50%);
}

.background_friendsRequest {
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 3%;
}

.grid-container {
	position: absolute;
	left: 5%;
	top: 15%;
	width: 90%;
	height: 75%;
	display: grid;
	gap: 1%;
	font-size: 10px;
	grid-template-rows: repeat(auto-fill, minmax(37px, 1fr));
	align-items: center;
}


.friendRequest_title {
	position: absolute;
	left: 50%;
	transform: translate(-50%);
	top: 1%;
	font-size: 25px;
	font-family: 'Press Start 2P';
	color: gold;
	-webkit-text-stroke-width: 1.1px;
	-webkit-text-stroke-color: #8B4513;
}

.gridpaddle-item {
	position: relative;
}

.friendRequest_content {
	position: relative;
	font-family: "Press Start 2P";
	font-size: 20px;
	transition: opacity 0.3s ease;
	height: 35px;
	width: 65%;
	left: 2.5%;
	background-color: #efaa26;
	border-radius: 10px;
	border: 1px solid black;
	-webkit-text-stroke-width: 1px;
	-webkit-text-stroke-color: black;
	color: silver;
	transition: opacity 0.3 ease;
}

.friendRequest_content:hover {
	cursor: pointer;
	opacity: 0.8;
}

.friendRequest_image {
	position: absolute;
	width: 30px;
	height: 27.5px;
	left: 5%;
	top: 10%;
	border-radius: 10px;
	border: 1px solid black;
	transition: opacity 0.3 ease;
}

.friend_accept {
	position: absolute;
	right: 16%;
	width: 15%;
	height: 35px;
	top: 0%;
	/* transform: translateY(-50%); */
	background-color: green;
	border: 1px solid black;
	border-radius: 8px;
}

.friend_accept:hover {
	cursor: pointer;
	opacity: 0.75;
}

.friend_message.button {
	position: absolute;
	height: 100%;
	width: 100%;
}

.friendRequest_nickname {
	position: absolute;
	width: 70%;
	height: 10px;
	left: 5%;
	top: 15%;
	font-size: 16px;
	// transform: translateX(-50%);
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