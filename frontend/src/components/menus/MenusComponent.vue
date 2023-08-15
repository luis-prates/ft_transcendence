<template>
    <MyProfileComponent v-if="myProfile" @close-profile="closeProfile()" />
    <ProfileComponent v-if="yourProfile" :user="userProfile" class="profile_component" @close-profile="closeProfile()" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { userStore } from "@/stores/userStore";
import ProfileComponent from "../menus/ProfileComponent.vue";
import MyProfileComponent from "../menus/MyProfileComponent.vue";

const userSelect = ref<any | undefined>(userStore().userSelected);
let userProfile: any = '';
const myProfile = ref(false);
const yourProfile = ref(false);


async function getUserDetails(userId: number) {
    userProfile = await userStore().getUserProfile(userId);
    userProfile.historic = await userStore().getUserGames(userId);
}

function closeProfile() {
    userStore().userSelected = undefined;

    yourProfile.value = false;
    myProfile.value = false;

    console.log("is close! ", userSelect)
}

onMounted(() => {
});

watch(() => userStore().userSelected, (newValue, oldValue) => {
    console.log("userSelected changed:", newValue, oldValue);
    if (newValue) {
        if (newValue == "me") {
            console.log("Your profile: ", newValue);
            yourProfile.value = false;
            myProfile.value = true;
        }
        else {
            console.log("profile: ", newValue);
            getUserDetails(newValue);
            setTimeout(() => {
                myProfile.value = false;
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
