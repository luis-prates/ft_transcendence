<template>
    <div class="createGame">
		<div v-if=!editing class="tittle">			
			<div style="position: absolute; font-size: 25px; left: 50%; top: 1%; transform: translateX(-50%); -webkit-text-stroke-width: 1.5px; -webkit-text-stroke-color: black; color: white;">
				New Game
			</div>
			<div class="type_div">
				<div>Type:</div>
				<button class="buttons_attribute type_div_buttons" :style="{ 'border': getSelected('type', 1) || 'none' }" @click="changeTypeCurrent(1)">
					Solo</button>
				<button class="buttons_attribute type_div_buttons" style="left: 48%;" :style="{ 'border': getSelected('type', 2) || 'none' }" @click="changeTypeCurrent(2)">
					Multiplayer</button>
			</div>
			<div class="type_div" style="top: 35%;">
				<div>Score:</div>
				<button class="buttons_attribute type_div_buttons" style="left: 30%;" :style="{ 'border': getSelected('score', 3) || 'none' }" @click="changeScoreCurrent(3)">
					3</button>
				<button class="buttons_attribute type_div_buttons" style="left: 45%;" :style="{ 'border': getSelected('score', 6) || 'none' }" @click="changeScoreCurrent(6)">
					6</button>
				<button class="buttons_attribute type_div_buttons" style="left: 60%;" :style="{ 'border': getSelected('score', 9) || 'none' }" @click="changeScoreCurrent(9)">
					9</button>
				<button class="buttons_attribute type_div_buttons" style="left: 75%;" :style="{ 'border': getSelected('score', 12) || 'none' }" @click="changeScoreCurrent(12)">
					12</button>
			</div>			
			<!-- <div>View:</div> -->
			<div class="buttons_div" >
				<button class="buttons_attribute" @click="createGame()">Start Game</button>
			</div>
		</div>
		
		<div class="type_div" style="height: 30% ; top: 50%">
				<div style="position: absolute; left: 50%; transform: translateX(-50%);">Table:</div>
				<div class="table_image" :style="{ 'background-color': selectedColor }">
					<img v-if="asDefaultTable()" id="tableImage" :src="getTable()" class="user_paddle_image" :style="{ 'background-color': selectedColor }">
					<div class="separator-line horizontal"></div>
					<div class="separator-line vertical"></div>
				</div>
				
		</div>
		<div v-if=editing class="tittle">
			<div style="position: absolute; font-size: 25px; left: 50%; top: 1%; transform: translateX(-50%); -webkit-text-stroke-width: 1.5px; -webkit-text-stroke-color: black; color: white;">
				Custom
			</div>
			<div
                style="position: absolute; left: 50%; top: 20%; height: 10%; -webkit-text-stroke-width: 1.25px; -webkit-text-stroke-color: black; color: white; font-size: 19px; font-family: 'Press Start 2P'; transform: translateX(-50%);">
                Color:
				<input class="color_input" type="color" id="colorPicker" v-model=selectedColor>
            </div>
            <div>
                <i class="arrow-icon left" @click="changeTablePage(-1)"></i>
                <i class="arrow-icon right" @click="changeTablePage(1)"></i>
            </div>
			<button class="buttons_attribute type_div_buttons" style="position: absolute; top: 90% ; left: 50%; transform: translateX(-50%);" :disabled="isChange()" @click="saveTable()">
				Save</button>
		</div>
		<button class="buttons_attribute type_div_buttons" style="top: 80% ; left: 50%; transform: translateX(-50%);" @click="changeForEdit()">
					{{ getCustomName() }}</button>
		<div class="close-button" @click="closeCreateGame()"></div>
	</div>

</template>

<script setup lang="ts">
import { TypeSkin, skin } from '@/game/ping_pong/Skin';
import { userStore } from '@/stores/userStore';
import { getCurrentInstance, nextTick, onMounted, ref } from "vue";
import sound_close_tab from "@/assets/audio/close.mp3";
import { socketClass } from "@/socket/SocketClass";
import type { Socket } from 'socket.io-client';
import Router from '@/router';

const close_sound = new Audio(sound_close_tab);
const instance = getCurrentInstance();

const lobbySocket: Socket = socketClass.getLobbySocket();
let gameSocket: Socket = socketClass.getGameSocket();

const props = defineProps<{ data: any }>();

const editing = ref(false);
const typeCurrent = ref(1);
const scoreCurrent = ref(3);

const user = userStore().user;
const currentPageTable = ref(user.infoPong.skin.tables.findIndex(table => table === user.infoPong.skin.default.tableSkin));
const selectedColor = ref(user.infoPong.skin.default.tableColor);


function getSelected(type: string,  number: number) {

	if (type == "type" && number == typeCurrent.value)
		return "2px solid red";
	else if (type == "score" && number == scoreCurrent.value)
		return "2px solid red";
	return "2px solid black";
}

function changeTypeCurrent(value: number)
{
	close_sound.play();
	typeCurrent.value = value;
}

function changeScoreCurrent(value: number)
{
	close_sound.play();
	scoreCurrent.value = value;
}

