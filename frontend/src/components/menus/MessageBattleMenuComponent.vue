<template>
	<div class="friend_board">
		<img class="background_friends" :src="getImage()">
		<div class="friend_title">{{ getLabel(0) }}</div>
		<div class="buttons_menus">
			<button class="buttons_attribute" :style="{ backgroundColor: getBackgroundColor() }" @click="clickButton(1)">
				{{ getLabel(1) }}</button>
			<button class="buttons_attribute" :style="{ backgroundColor: getBackgroundColor() }" @click="clickButton(2)">
				{{ getLabel(2) }}</button>
			<button class="buttons_attribute" :style="{ backgroundColor: getBackgroundColor() }" @click="clickButton(3)">
				{{ getLabel(3) }}</button>
		</div>
		<div class="close-button" @click="closerBoard()"></div>
	</div>
	<MessageListComponent v-if="messageList" :menu="menuType" @close-message-list="closeMenu()"/>
	<!-- <BattleListComponent v-if="battleList" :menu="menuType" @close-battleList="closeMenu()"/> -->
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';
import sound_close_tab from "@/assets/audio/close.mp3";

import messageImage from "@/assets/chat/dm_messages.png";
import battleImage from "@/assets/images/lobby/menu/battle.png";
import MessageListComponent from "../menus/MessageListComponent.vue";

const props = defineProps<{ menu: number }>();

const message_image = messageImage;
const battle_image = battleImage;
const close_sound = new Audio(sound_close_tab);

const instance = getCurrentInstance();
const messageList = ref(false);
const battleList = ref(false);
const menuType = ref(0);

function closerBoard() {
	close_sound.play();
	instance?.emit("close-menus");
}

function getBackgroundColor()
{
	if (props.menu == 1)
		return "#efaa26";
	else if (props.menu == 2)
		return 'rgba(192, 57, 43, 0.9)';
}

function clickButton(value: number) {
	close_sound.play();

	closeMenu();
	if (props.menu == 1)
	{
		messageList.value = true;
		menuType.value = value;
	}
	else if (props.menu == 2)
	{
		if (value == 3)
		{

		}
		else
		{
			battleList.value = true;
			menuType.value = value;
		}
	}
}

function getLabel(value: number) {
	if (props.menu == 1)
	{
		if (value == 0)
			return "Messages";
		else if (value == 1)
			return "Request Friends";
		else if (value == 2)
			return "Your Block List";
		else if (value == 3)
			return "Who Blocked You!";
	}
	else if (props.menu == 2)
	{
		if (value == 0)
			return "Battles";
		else if (value == 1)
			return "Battles Waiting";
		else if (value == 2)
			return "Battles Actives";
		else if (value == 3)
			return "Match Making!";
	}
	return "";
}

function getImage()
{
	if (props.menu == 1)
	{
		return message_image;
	}
	else
	{
		return battle_image;
	}
}

function closeMenu()
{
	messageList.value = false;
	battleList.value = false;
	menuType.value = 0;
}


onMounted(async () => {
		
});
</script>

<style scoped lang="scss">

.friend_board {
	position: absolute;
    width: 300px;
    height: 200px;
	left: 50%;
	top: 20%;
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


.friend_title {
	position: absolute;
	left: 54.5%;
	transform: translate(-50%);
	top: 1%;
	font-size: 20px;
	font-family: 'Press Start 2P';
	color: gold;
	-webkit-text-stroke-width: 1.1px;
	-webkit-text-stroke-color: #8B4513;
}

.buttons_menus {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	top: 20%;
	width: 80%;
	height: 70%;
}

.buttons_attribute {
    border: 3px solid #000000;
    border-radius: 10px;
    transition: opacity 0.3s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	width: 100%;
	height: 25%;
	background-color: grey;
	color: white;
	font-size: 13px;
	font-family: 'Press Start 2P';
	margin: 5px 0;
	-webkit-text-stroke-width: 1.1px;
	-webkit-text-stroke-color: black;
}

.buttons_attribute:hover {
    cursor: pointer;
    opacity: 0.75;
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