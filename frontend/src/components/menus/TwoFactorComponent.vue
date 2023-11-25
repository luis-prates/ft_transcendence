<template>
    <form @submit="handleSubmit">
        <div class="user_two_factor_qr" :style="{height: getWidth() }">
            <img v-if="!isTwoFAEnabled && srcImage" id="qrImage" :src="srcImage" class="user_qr_image">
            <div class="message_two_factor" :style="{top: getTop(1)}">{{ getTittle() }}</div>
            <div class="message_two_factor" :style="{top: getTop(2), height: getHeight()}">{{ getMessage() }}</div>
            <input :style="{top: getTop(3)}" id="inputQR" class="input_Two_Factor" type="text" pattern="[0-9]+" :maxlength="6" required>
            <div style="left: 10%;" :style="{top: getTop(4)}">
                <button type="button" @click="handleCancelClick">Cancel</button>
                <button style="right: 20%;position: absolute;background-color: white;color: black;"
                    type="submit">Confirm</button>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { userStore } from '@/stores/userStore';
import { getCurrentInstance, onMounted, ref } from 'vue';

const instance = getCurrentInstance();
const srcImage = ref();
const isTwoFAEnabled = ref(userStore().user.isTwoFAEnabled);

function getWidth() {
    if (isTwoFAEnabled.value)
        return "300px";
    return "500px";
}

function getTop(type: number) {
    //Tittle
    if (type == 1)
    {
        if (isTwoFAEnabled.value)
            return "5%";
        return "56%";
    }
    //Message
    if (type == 2)
    {
        if (isTwoFAEnabled.value)
            return "17%";
        return "60%";
    }
    //Input
    if (type == 3)
    {
        if (isTwoFAEnabled.value)
            return "50%";
        return "80%";
    }
    //Button
    if (type == 4)
    {
        if (isTwoFAEnabled.value)
            return "75%";
        return "90%";
    }
}

function getHeight() {
    if (isTwoFAEnabled.value)
        return "30%";
    return "15%";
}

function handleSubmit(event: any) {
    event.preventDefault();

    handleConfirmClick();
}

async function getQrImage() {
    try {
        const data = await userStore().twoFAGenerate();
        srcImage.value = data;
    } catch (error) {
        console.error("Error converting file to base64:", error);
    }
}

async function handleConfirmClick() {
    const inputTwoFactor = document.getElementById("inputQR") as HTMLInputElement;

    try {
        if (!isTwoFAEnabled.value) await userStore().twoFATurnOn(inputTwoFactor.value.toString());
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
}

function getTittle() {
    if (!isTwoFAEnabled.value)
        return "To Enable 2FA:"
    return "To Disable 2FA:";
}

function getMessage() {
    if (!isTwoFAEnabled.value)
        return "1 - Download the Google Authenticator app from your phone's app store.\n\
                2 - Launch the app and tap on the '+' icon.\n\
                3 - Choose \"Scan a QR code\".\n\
                4 - Scan the QR code displayed above.\n\
                5 - Enter the generated code into the input box provided and hit \"Confirm\".\n\
                6 - 2FA is now activated.\n\
                7 - The next time you log in, you will be prompted to enter your 2FA code.";
    return "1 - Input your code into the box below and click \"Confirm\".\n\
            2 - 2FA is now deactivated.";
}

onMounted(() => {
    if (!isTwoFAEnabled.value)
        getQrImage();
});

</script>

<style scoped lang="scss">
.user_two_factor_qr {
    position: fixed;
    width: 350px;
    height: 500px;
    left: 50%;
    top: 50%;
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
    top: 3%;
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
    top: 80%;
    width: 80%;
    left: 10%;
    border-radius: 10px;
}

.message_two_factor {
    position: absolute;
    top: 60%;
    height: 15%;
    font-size: 10px;
    left: 5%;
    max-width: 90%;
    word-wrap: break-word;
    width: 90%;
    max-height: 60%;
    overflow-y: auto;
    white-space: pre-line;
}
</style>
