<template>
	<div class="confirm_button">
		<div class="confirm_button_text buttons_attribute_tittle">{{ props.title}}</div>
		<div class="confirm_button_text">{{ props.message }}</div>
		<button class="buttons_attribute" @click="closeButton">Cancel</button>
		<button class="buttons_attribute" style="left: 55%;" @click="handleConfirmClick">Confirm</button>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const props = defineProps<{ title: string, message: string, confirmFunction: Function}>(); //, type: number, timeOut?: number
const instance = getCurrentInstance();

function closeButton() {
    instance?.emit("cancelButton");
}

function handleConfirmClick() {
    props.confirmFunction();
    closeButton();
}

</script>

<style scoped lang="scss">

.confirm_button {
	background-color: #FFC857;
    border-radius: 10px;
    border: 3px solid black;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    top: 40%;
    width: 300px;
    height: 250px;
}

.confirm_button_text {
    position: absolute;
    top: 25%;
    left: 0%;
    word-wrap: break-word;
    max-width: 90%;
    font-size: 20px;
    font-family: "Press Start 2P";
    color: white;
    text-align: center;
    -webkit-text-stroke-width: 0.9px;
    -webkit-text-stroke-color: black;
}

.buttons_attribute_tittle {
	position: absolute;
	top: 5%;
	left: 50%;    
	transform: translate(-50%);
	color: yellow;
    -webkit-text-stroke-width: 1.5px;
    font-size: 20px;
}

.buttons_attribute {
	position: absolute;
	top: 80%;
	left: 5%;
    border: 3px solid #000000;
    border-radius: 10px;
    transition: opacity 0.3s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    font-family: 'Press Start 2P';
}

.buttons_attribute:hover {
    cursor: pointer;
    opacity: 0.6;
}


</style>
