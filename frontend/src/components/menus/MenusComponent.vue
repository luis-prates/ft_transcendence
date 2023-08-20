<template>
    <ShopCommponent v-if="yourShop" @close-shop="closeMenu()" />
    <LeaderBoardComponent v-if="leaderboard" @close-leaderboard="closeMenu()"/>
    <CreateGameComponent v-if="createGame" :data="createGameData" @close-createGame="closeMenu()"/>
    
    <FriendsMenuComponent v-if="friendsMenu" @close-friends="closeMenu()"/>
    <MessageBattleMenuComponent v-if="menu > 0" :menu="menu" @close-menus-mb="closeMenu()"/>
    
    <MyProfileComponent v-if="myProfile" @close-profile="closeProfile()" />
    <ProfileComponent v-if="yourProfile" :user="userProfile" class="profile_component" @close-profile="closeProfile()" />

    <SpeechBubbleComponent v-if="speechBubbleActive" :npc="npcSelected" :message="npcMessage" @close-bubble="closeBubble()"/>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { userStore } from "@/stores/userStore";
import ProfileComponent from "../menus/ProfileComponent.vue";
import MyProfileComponent from "../menus/MyProfileComponent.vue";
import ShopCommponent from "../menus/ShopCommponent.vue";
import LeaderBoardComponent from "../menus/LeaderBoardComponent.vue";
import CreateGameComponent from "../menus/CreateGameComponent.vue";
import FriendsMenuComponent from "../menus/FriendsMenuComponent.vue";
import MessageBattleMenuComponent from "../menus/MessageBattleMenuComponent.vue";
import SpeechBubbleComponent from "../menus/SpeechBubbleComponent.vue";

let userProfile: any = '';
let createGameData: any = '';
const myProfile = ref(false);
const yourProfile = ref(false);
const yourShop = ref(false);
const leaderboard = ref(false);
const createGame = ref(false);
const friendsMenu = ref(false);
const menu = ref(0);
const speechBubbleActive = ref(false);

const npcSelected = ref();
const npcMessage = ref("");

async function getUserDetails(userId: number) {
    closeProfile();
    userProfile = await userStore().getUserProfile(userId);
    userProfile.historic = await userStore().getUserGames(userId);
    yourProfile.value = true;
}

function closeMenu() {
    userStore().userSelected = undefined;

    yourShop.value = false;
    leaderboard.value = false;
    createGame.value = false;
    friendsMenu.value = false;
    menu.value = 0;
}

function closeProfile() {
    yourProfile.value = false;
    myProfile.value = false;
}

function closeBubble() {
    userStore().userSelected = undefined;
    userStore().npcSelected = undefined;
    speechBubbleActive.value = false;
}

onMounted(() => {
});

watch(() => userStore().userSelected, (newValue, oldValue) => {
    console.log("userSelected changed:", newValue, oldValue);
    if (newValue) {
        if (newValue == "me")
        {
            closeProfile();
            myProfile.value = true;
        }
        else if (newValue == "shop")
        {
            closeMenu();
            yourShop.value = true;
        }
        else if (newValue == "leaderboard")
        {
            closeMenu();
            leaderboard.value = true;
        }
        else if (newValue == "friends")
        {
            closeMenu();
            friendsMenu.value = true;
        }
        else if (newValue == "messages")
        {
            closeMenu();
            menu.value = 1;
        }
        else if (newValue == "battles")
        {
            closeMenu();
            menu.value = 2;
        }
        else if (newValue == "npc")
        {
            speechBubbleActive.value = true;
            npcSelected.value = userStore().npcSelected;
            npcMessage.value = userStore().npcSelected.message;
        }
        else getUserDetails(newValue);
    }
},
{ deep: true });


watch(() => userStore().newGame, (newValue, oldValue) => {
    console.log("newGame:", newValue, oldValue);
    if (newValue) {
        closeMenu();
        createGameData = newValue;
        createGame.value = true;
        userStore().newGame = undefined;
    }
},
{ deep: true });


// onUnmounted(() => {
// });

</script>

<style scoped lang="scss"></style>
