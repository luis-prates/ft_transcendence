<template>
    <div class="leader_board">
		<div class="leader_tittle">LeaderBoard</div>
		<transition name="fade" mode="out-in">
            <div class="grid-container" :key="currentPage">
				<div v-for="(player, index) in currentPageBoard()" :key="index" class="grid-item" @click="openProfile(player.userId)">
					<div class="player-content" :style="{ backgroundColor: getColorRank(player), '-webkit-text-stroke-color': getColorBorder(player) }">
						<p class="player_rank">{{ player.rank }}</p>
						<img class="player_image" :src="getPhoto(player)">
						<p class="player-nickname">{{ player.nickname }}</p>
						<p class="player-points">{{ player.points }}</p>
					</div>
				</div>
            </div>
        </transition>
		<!-- <div class="player-content" style="position: absolute;top: 83%;width: 85.5%;left: 7%;background-color: red;">
						<p class="player_rank">{{ yourRank.rank }}</p>
						 <img class="player_image" :src="getPhoto(yourRank.image)">
						<p class="player-nickname">{{ yourRank.nickname }}</p>
						<p class="player-points">{{ yourRank.points }}</p> 
		</div> -->
		<div class="pagination-buttons">
            <i class="arrow-icon left" @click="changePage(-1)"></i>
            <i class="arrow-icon right" @click="changePage(1)"></i>
        </div>
		<div class="close-button" @click="closerLeaderBoard()"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue';
import { userStore } from '@/stores/userStore';
import sound_close_tab from "@/assets/audio/close.mp3";
import default_Avatar from "@/assets/chat/avatar.png";

const defaultAvatar = default_Avatar;
const close_sound = new Audio(sound_close_tab);
const instance = getCurrentInstance();

const currentPage = ref(0);
const usersPerPage = 10;

const users = ref([] as any);
const yourRank = ref();

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

function getPhoto(player: any)
{
	return player.image ? player.image : defaultAvatar;
}

function getColorRank(player: any)
{
	return  player.rank == 1 ? "gold" : (player.rank == 2 ? "silver" : (player.rank == 3 ? "#CD7F32" : "grey"));
}

function getColorBorder(player: any)
{
	return player.userId == userStore().user.id ? "red" : "black";
}

function openProfile(userId: number)
{
	close_sound.play();
    instance?.emit("close-leaderboard");
	console.log("profile: ", userId)
	if (userId != userStore().user.id)
		userStore().userSelected = userId;
	else
		userStore().userSelected = "me";
}

function closerLeaderBoard() {
	close_sound.play();
    instance?.emit("close-leaderboard");
}

onMounted(async () => {
    try {
        const leaderboardData = await userStore().getLeaderboard();
        users.value = leaderboardData;
		yourRank.value = leaderboardData.find((player: any) => player.userId == userStore().user.id);
		console.log("your Rank: ", yourRank)
    } catch (error) {
        console.error('Erro ao obter a leaderboard:', error);
    }
});
</script>

<style scoped lang="scss">

.leader_board {
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

.grid-container {
    position: absolute;
    left: 5%;
    top: 11%;
    width: 90%;
    height: 75%;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1%;
    align-items: center;
    font-size: 10px;
}

.leader_tittle {
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

.player-content {
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

.player-content:hover {
    cursor: pointer;
    opacity: 0.8;
}

.player_rank {
	width: 10px;
	height: 10px;
	left: 3%;
	top: 35%;
    font-size: 15px;
    -webkit-text-stroke-width: 0.8px;
    color: silver;
    transform: translateY(-50%);
}

.player_image {
	position: absolute;
	width: 30px;
	height: 27.5px;
	left: 10%;
	top: 10%;
    border-radius: 10px;
    border: 1px solid black;
}

.player-nickname {
	position: absolute;
	width: 10px;
	height: 10px;
	left: 25%;
	top: 15%;
    font-size: 16px;
	transform: translateX(-50%);
}

.player-points {
	position: absolute;
	width: 10px;
	height: 10px;
	left: 90%;
	top: 15%;
    font-size: 16px;
	transform: translateX(-50%);
	color: silver;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
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