function changeForEdit()
{
	close_sound.play();
	editing.value = !editing.value;
}

function asDefaultTable() {
    return currentPageTable.value < 0 ? false : true;
}


function getTable() {
    const skinPadle = (currentPageTable.value < 0 ? "" : user.infoPong.skin.tables[currentPageTable.value]);

    return skin.get_skin_src(TypeSkin.Table + "_" + skinPadle);
}

function changeTablePage(index: number) {
    if (currentPageTable.value + index < -1 || currentPageTable.value + index == user.infoPong.skin.tables.length)
        return;
	close_sound.play();
    currentPageTable.value += index;
}

function getCustomName() {
	if (!editing.value)
		return "Custome";
	return "Back";
}

function isChange() {
	return !(user.infoPong.skin.default.tableColor != selectedColor.value || user.infoPong.skin.default.tableSkin != user.infoPong.skin.tables[currentPageTable.value])
}

function saveTable() {
	close_sound.play();

	const tableSkin = user.infoPong.skin.tables[currentPageTable.value];

	user.infoPong.skin.default.tableColor = selectedColor.value;
    user.infoPong.skin.default.tableSkin = tableSkin;
    userStore().updateTableDefault(selectedColor.value, tableSkin);
}

async function createGame() {
	
	const data = props.data;
	const skinImage = getTable();
	
	console.log({ objectId: data.objectId, maxScore: scoreCurrent.value, table: selectedColor.value, tableSkin: skinImage, bot: typeCurrent.value == 1 });
	
	const gameCreate = await userStore().createGame(user.id, { objectId: data.objectId, maxScore: scoreCurrent.value, table: selectedColor.value, tableSkin: skinImage, bot: typeCurrent.value == 1 });
	if (gameCreate?.id) {
	  data.objectId = gameCreate.id;
	  data.objectId = gameCreate.id;
	  lobbySocket.emit("new_gameobject", data);
	  Router.push(`/game?objectId=${data.objectId}`);
	}
	else
	{
		//TODO ERRO
	}
}

function closeCreateGame() {
	close_sound.play();
    instance?.emit("close-createGame");
}

onMounted(() => {
    socketClass.setGameSocket({
      query: {
        userId: user.id,
      },
    });
    gameSocket = socketClass.getGameSocket();
});

</script>

<style scoped lang="scss">

.createGame {
    position: absolute;
    left: 50%;
    top: 50%;
	transform: translate(-50%, -50%);
    width: 450px; //35%;
    height: 640px; //75%
    background-color: #FFC857;
    border: 2px solid black;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	font-family: 'Press Start 2P';
}

.tittle {
	position: absolute;
    font-size: 15px;
    color: black;
	width: 100%;
	height: 100%;
    // -webkit-text-stroke-width: 0.9px;
    // -webkit-text-stroke-color: black;
}

.type_div {
	position: absolute;
    width: 90%;
    height: 10%;
    top: 20%;
    left: 5%;
}

.buttons_attribute.type_div_buttons {
	position: absolute;
    left: 23%;
    top: -10%;
    font-size: 18px;
}

.table_image {
	position: absolute;
	top: 15%;
	left: 50%;
    width: 250px;
    height: 150px;
	transform: translateX(-50%);
	border: 6px solid white;
}

#tableImage {
	position: absolute;
	left: -6px;
	top: -6px;
	width: 250px;
    height: 150px;
	border: 6px solid white;
}

.separator-line {
  position: absolute;
  background-color: white;
}

.horizontal {
  top: 50%;
  left: 0;
  width: 100%;
  height: 5px;
  transform: translateY(-50%);
}

.vertical {
  top: 0;
  left: 50%;
  width: 5px;
  height: 100%;
  transform: translateX(-50%);
}

.buttons_attribute.score_div_buttons {
	position: absolute;
    left: 30%;
    top: -10%;
    font-size: 18px;
}


.buttons_div {
	position: absolute;
	top: 90%;
	left: 75%;
	width: 100%;
	transform: translate(-50%);
	border-radius: 10px;
}

.buttons_attribute {
	position: absolute;
    // -webkit-text-stroke-color: black;
	// color: yellow;
    // -webkit-text-stroke-width: 1px;
    font-size: 20px;
	border-radius: 10px;
	background-color: white;
	transition: opacity 0.3 ease;
}

.buttons_attribute:hover {
	cursor: pointer;
	opacity: 0.5;
}

.color_input {
	position: absolute;
    padding: 0;
    appearance: none;
    width: 70px;
    height: 70px;
    cursor: pointer;
    vertical-align: middle;
    border: 2px solid black;
	border-radius: 10px;
    top: 80%;
    left: 50%;
    transform: translateX(-50%);
}

input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
}

input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 8px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}


.gridpaddle-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    position: absolute;
    top: 60%;
    width: 100%;
}

.gridpaddle-item {
    flex: 1 1 calc(25% - 1px);
    margin: 0 0.1px;
    margin-bottom: 20px;
    box-sizing: border-box;
}



.arrow-icon {
    position: absolute;
    top: 405px;
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
    ;
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
