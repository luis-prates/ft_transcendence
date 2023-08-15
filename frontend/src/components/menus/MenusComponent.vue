<template>
    <MyProfileComponent v-if="myProfile" @close-profile="closeMenu()" />
    <ProfileComponent v-if="yourProfile" :user="userProfile" class="profile_component" @close-profile="closeMenu()" />
    <ShopCommponent v-if="yourShop" @close-shop="closeMenu()" />

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { userStore } from "@/stores/userStore";
import ProfileComponent from "../menus/ProfileComponent.vue";
import MyProfileComponent from "../menus/MyProfileComponent.vue";
import ShopCommponent from "../menus/ShopCommponent.vue";

let userProfile: any = '';
const myProfile = ref(false);
const yourProfile = ref(false);
const yourShop = ref(false);

async function getUserDetails(userId: number) {
    userProfile = await userStore().getUserProfile(userId);
    userProfile.historic = await userStore().getUserGames(userId);
}

function closeMenu() {
    userStore().userSelected = undefined;

    yourProfile.value = false;
    myProfile.value = false;
    yourShop.value = false;
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
        else {
            getUserDetails(newValue);
            setTimeout(() => {
                yourProfile.value = true;
            }, 100);
        }
    }
},
{ deep: true });

// onUnmounted(() => {
// });

</script>

<style scoped lang="scss"></style>
