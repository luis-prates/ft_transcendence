<template>
    <div v-if="isProfileActive" class="profile">
        <div class="avatar profile_components" @click="uploadImage()">
            <img id="avatarImage" :src="getPhoto()" class="user_image">
            <input id="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange">
            <span id="user-status" :class="getStatus()"></span>
        </div>
        <div>
            <div id="label-nickname" class="user-label profile_components nickname" @click="toggleInput">{{ user.nickname }}
            </div>
            <input id="inputName" type="text" pattern="[A-Za-z0-9]+" value="" :disabled=!editing
                class="profile_components user-nickname-input" @input="cleanInput" :maxlength="15" v-show="editing">
            <span class="clear-icon" v-show="isDiferent && editing" @click="updateNickname()">✓</span>
            <span class="clear-icon false-red" v-show="!isDiferent && editing" @click="cancelEdit()">X</span>
        </div>
        <div class="user-label profile_components level">Level: {{ user.infoPong.level }}</div>
        <div class="user-label profile_components money">Money: {{ user.money }}₳</div>
        <div class="user-label profile_components wins">Wins: {{ getWins() }}</div>
        <div class="user-label profile_components losts">Losts: {{ getLosts() }}</div>
        <div class="user-label profile_components qrcode">QRCode:
            <button id="qrCodeButton" class="qr-button" @click="clickQrCode()">
                <span class="">{{ getTwoFactor() }}</span>
            </button>
            <TwoFactorComponent v-if="showTwoFactor" @two-factor-status="changeTwoFactorStatus()"/>

        </div>

        <div class="user_paddle profile_components" :style="{ 'background-color': selectedColor }">
            <img v-if="isDefaultPaddle()" id="paddleImage" :src="getPaddle()" class="user_paddle_image"
                :style="{ 'background-color': selectedColor }">
        </div>

        <button class="profile-buttons profile_components save-button" :disabled=asSomeChange()
            @click="updateProfile()">Save Profile</button>

        <div class="paddle profile_components"></div>
        <div class="matches profile_components">Matches</div>
        <transition name="fade" mode="out-in">
            <div class="grid-container" :key="currentPage">
                <div v-for="(match, index) in currentPageMatches()" :key="index" class="grid-item">
                    <MatchComponent :user="user" :match="match" />
                </div>
            </div>
        </transition>
        <div class="pagination-buttons">
            <i class="arrow-icon left" @click="changePage(-1)"></i>
            <i class="arrow-icon right" @click="changePage(1)"></i>
        </div>
        <div>
            <button id="buttonAvatar" class="expand-button button1" :class="{ expanded: expanded[0] }"
                @click="toggleExpand(0)">
                <div class="expanded-content" v-if="expanded[0]">
                    <div id="imageContainer"></div>
                    <div class="pagination-buttons">
                        <i class="arrow-icon costume-avatar left" @click="changeAvatarPage(-1)"></i>
                        <i class="arrow-icon costume-avatar right" @click="changeAvatarPage(1)"></i>
                    </div>
                    <div class="close-button" @click="closeButton(0)"></div>
                </div>
            </button>
            <button id="buttonPaddle" class="expand-button button2" :class="{ expanded: expanded[1] }"
                @click="toggleExpand(1)">
                <div class="expanded-content" v-if="expanded[1]">
                    <div class="close-button" @click="closeButton(1)"></div>
                    <div style=" position: absolute; left: 50%; top: 10%; -webkit-text-stroke-width: 1.25px; -webkit-text-stroke-color: black; color: white; font-size: 19px; font-family: 'Press Start 2P'; transform: translateX(-50%);">
                        Color:
                    </div>
                    <input type="color" id="colorPicker" v-model=selectedColor>

                    <div style=" position: absolute; left: 50%; top: 48%; -webkit-text-stroke-width: 1.25px; -webkit-text-stroke-color: black; color: white; font-size: 19px; font-family: 'Press Start 2P'; transform: translateX(-50%);">
                        Skin:
                    </div>
                    <div class="gridpaddle-container" :key="currentPage">
                        <div v-for="(paddle, index) in currentPaddles()" :key="index" class="gridpaddle-item">
                            <SkinComponent :paddle="paddle" />
                        </div>
                    </div>
                    <div class="pagination-buttons">
                        <i class="arrow-icon costume-paddle left" @click="changePaddlePage(-1)"></i>
                        <i class="arrow-icon costume-paddle right" @click="changePaddlePage(1)"></i>
                    </div>
                </div>
            </button>
        </div>
        <div class="close-button button_profile" @click="closeProfile()"></div>
    </div>
