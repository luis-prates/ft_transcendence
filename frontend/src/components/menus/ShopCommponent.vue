<template>
	<div class="shop">
		<div class="shop_tittle">Shop</div>
		<div class="shop_money">Your Money: {{ userStore().user.money }}₳</div>
		<div class="amelia_window">
			<div class="amelia_photo"></div>
			<div id="amelia_say" class="typewriter">Welcome to my Shop!</div>
		</div>
        <transition name="fade" mode="out-in">
            <div class="grid-container" :key="currentPage">
				<div v-for="(item, index) in currentPageSkin()" :key="index" class="gridpaddle-item" @click="buyItem(item)">
					<div class="item-content">
						<h3 class="item-title">{{ item.tittle }}</h3>
						<SkinComponent :skin="item.name" :type="item.type"/>
						<p class="item-price">{{ getPrice(item) }}</p>
					</div>
				</div>
            </div>
        </transition>
        <div class="pagination-buttons">
            <i class="arrow-icon left" @click="changePage(-1)"></i>
            <i class="arrow-icon right" @click="changePage(1)"></i>
        </div>
        <div class="close-button" @click="closeShop()"></div>

	</div>
</template>

<script setup lang="ts">
import SkinComponent from "./SkinComponent.vue"
import { TypeSkin, skin, type ProductSkin } from '@/game/ping_pong/Skin';
import { userStore, type GAME, type User } from "@/stores/userStore";
import { getCurrentInstance, ref } from 'vue';
import sound_caching from "@/assets/audio/caching.mp3";
import sound_close_tab from "@/assets/audio/close.mp3";

const instance = getCurrentInstance();

const user = userStore().user;
const user_skins = ref(skin.skins) ;
const currentPage = ref(0);
const skinsPerPage = 8;
const buy_sound = new Audio(sound_caching);
const close_sound = new Audio(sound_close_tab);

function youHaveThis(item: ProductSkin) {
    if (item.type == TypeSkin.Paddle && !user.infoPong.skin.paddles.includes(item.name as never)) return false;
	else if (item.type == TypeSkin.Table && !user.infoPong.skin.tables.includes(item.name as never)) return false;

	return true;
}

function getPrice(item: ProductSkin)
{
	if (youHaveThis(item))
		return "You have this Skin!";
	if (item.price == 0)
		return "FREE";
	return item.price + "₳"
}

function currentPageSkin() {
    const startIndex = currentPage.value * skinsPerPage;
    const endIndex = startIndex + skinsPerPage;
    const matches = user_skins.value;
    return matches.slice(startIndex, endIndex);
}

function changePage(step: number) {
    if (currentPage.value + step >= 0 && currentPage.value + step < Math.ceil(user_skins.value.length / skinsPerPage)) {
        currentPage.value += step;
        currentPageSkin();
		close_sound.play();
    }
}

function buyItem(item: ProductSkin) {
	const ameliaSay = document.getElementById("amelia_say") as HTMLDivElement;

	if (youHaveThis(item))
		ameliaSay.innerText = "You already have this Skin!";
    else if (user.money >= item.price) {
		if (item.type == TypeSkin.Paddle) user.infoPong.skin.paddles.push(item.name as never);
        else if (item.type == TypeSkin.Table) user.infoPong.skin.tables.push(item.name as never);
        user.money -= item.price;
        buy_sound.play();

		userStore().buy_skin(item.name, item.type, item.price);
		ameliaSay.innerText = "You bought \"" + item.tittle + "\" " + (item.type == TypeSkin.Paddle ? "Paddle" : "Table") + " for " + item.price + "₳! Thank You!"
    } else
		ameliaSay.innerText = "You don't have enough money to buy this Skin.";
}

function closeShop() {
	close_sound.play();
    instance?.emit("close-shop");
}

</script>

<style scoped lang="scss">

.shop {
    position: absolute;
    background-color: rgba(210, 180, 140, 0.7);
    border-radius: 10px;
    border: 3px solid black;
    width: 1000px;
    height: 550px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.shop_tittle {
	position: absolute;
    top: 1%;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Press Start 2P';
    font-size: 30px;
    -webkit-text-stroke-width: 1.8px;
    -webkit-text-stroke-color: black;
    color: gold;
}

.shop_money {
	position: absolute;
    top: 2%;
    left: 5%;
    font-family: "Press Start 2P";
    font-size: 15px;
    -webkit-text-stroke-width: 1.1px;
    -webkit-text-stroke-color: black;
    color: white;
}

.grid-container {
    position: absolute;
    left: 23%;
    top: 12.5%;
    width: 75%;
    height: 72.5%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1%;
    align-items: center;
}

.gridpaddle-item {
    position: relative;
}

.item-content {
    text-align: center;
    font-family: 'Press Start 2P';
	font-size: 10px;
    transition: opacity 0.3s ease;
}

.item-content:hover {
    cursor: pointer;
    opacity: 0.5;
}

.item-title {
    margin-bottom: 5px;
    font-size: 15px;
    -webkit-text-stroke-width: 0.8px;
    -webkit-text-stroke-color: black;
    color: silver;
}

.item-price {
    margin-top: 5px;
    font-size: 13px;
    -webkit-text-stroke-width: 0.6px;
    -webkit-text-stroke-color: black;
    color: gold;
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
	top: 90%;
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
    left: 30%;
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
    left: 1%;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.close-button:hover {
    background-color: darkred;
    color: white;
}

.amelia_window {
	position: absolute;
    width: 20%;
    height: 80%;
    top: 8%;
    left: 2%;
    border: 2px solid black;
    background-color: white;
    border-radius: 10px;
}

.amelia_photo {
    position: absolute;
    width: 85%;
    height: 30%;
    top: 4%;
    left: 50%;
    background-image: url('src/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg');
    background-size: 1500% 1500%;
    background-position-x: -835px;
    background-position-y: -40px;
    transform: translateX(-50%);
	background-color: gold;
	border: 2px solid black;
	animation: slideBackground 5s infinite alternate;
}

@keyframes slideBackground {
    0% {
        background-size: 1500% 1500%;
		background-position-x: -835px;
    	background-position-y: -40px;
    }
	100% {
        background-size: 1700% 1700%;
		background-position-x: -960px;
    	background-position-y: -40px;
	}
}

@keyframes typing {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.typewriter {
    position: absolute;
    left: 5%;
    top: 35%;
    height: 100px;
    max-width: 90%;
    overflow: hidden;
    animation: typing 2s 1s 1 normal both;
}
</style>
