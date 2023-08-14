<template>
    <!-- <div class="user_two_factor_qr">
        <img v-if=srcImage id="qrImage" :src="srcImage" class="user_qr_image">
        <div class="message_two_factor">{{  getMessage() }}</div>
        <input id="inputQR" class="input_Two_Factor" type="text" pattern="[0-9]+" value="" :maxlength="6" re>
        <div style="top: 88%; left: 10%;">
            <button @click="handleCancelClick">Cancel</button>
            <button style="right: 20%; position: absolute;" @click="handleConfirmClick">Confirm</button>
        </div>
    </div> -->
    <form @submit="handleSubmit">
        <div class="user_two_factor_qr">
            <img v-if="srcImage" id="qrImage" :src="srcImage" class="user_qr_image">
            <div class="message_two_factor">{{ getMessage() }}</div>
            <input id="inputQR" class="input_Two_Factor" type="text" pattern="[0-9]+" :maxlength="6" required>
            <div style="top: 88%; left: 10%;">
                <button type="button" @click="handleCancelClick">Cancel</button>
                <button style="right: 20%;position: absolute;background-color: white;color: black;" type="submit">Confirm</button>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { userStore } from '@/stores/userStore';
import { getCurrentInstance, onMounted, ref } from 'vue';

const instance = getCurrentInstance();
const srcImage = ref();

function handleSubmit(event: any) {
    event.preventDefault();

    handleConfirmClick();
}

async function getQrImage() {
    try {
        const data = await userStore().twoFAGenerate();
        console.log(data);
        srcImage.value = data;
    } catch (error) {
        console.error("Error converting file to base64:", error);
    }
}

async function handleConfirmClick() {
    const inputTwoFactor = document.getElementById("inputQR") as HTMLInputElement;

    try {
        if (!userStore().user.isTwoFAEnabled) await userStore().twoFATurnOn(inputTwoFactor.value.toString());
        else await userStore().twoFATurnOff(inputTwoFactor.value.toString());

        inputTwoFactor.value = "";
        instance?.emit("two-factor-status");
    } catch (error) {
        inputTwoFactor.style.borderColor = "red";
    }
}

function handleCancelClick() {
    
    const inputTwoFactor = document.getElementById("inputQR") as HTMLInputElement;
    
    inputTwoFactor.value = "";
    instance?.emit("two-factor-status");
    console.log("Cancel button clicked");
}

function getMessage() {
    if (!userStore().user.isTwoFAEnabled)
        return "Download app do Google asdkasdkakdawkodawkopkopawdkodwakokoawdkoawdkowadkokawdkoawdokwad adwokkpaw doka wokkop awokkoadko dawkokaw d";
    return "Para Cancelar o Two Factor asdmlkalsmkd lasdml amsd mlçaçl sdmçasd, lçaçlsd l,ça,lçsd ,las,l dal,sd ,lçasl,çd ,lça,sl çdal,s dlal s,çds,lça ";
}

onMounted(() => {
    getQrImage();
});

</script>

<style scoped lang="scss">
.user_two_factor_qr {
    position: fixed;
    width: 350px;
    height: 500px;
    left: 50%;
    top: 40%;
    background-color: rgba(210, 180, 140, 0.8);
    border-radius: 5%;
    border: 2px solid black;
    font-family: 'Press Start 2P', cursive;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    transform: translate(-50%, -50%);
}

.user_qr_image {
    position: absolute;
    left: 50%;
    top: 5%;
    transform: translateX(-50%);
    width: 250px;
    height: 250px;
    border-radius: 10px;
    border: 1px solid black;
}

.input_Two_Factor {
    background-color: transparent;
    font-family: 'Press Start 2P';
    position: absolute;
    top: 75%;
    width: 80%;
    left: 10%;
    border-radius: 10px;
}

.message_two_factor {
    position: absolute;
    top: 57%;
    font-size: 10px;
    left: 5%;
    max-width: 90%;
    word-wrap: break-word;
}

</style>
