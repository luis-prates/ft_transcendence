<template>
    <div v-if="isProfileActive" class="profile">
        <div class="avatar profile_components">
            <img id="avatarImage" :src="getPhoto()" class="user_image">
            <span id="user-status" :class="getStatus()"></span>
        </div>
        <div id="label-nickname" class="user-label profile_components nickname">{{ user.nickname }}</div>
        <div class="user-label profile_components level">Level: {{ user.level }}</div>
        <div class="user-label profile_components money">Money: {{ user.money }}₳</div>
        <div class="user-label profile_components wins">Wins: {{ getWins() }}</div>
        <div class="user-label profile_components losts">Losts: {{ getLosts() }}</div>

        <div class="user_paddle profile_components" :style="{ 'background-color': selectedColor }">
            <img v-if="isDefaultPaddle()" id="paddleImage" :src="getPaddle()" class="user_paddle_image"
                :style="{ 'background-color': selectedColor }">
        </div>

        <div class="user_friend">
            <button class="profile_components buttons_attribute button-friend" @click="friendRequest()" :style="{ 'background-color': getFriendColor() }">
                <img :src="getImageFriend()" class="user_friend_image">
                <img v-if="getFriend() == 'You have a Request'" :src="messageImage" class="user_friend_image" style="left: 50%">
                <div v-if="getFriend() != 'You have a Request'" class="user_friend_image" style="left: 50%; font-family: 'Press Start 2P'; font-size: 100%;">
                    {{ getFriend() == 'Add Friend' ? '+' : '-' }}</div>
            </button>
            <div class="friend_label">{{ getFriend() }}</div>
        </div>
        
        <div class="buttons_midle">
            <button class="profile_components buttons_attribute challenge-button"
                @click="challengeUser()">Challenge</button>
            <button class="profile_components buttons_attribute message-button" 
                @click="sendMessage()">Send Message</button>
            <button class="profile_components buttons_attribute block-button"
                @click="blockUser()">{{ getBlock() }}</button>
        </div>

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
        <div class="close-button button_profile" @click="closeProfile()"></div>
    </div>
</template>

<script setup lang="ts">
import { ConfirmButton, STATUS_CONFIRM } from "@/game/Menu/ConfirmButton";
import { userStore, type GAME, type User } from "@/stores/userStore";
import { skin, TypeSkin } from "@/game/ping_pong/Skin";
import { nextTick, onMounted, ref } from "vue";
import { TwoFactor } from "@/game/Menu/TwoFactor";
import MatchComponent from "./MatchComponent.vue"
import SkinComponent from "./SkinComponent.vue"
import avataresImages from "@/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg";
import friendImage from "@/assets/images/lobby/menu/friend.png";
import yourFriendImage from "@/assets/images/lobby/menu/your_friend.png";
import messageImage from "@/assets/images/lobby/menu/message.png";

const defaultAvatar = "../../src/assets/chat/avatar.png";

const props = defineProps<{ user: any }>();

const isProfileActive = ref(true);
const user = props.user;
const user_matches = ref([]) as any;
const currentPage = ref(0);
const matchesPerPage = 4;

function getWins() {
    return user_matches.value.filter((history: GAME) => history.winnerId == user.id).length;
}

function getLosts() {
    return user_matches.value.filter((history: GAME) => history.loserId == user.id).length;
}

function getPhoto() {
    return user.image ? user.image : defaultAvatar;
}

function getPaddle() {
    const skinPadle = user.paddleSkinEquipped;

    return skin.get_skin_src(TypeSkin.Paddle + "_" + skinPadle);
}

function isDefaultPaddle() {
    return user.paddleSkinEquipped ? true : false;
}

function getFriend(){
    let index = userStore().user.friends.findIndex(user => user.id == props.user.id);
    const isYourFriend = index == -1 ? false : true;

    index = userStore().user.friendsRequests.findIndex((friendship) => friendship.requestorId === props.user.id);
		const heSendARequestFriend = index == -1 ? false : true;
    
		index = userStore().user.friendsRequests.findIndex((friendship) => friendship.requesteeId === props.user.id);
    const yourSendAFriendRequest = index == -1 ? false : true;
    
    return isYourFriend ? "Remove Friend" : (heSendARequestFriend ? "You have a Request" : (yourSendAFriendRequest ? "Cancel Request" : "Add Friend"));
};

function getImageFriend(){
    if (getFriend() != "Remove Friend")
        return friendImage;
    return yourFriendImage;
};

function friendRequest() {
    const label = getFriend();
    if (label == "Add Friend")
      userStore().sendFriendRequest(user.id, user.nickname);
    else if (label == "Cancel Request")
      userStore().cancelFriendRequest(user.id);
    else if (label == "You have a Request")
      return ;
    else if (label == "Remove Friend")
      userStore().deleteFriend(user.id);
}

function getFriendColor() {
    const label = getFriend();
    if (label == "Add Friend")
        return 'green';
    else if (label == "You have a Request")
        return 'grey';
    else
        return 'red';
}

function getBlock(){
    const userIndex = userStore().user.block.findIndex(block => block.blockedId == user.id);
    if (userIndex !== -1) {
      return "UnBlock"
    }
    return "Block";
};

function blockUser() {
    const label = getBlock();
    if (label == "Block")
      userStore().blockUser(user.id, user.nickname, user.image);
    else if (label == "UnBlock")
      userStore().unblockUser(user.id);
}

function challengeUser(){
    userStore().challengeUser(user.id, user.nickname);
};

function sendMessage() {

    //TODO

}

function getStatus() {
    return "online_icon " + user.status;

}
function currentPageMatches() {
    const startIndex = currentPage.value * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    const matches = user_matches.value;
    return matches.slice(startIndex, endIndex);
}

function changePage(step: number) {
    if (currentPage.value + step >= 0 && currentPage.value + step < Math.ceil(user_matches.value.length / matchesPerPage)) {
        currentPage.value += step;
        currentPageMatches();
    }
}

const selectedColor = ref(user.color);

function closeProfile()
{
    isProfileActive.value = false;
}

async function getMatch() {
    user_matches.value = await userStore().getUserGames(user.id);
}

onMounted(() => {
    getMatch();

    currentPageMatches();
});

// onUnmounted(() => {
// });

</script>

<style scoped lang="scss">
.profile {
    position: absolute;
    left: 0%;
    top: 10%;
    width: 465px;
    height: 650px;
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
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.user_friend {
    position: absolute;
    left: 160px;
    top: 23%;
}

.friend_label {
    left: 74px;
    font-family: 'Press Start 2P';
    font-size: 7px;
    top: 10px;
}

.button-friend {
    height: 30px;
    width: 70px;
}

.user_friend_image {
    position: absolute;
    width: 40%;
    left: 10%;
    top: 10%;
    height: 90%;
}

.buttons_midle {
    position: absolute;
    top: 30%;
    width: 100%;
    height: 9%;
}


.buttons_attribute {
    border: 3px solid #000000;
    border-radius: 10px;
    transition: opacity 0.3s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.buttons_attribute:hover {
    cursor: pointer;
    opacity: 0.5;
}


.challenge-button {
    left: 2%;
}

.message-button {
    left: 39%;
    width: 28%;
}

.block-button {
    left: 70%;
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
    top: 20px;
    font-size: 25px;
    color: black;
    max-width: 45%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
}

.arrow-icon.left:hover {
    border-color: transparent grey transparent transparent;
}

.arrow-icon.right {
    right: 15%;
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
    left: 1px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.close-button:hover {
    background-color: darkred;
    color: white;
}

</style>