</template>

<script setup lang="ts">
import { ConfirmButton, STATUS_CONFIRM } from "@/game/Menu/ConfirmButton";
import { userStore, type GAME } from "@/stores/userStore";
import { skin, TypeSkin } from "@/game/ping_pong/Skin";
import { nextTick, onMounted, ref } from "vue";
import { TwoFactor } from "@/game/Menu/TwoFactor";
import MatchComponent from "./MatchComponent.vue"
import SkinComponent from "./SkinComponent.vue"
import TwoFactorComponent from "./TwoFactorComponent.vue"
import avataresImages from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";

const defaultAvatar = "../../src/assets/chat/avatar.png";
const avatares = avataresImages;

const isProfileActive = ref(true);
const user = userStore().user;
const editing = ref(false);
const isDiferent = ref(false);
const user_matches = userStore().user.infoPong.historic;
const currentPage = ref(0);
const matchesPerPage = 4;
const showTwoFactor = ref(false);

function getWins() {
    return user.infoPong.historic.filter((history: GAME) => history.winnerId == user.id).length;
}

function getLosts() {
    return user.infoPong.historic.filter((history: GAME) => history.loserId == user.id).length;
}

function getPhoto() {
    return user.image ? user.image : defaultAvatar;
}

function getPaddle() {
    const skinPadle = (currentPagePaddle.value < 0 ? "" : user.infoPong.skin.paddles[currentPagePaddle.value]);

    return skin.get_skin_src(TypeSkin.Paddle + "_" + skinPadle);
}

function isDefaultPaddle() {
    return currentPagePaddle.value < 0 ? false : true;
}

function getStatus() {
    return "online_icon " + user.status;

}
function uploadImage() {
    const fileInput = document.getElementById("fileInput") as HTMLElement;
    fileInput.click();
}

function getTwoFactor() {
    return user.isTwoFAEnabled ? "ON" : "OFF";
}

function clickQrCode() {
    showTwoFactor.value = true;
}

function  changeTwoFactorStatus()
{
    console.log("CHANGE TWO")
    showTwoFactor.value = false;
}


function toggleInput() {
    if (editing.value == true)
        return;
    editing.value = true;
    const labelNickname = document.getElementById("label-nickname") as HTMLElement;
    labelNickname.style.display = "none";

    const inputName = document.getElementById("inputName") as HTMLInputElement;
    inputName.value = user.nickname;
    inputName.style.display = "block";
    inputName.disabled = false;
    inputName.focus();
    isNicknameDiferent();
}

function cancelEdit() {
    if (!editing.value)
        return;
    editing.value = false;
    const labelNickname = document.getElementById("label-nickname") as HTMLElement;
    labelNickname.style.display = "block";

    const inputName = document.getElementById("inputName") as HTMLInputElement;
    inputName.value = user.nickname;
    inputName.style.display = "none";
    inputName.disabled = true;
}

function currentPageMatches() {
    const startIndex = currentPage.value * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    const matches = user.infoPong.historic;
    return matches.slice(startIndex, endIndex);
}

function changePage(step: number) {
    if (currentPage.value + step >= 0 && currentPage.value + step < Math.ceil(user_matches.length / matchesPerPage)) {
        currentPage.value += step;
        currentPageMatches();
    }
}

