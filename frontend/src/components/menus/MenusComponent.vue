<template>
    <MyProfileComponent v-if="userSelect && userSelect == myUser" />
	<ProfileComponent v-if="userSelect && userSelect != myUser" :user="userSelect" class="profile_component"/>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { userStore } from "@/stores/userStore";
import ProfileComponent from "../menus/ProfileComponent.vue";
import MyProfileComponent from "../menus/MyProfileComponent.vue";
import { TwoFactor } from "@/game/Menu/TwoFactor";
import TwoFactorComponent from "../menus/TwoFactorComponent.vue";

const myUser = userStore().user;

const userSelect = ref();

async function getUserDetails(userId: number) {
    userSelect.value = await userStore().getUserProfile(userId);
}

function changeUserSelect(userId: number) {
    getUserDetails(userId);
}

function cancelUserDetails() {
    userSelect.value = '';
}

onMounted(() => {
    userSelect.value = userStore().user;
    //Teste
    // getUserDetails(78);
});

// onUnmounted(() => {
// });

</script>

<style scoped lang="scss">

</style>
