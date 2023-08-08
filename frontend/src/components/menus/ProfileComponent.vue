<template>
    <div class="profile">
        <div class="avatar profile_components" @click="uploadImage()">
            <img id="avatarImage" :src="getPhoto()" class="user_image">
            <input id="fileInput" type="file" style="display: none;" accept="image/*" @change="handleFileChange">
            <span id="user-status" :class="getStatus()"></span>
        </div>
        <div>
            <div id="label-nickname" class="user-label profile_components nickname" @click="toggleInput">{{ user.nickname }}</div>
            <input id="inputName" type="text" pattern="[A-Za-z0-9]+" value="" disabled="false" class="profile_components user-nickname-input" @input="cleanInput" :maxlength="15" v-show="editing" @blur="cancelEdit">
            <span class="clear-icon" v-show="isDiferent && editing" @click="updateNickname">✓</span>
            <span class="clear-icon false-red"  v-show="!isDiferent && editing" @click="cleanInput">X</span>

        </div>
        <div class="user-label profile_components level">Level: {{ user.infoPong.level }}</div>
        <div class="user-label profile_components money">Money: {{ user.money }}₳</div>
        <div class="user-label profile_components wins">Wins: {{ getWins() }}</div>
        <div class="user-label profile_components losts">Losts: {{ getLosts() }}</div>
        <div class="user-label profile_components qrcode">QRCode:
            <button id="qrCodeButton" class="qr-button" @click="clickQrCode()">
                <span class="">{{ getTwoFactor() }}</span>
            </button>
        </div>

        <div class="user_paddle profile_components">
            <img v-if="isDefaultPaddle()" id="paddleImage" :src="getPaddle()" class="user_paddle_image">
        </div>

        <button class="profile-buttons profile_components save-button" disabled="false">Save Profile</button>

        <div class="paddle profile_components"></div>
        <div class="matches profile_components">Matches</div>
    </div>
</template>

<script setup lang="ts">
import { ConfirmButton, STATUS_CONFIRM } from "@/game/Menu/ConfirmButton";
import { userStore, type Block, type Friendship, type GAME } from "@/stores/userStore";
import { skin, TypeSkin } from "@/game/ping_pong/Skin";
import { ref } from "vue";
import { TwoFactor } from "@/game/Menu/TwoFactor";
const defaultAvatar = "../../src/assets/chat/avatar.png";

const user = userStore().user;
const editing = ref(false);
const isDiferent = ref(false);

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
    const skinPadle = user.infoPong.skin.default.paddle ? user.infoPong.skin.default.paddle : "";

    return skin.get_skin_src(TypeSkin.Paddle + "_" + skinPadle);
}

function isDefaultPaddle() {
    return user.infoPong.skin.default.paddle ? true : false;
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

function isQrCodeAtive() {
    return user.isTwoFAEnabled;
}

function clickQrCode() {
    const twoFactorMenu = new TwoFactor();
    twoFactorMenu.show((value) => {});
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

    if (new_nickname != user.nickname)
    {
      /*if (await userStore().updateNickname(new_nickname))
      {
        pencilImage.src = pencil;
        edit = false;
        inputName.disabled = true;
        inputName.style.display = "none";
        inputName.style.borderColor = "black";

        this.socket.emit("update_gameobject", {
          className: "Character",
          objectId: this.player.objectId,
          name: this.player.name,
          x: this.player.x,
          y: this.player.y,
          avatar: this.user.avatar,
          nickname: this.user.nickname,
          animation: { name: this.player.animation.name, isStop: false },
        });
      }
      else
        inputName.style.borderColor = "red";
    }
    else
    {
      pencilImage.src = pencil;
      edit = false;
      inputName.disabled = true;
      inputName.style.display = "none";
      inputName.style.borderColor = "black";
    }*/
    }
}


// const props = defineProps<{ user: User }>();


// onMounted(() => {
// });

// onUnmounted(() => {
// });

</script>

<style scoped lang="scss">
.profile {
    position: absolute;
    left: 0%;
    top: 5%; //10%
    width: 465px; //35%;
    height: 753px; //75%
    background-color: rgba(210, 180, 140, 0.6);
    border: 2px solid black;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
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
    transition: opacity 0.3s ease; /* Adiciona uma transição suave */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.user_image:hover {
    cursor: pointer;
    opacity: 0.5; /* Define a opacidade ao passar o cursor sobre a imagem */
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
}

.nickname:hover {
  color: rgb(73, 73, 73);
}

.user-nickname-input {
    display: none; 
    background-color: transparent;
    font-family: 'Press Start 2P';
    top: 20px;
    left: 155px;
    width: 200px;
    background-color: transparent;
    font-family: "Press Start 2P";
    display: block;
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

#inputName:not(:focus) {
  display: none;
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
    background-color: red; //TODO
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.user_paddle_image {
    height: 125px;
    width: 50px;
    border: 3px solid #000000;
    border-radius: 10px;
    left: -2px;
    top: -1.5px;
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
    top: 208px;
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
    top: 37.5%;
    transform: translateX(-50%);
    color: white;
    -webkit-text-stroke-width: 1.25px;
    -webkit-text-stroke-color: black;
}

</style>