async function handleFileChange(event: any) {
    if (event.target) {
        let fileForm = new FormData();
        const selectedFile = event.target.files[0];

        fileForm.append("image", selectedFile, selectedFile.name);
        try {
            const response = await fetch("https://api.imgbb.com/1/upload?key=d9a1c108b92558d90d3b1bd9f59a507c", {
                method: "POST",
                body: fileForm,
            });

            if (response.ok) {


                const data = await response.json();
                console.log("response data:", data);
                const avatarImage = document.getElementById("avatarImage") as HTMLImageElement;
                avatarImage.src = data.data.display_url;

                user.image = data.data.display_url;
                userStore().updateProfile();
            } else {
                throw new Error("Erro na requisição");
            }
        } catch (error) {
            console.error(error);
            new ConfirmButton(error, STATUS_CONFIRM.ERROR, 10);
        }
    }
}

function cleanInput(event: Event) {
    isNicknameDiferent();
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;
    const sanitizedValue = inputValue.replace(/[^A-Za-z0-9_-]+/g, '');
    const firstChar = sanitizedValue.charAt(0);
    if (/[0-9]/.test(firstChar))
        input.value = sanitizedValue.substring(1);
    else
        input.value = sanitizedValue;
}

function isNicknameDiferent() {
    const inputName = document.getElementById("inputName") as HTMLInputElement;

    isDiferent.value = user.nickname != inputName.value;
}

async function updateNickname() {
    const inputName = document.getElementById("inputName") as HTMLInputElement;
    const new_nickname = inputName.value;
    if (new_nickname != user.nickname) {
        if (await userStore().updateNickname(new_nickname))
            cancelEdit();
        else
            inputName.style.borderColor = "red";
    }
}

const expanded = ref([false, false]);
const current_avatar = ref(user.avatar);
const selectedColor = ref(user.infoPong.color);

function toggleExpand(index: number) {

    if (expanded.value[index])
        return;

    if (index == 0) {
        const button_avatar = document.getElementById("buttonAvatar") as HTMLButtonElement;
        expanded.value[index] = !expanded.value[index];
        button_avatar.disabled = true;
        current_avatar.value = user.avatar;
        nextTick(() => {
            changeAvatarPage(0);
        });
    }
    else {
        const button_paddle = document.getElementById("buttonPaddle") as HTMLButtonElement;
        expanded.value[index] = !expanded.value[index];
        button_paddle.disabled = true;
    }
}

function changeAvatarPage(index: number) {
    if (current_avatar.value + index < 0 || current_avatar.value + index > 7)
        return;

    const inputName = document.getElementById("imageContainer") as HTMLDivElement;
    current_avatar.value += index;
    inputName.style.backgroundPositionX = `-${79 + (88 * 3) * current_avatar.value + (7.5 * ((current_avatar.value - 3) > 0 ? 1 : 0))}px`;
    inputName.style.backgroundPositionY = `-${25 + (239 * 4) * ((current_avatar.value - 3) > 0 ? 1 : 0)}px`;
}

function closeButton(index: number) {
    expanded.value[index] = false;
    if (index == 0) {
        const button_avatar = document.getElementById("buttonAvatar") as HTMLButtonElement;
        setTimeout(() => {
            button_avatar.disabled = false;
        }, 200);
    }
    else {
        const button_paddle = document.getElementById("buttonPaddle") as HTMLButtonElement;
        setTimeout(() => {
            button_paddle.disabled = false;
        }, 200);
    }
}

function closeProfile()
{
    isProfileActive.value = false;
}

const currentPagePaddle = ref(user.infoPong.skin.paddles.findIndex(paddle => paddle === user.infoPong.skin.default.paddle));
const paddlePerPage = 1;

function changePaddlePage(index: number) {
    if (currentPagePaddle.value + index < -1 || currentPagePaddle.value + index == user.infoPong.skin.paddles.length)
        return;

    currentPagePaddle.value += index;
}

