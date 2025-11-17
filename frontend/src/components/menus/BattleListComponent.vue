<template>
	<div class="battlelist_board">
		<img class="background_battlelist" :src="battleImage">
		<div class="battlelist_title">{{ getTitle() }}</div>
		<transition name="fade" mode="out-in">
			<div class="grid-container" :key="currentPage">
				<div v-for="(game, index) in currentPageBoard()" :key="index">
					<div class="battlelist_content" @click="enterGame(game)">
						<img v-if="isVisible(0, game)" class="game_image" :src="getPhoto(0, game)">
						<p v-if="isVisible(0, game)" class="game_nickname">{{ getNickname(0, game) }}</p>
						<img class="game_image game_vs_image" :src="vsImage">
						<img v-if="isVisible(1, game)" class="game_image" style="left: 91%;" :src="getPhoto(1, game)">
						<p v-if="isVisible(1, game)" class="game_nickname" style="left: 57.5%;">{{ getNickname(1, game) }}
						</p>
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
import { GameStatus, userStore, type GAME } from '@/stores/userStore';
import sound_close_tab from "@/assets/audio/close.mp3";
import default_Avatar from "@/assets/chat/avatar.png";

import vs_image from "@/assets/images/lobby/menu/vs.png";
import battle_image from "@/assets/images/lobby/menu/battle.png";
import Router from '@/router';

const props = defineProps<{ menu: number }>();

const defaultAvatar = default_Avatar;
const vsImage = vs_image;
const battleImage = battle_image;
const close_sound = new Audio(sound_close_tab);

const instance = getCurrentInstance();

const currentPage = ref(0);
const usersPerPage = 8;

const users = ref([] as any);

function getTitle() {
	if (props.menu == 1)
		return "Waiting";
	return "Actives";
}

function currentPageBoard() {
	const startIndex = currentPage.value * usersPerPage;
	const endIndex = startIndex + usersPerPage;
	const battleList = users.value;
	return battleList.slice(startIndex, endIndex);
}

function changePage(step: number) {
	if (currentPage.value + step >= 0 && currentPage.value + step < Math.ceil(users.value.length / usersPerPage)) {
		currentPage.value += step;
		currentPageBoard();
		close_sound.play();
	}
}

function getNickname(nb: number, game: GAME) {
	return game.players[nb]?.nickname;
}

function getPhoto(nb: number, game: GAME) {
	return game.players[nb].image ? game.players[nb].image : defaultAvatar;
}

function enterGame(game: GAME) {
	close_sound.play();
	Router.push(`/game?objectId=${game.id}`);
}

function closeBoard() {
	close_sound.play();
	instance?.emit("close-battle-list");
}

function isVisible(nb: number, game: GAME) {
	if (game.players[nb])
		return true;
	return false;
}

async function getGames() {
	if (props.menu == 1) {
		const game = await userStore().getGames(GameStatus.NOT_STARTED);
		users.value = game;
	}
	else {
		const game = await userStore().getGames(GameStatus.IN_PROGESS);
		users.value = game;
	}
}

onMounted(async () => {
	getGames();
});
</script>

<style scoped lang="scss">
.battlelist_board {
	position: absolute;
	width: 450px;
	height: 450px;
	left: 50%;
	top: 10%;
	background-color: rgba(192, 192, 192, 0.6);
	border-radius: 10px;
	border: 2px solid #8B4513;
	transform: translate(-50%);
}

.background_battlelist {
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


.battlelist_title {
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

.battlelist_content {
	position: relative;
	font-family: "Press Start 2P";
	font-size: 20px;
	transition: opacity 0.3s ease;
	height: 35px;
	width: 95%;
	left: 2.5%;
	background-color: #efaa26;
	border-radius: 10px;
	border: 1px solid black;
	-webkit-text-stroke-width: 1px;
	-webkit-text-stroke-color: black;
	color: silver;
	transition: opacity 0.3 ease;
}

.battlelist_content:hover {
	cursor: pointer;
	opacity: 0.8;
}

.game_image {
	position: absolute;
	width: 30px;
	height: 27.5px;
	left: 1%;
	top: 10%;
	border-radius: 10px;
	border: 1px solid black;
	transition: opacity 0.3 ease;
}


.game_image.game_vs_image {
	left: 50%;
	transform: translateX(-50%);
	border: 0px;
	border-radius: 0px;
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

.game_nickname {
	position: absolute;
	width: 30%;
	height: 10px;
	left: 10%;
	top: 15%;
	font-size: 16px;
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