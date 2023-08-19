<template>
    <MyProfileComponent v-if="myProfile" @close-profile="closeMenu()" />
    <ProfileComponent v-if="yourProfile" :user="userProfile" class="profile_component" @close-profile="closeMenu()" />
    <ShopCommponent v-if="yourShop" @close-shop="closeMenu()" />
    <LeaderBoardComponent v-if="leaderboard" @close-leaderboard="closeMenu()"/>
    <CreateGameComponent v-if="createGame" :data="createGameData" @close-createGame="closeMenu()"/>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { userStore } from "@/stores/userStore";
import ProfileComponent from "../menus/ProfileComponent.vue";
import MyProfileComponent from "../menus/MyProfileComponent.vue";
import ShopCommponent from "../menus/ShopCommponent.vue";
import LeaderBoardComponent from "../menus/LeaderBoardComponent.vue";
import CreateGameComponent from "../menus/CreateGameComponent.vue";

let userProfile: any = '';
let createGameData: any = '';
const myProfile = ref(false);
const yourProfile = ref(false);
const yourShop = ref(false);
const leaderboard = ref(false);
const createGame = ref(false);

async function getUserDetails(userId: number) {
    userProfile = await userStore().getUserProfile(userId);
    userProfile.historic = await userStore().getUserGames(userId);
    yourProfile.value = true;
}

function closeMenu() {
    userStore().userSelected = undefined;

    yourProfile.value = false;
    myProfile.value = false;
    yourShop.value = false;
    leaderboard.value = false;
    createGame.value = false;
}

onMounted(() => {
});

watch(() => userStore().userSelected, (newValue, oldValue) => {
    console.log("userSelected changed:", newValue, oldValue);
    if (newValue) {
        myProfile.value = false;
        yourShop.value = false;
        yourProfile.value = false;
        if (newValue == "me")   myProfile.value = true;
        else if (newValue == "shop")    yourShop.value = true;
        else if (newValue == "leaderboard") leaderboard.value = true;
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