function currentPaddles() {
    const startIndex = currentPagePaddle.value * paddlePerPage;
    const endIndex = startIndex + paddlePerPage;
    const paddles = user.infoPong.skin.paddles;
    return paddles.slice(startIndex, endIndex);
}

function asSomeChange() {
    return !(current_avatar.value != user.avatar || selectedColor.value != user.infoPong.color || (currentPagePaddle.value < 0 ? "" : user.infoPong.skin.paddles[currentPagePaddle.value]) != user.infoPong.skin.default.paddle)
}

function updateProfile() {
    const paddle = (currentPagePaddle.value < 0 ? "" : user.infoPong.skin.paddles[currentPagePaddle.value]);

    if (current_avatar.value != user.avatar) user.avatar = current_avatar.value;
    if (selectedColor.value != user.infoPong.color) user.infoPong.color = selectedColor.value;
    if (paddle != user.infoPong.skin.default.paddle) user.infoPong.skin.default.paddle = paddle;
    userStore().updateProfile();
}

onMounted(() => {
    currentPageMatches();
    const paddle_color = document.getElementById("paddleImage") as HTMLImageElement;
    nextTick(() => {

        paddle_color.style.backgroundColor = selectedColor.value;
    });
});

// onUnmounted(() => {
// });

</script>

