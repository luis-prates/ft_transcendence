<template>
    <div class="match_result" :class="{ win: getResult() === 'WIN!', lost: getResult() === 'LOST!' }">
        {{ getResult() }}
    </div>
    <div class="match_player1">
        <img id="avatarImage" :src="getPhoto(1)" class="match_image">
        <div class="match_nickname">{{ props.match.players[0].nickname }}</div>
    </div>

    <div class="match_player2">
        <img id="avatarImage" :src="getPhoto(2)" class="match_image">
        <div class="match_nickname">{{ props.match.players[1].nickname }}</div>
    </div>
    <img id="avatarImage" :src="getPhoto(3)" class="match_image_vs">

    <div class="match_score">{{ getScore() }}</div>
</template>

<script setup lang="ts">
import type { GAME, User } from '@/stores/userStore';

const props = defineProps<{ match: GAME, user: User }>();

//IMAGES

import vsImage from "@/assets/images/lobby/menu/vs.png";
import default_avatar from "@/assets/chat/avatar.png";

const vs_image = vsImage;
const defaultAvatar = default_avatar;


function getPhoto(player: number) {
    if (player == 1)
        return props.match.players[0].image ? props.match.players[0].image : defaultAvatar;
    else if (player == 2)
        return props.match.players[1].image ? props.match.players[1].image : defaultAvatar;
    return vs_image;
}

function getScore() {
    if (props.match.players[0].id == props.match.winnerId)
        return (props.match.winnerScore + "-" + props.match.loserScore);
    return (props.match.loserScore + "-" + props.match.winnerScore);
}

function getResult() {
    if (props.user.id == props.match.winnerId)
        return ("WIN!");
    return ("LOST!");
}

// onMounted(() => {
// });

// onUnmounted(() => {
// });

</script>

<style scoped lang="scss">
.match_player1 {
    position: absolute;
    top: 20%;
    height: 70%;
    width: 40%;
    left: 2%;
}

.match_player2 {
    position: absolute;
    top: 20%;
    height: 70%;
    width: 40%;
    right: 2%;
}

.match_nickname {
    font-family: "Press Start 2P";
    top: 65%;
    font-size: 12px;
    left: 50%;
    color: black;
    transition: color 0.3s ease;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transform: translate(-50%, 0);
}

.match_image {
    position: absolute;
    height: 55px;
    width: 55px;
    border: 3px solid #000000;
    left: 50%;
    top: 5%;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transform: translateX(-50%);
}

.match_image_vs {
    position: absolute;
    height: 17.5%;
    width: 25%;
    left: 50%;
    top: 42.5%;
    transform: translate(-50%, -50%);
}

.match_score {
    position: absolute;
    font-family: "Press Start 2P";
    top: 80%;
    font-size: 20px;
    left: 50%;
    color: black;
    transform: translate(-50%, 0);
}

.match_result {
    position: absolute;
    font-family: "Press Start 2P";
    top: 0%;
    font-size: 20px;
    left: 50%;
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: black;
    transform: translate(-50%, 0);
}

.win {
    color: gold;
}

.lost {
    color: whitesmoke;
}
</style>