<style scoped lang="scss">
.profile {
    position: absolute;
    left: 0%;
    top: 10%;
    width: 465px; //35%;
    height: 650px; //75%
    background-color: rgba(210, 180, 140, 0.6);
    border: 2px solid black;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.close-button.button_profile{
    right: 1.5%;
    top: 1.4%;
    left: unset;
}

.profile_components {
    position: absolute;
    font-family: 'Press Start 2P', cursive;
}

#user-status {
    left: 130px;
    top: 140px;
    height: 25px;
    width: 25px;
    border: 3px solid #000000;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.user_image {
    position: absolute;
    height: 125px;
    width: 125px;
    border: 3px solid #000000;
    left: 20px;
    top: 30px;
    border-radius: 10px;
    transition: opacity 0.3s ease;
    /* Adiciona uma transição suave */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.user_image:hover {
    cursor: pointer;
    opacity: 0.5;
    /* Define a opacidade ao passar o cursor sobre a imagem */
}

.user-label {
    left: 165px;
    color: black;
    font-size: 15px;
}

.user-label-container {
    position: relative;
    display: inline-block;
}

.nickname {
    cursor: pointer;
    top: 20px;
    font-size: 25px;
    color: black;
    transition: color 0.3s ease;
    max-width: 45%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.nickname:hover {
    color: rgb(73, 73, 73);
}

.user-nickname-input {
    display: block;
    background-color: transparent;
    font-family: 'Press Start 2P';
    top: 20px;
    left: 155px;
    width: 200px;
}

.clear-icon {
    position: absolute;
    top: 25px;
    left: 330px;
    cursor: pointer;
    color: green;
}

.false-red {
    color: red;
}

.level {
    top: 65px;
}

.money {
    top: 85px;
}

.wins {
    top: 105px;
}

.losts {
    top: 125px;
}

.user_paddle {
    position: absolute;
    height: 125px;
    width: 50px;
    border: 3px solid #000000;
    left: 370px;
    top: 30px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.user_paddle_image {
    height: 125px;
    width: 50px;
    border: 3px solid #000000;
    left: -2.6px;
    top: -3px;
}

.qrcode {
    top: 153px;
    left: 167px;
}

.qr-button {
    position: absolute;
    top: -2px;
    width: 55px;
    height: 25px;
    border-radius: 8px;
    left: 105px;
    font-size: 12px;
    background-color: white;
    transition: background-color 0.3s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.qr-button:hover {
    background-color: rgb(162, 162, 162);
}

.save-button {
    position: absolute;
    top: 30%;
    width: 200px;
    height: 46px;
    border-radius: 8px;
    left: 50%;
    transform: translateX(-50%);
}

.save-button::not(:disabled) {
    background-color: green;
    transition: background-color 0.3s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.save-button::not(:disabled):hover {
    background-color: rgb(0, 180, 0);
}

.matches {
    font-size: 24px;
    left: 50%;
    top: 40%;
    transform: translateX(-50%);
    color: white;
    -webkit-text-stroke-width: 1.25px;
    -webkit-text-stroke-color: black;
}

.grid-container {
    position: absolute;
    left: 4%;
    top: 290px;
    width: 92.5%;
    height: 54%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1%;
}

.grid-item {
    left: 4%;
    top: 15%;
    width: 92%;
    height: 80%;
    background-color: rgba(145, 144, 144, 0.612);
    border: 2px solid black;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.arrow-icon {
    position: absolute;
    top: 260px;
    width: 0;
    height: 0;
    border-style: solid;
    cursor: pointer;
    border-width: 16px 20px 16px 20px;
}

.arrow-icon.left {
    left: 15%;
    border-color: transparent black transparent transparent;
    transition: border-color 0.3s ease;
    ;
}

.arrow-icon.left:hover {
    border-color: transparent grey transparent transparent;
}

.arrow-icon.right {
    right: 15%;
    border-color: transparent transparent transparent black;
    transition: border-color 0.3s ease;
    ;
}

.arrow-icon.right:hover {
    border-color: transparent transparent transparent grey;
}

.expand-button {
    position: absolute;
    color: white;
    border: 3px solid black;
    border-radius: 5px;
    transition: all 0.3s cubic-bezier(0.25, 0.1, 0, 1.19);
    left: 100%;
    width: 10px;
    cursor: pointer;
}

.button1 {
    height: 255px;
}

.button2 {
    top: 255px;
    height: 395px;
}

.expanded.button1 {
    width: 170px;
    background-color: rgba(255, 255, 255, 0.463);
}

.expanded.button2 {
    width: 200px;
    background-color: rgba(255, 255, 255, 0.463);
}

.expanded-content {
    width: 100%;
    height: 100%;
}

.sprite-container {
    position: absolute;
    top: 10%;
    left: 17.5%;
    width: 65%;
    height: 65%;
    //   position: relative;
    //   width: 768px; /* Largura da imagem do sprite `768px`,*/
    //   height: 1024px; /* Altura da imagem do sprite  `1024px`,*/
}

//----- CUSTOME AVATAR -----
.custom-image {
    width: 32px;
    /* Largura do quadro do sprite */
    height: 64px;
    /* Altura do quadro do sprite */
    background-image: url('src/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg');
    background-position: -8px -14px;
}

.costume-avatar {
    position: absolute;
    top: 140px;
}

.costume-avatar.arrow-icon.left {
    position: absolute;
    left: 1%;
}

.costume-avatar.arrow-icon.arrow-icon.right {
    position: absolute;
    right: 1%;
}


.costume-paddle {
    position: absolute;
    top: 280px;
}

.costume-paddle.arrow-icon.left {
    position: absolute;
    left: 1%;
}

.costume-paddle.arrow-icon.arrow-icon.right {
    position: absolute;
    right: 1%;
}

#imageContainer {
    position: absolute;
    width: 106px;
    height: 213px;
    top: 5%;
    left: 50%;
    background-image: url('src/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg');
    background-size: 1000% 900%;
    background-position-x: -79px;
    background-position-y: -25px;
    transform: translateX(-50%);
    transition: background-position-x 0.15s ease;
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
    left: 1px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.close-button:hover {
    background-color: darkred;
    color: white;
}


input[type="color"] {
    position: absolute;
    border: none;
    padding: 0;
    appearance: none;
    width: 50px;
    height: 50px;
    cursor: pointer;
    vertical-align: middle;
    border-radius: 10px;
    border: 2px solid black;
    top: 20%;
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
}</style>
