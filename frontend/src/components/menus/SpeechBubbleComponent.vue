<template>
    <div class="npc_window">
        <div id="npcAvatar" class="npc_avatar"></div>
        <div style="position: absolute; left: 12%; color: orange;">
            <strong>{{ props.npc.nickname }}:</strong>
        </div>
        <div id="npc_say" class="typewriter" @click="nextSpeechOrClose()">
            {{ message[currentMessageIndex] }}
        </div>
        <div class="close-button" @click="closeBallon()"></div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{ npc: any, message: any }>();

const instance = getCurrentInstance();
const isInsideComponent = ref(false);
const currentMessageIndex = ref(0);

function changeAvatarPage() {

    const inputName = document.getElementById("npcAvatar") as HTMLDivElement;
    const current_avatar = props.npc.avatar;
    inputName.style.backgroundPositionX = `-${32 + (484) * ((current_avatar - 4) >= 0 ? current_avatar - 4 : current_avatar)}px`;
    inputName.style.backgroundPositionY = `-${(current_avatar - 4) >= 0 ? 1004 : 40}px`;

    inputName.style.backgroundPosition = `${inputName.style.backgroundPositionX} ${inputName.style.backgroundPositionY}`;
    inputName.classList.add("slideBackground");
}


function closeBallon() {
    instance?.emit('close-bubble');
}

function nextSpeechOrClose() {

    if (currentMessageIndex.value < props.message.length - 1) {
        currentMessageIndex.value++;
    } else {
        closeBallon();
    }
}

function handleClickOutside(event: MouseEvent) {
    // if (!isInsideComponent.value) {
    //     closeBallon();
    // }
}

onMounted(() => {
    // window.addEventListener('click', handleClickOutside);
    changeAvatarPage();


    // setTimeout(() => {
    //     closeBallon();
    // }, 5 * 1000);

});

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
});

</script>

<style scoped lang="scss">
.npc_window {
    position: absolute;
    width: 1000px;
    height: 110px;
    bottom: 2%;
    left: 50%;
    transform: translateX(-50%);
    border: 2px solid black;
    background-color: white;
    border-radius: 10px;
}

.typewriter:hover {
    cursor: pointer;
}

.npc_avatar {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 1%;
    transform: translateY(-50%);
    background-image: url('/src/assets/images/lobby/avatares.jpg');
    background-size: 2000% 2000%;
    background-position-x: -835px;
    background-position-y: -40px;
    background-color: gold;
    border: 2px solid black;
}

.typewriter {
    position: absolute;
    left: 12%;
    top: 20%;
    height: 75%;
    width: 90%;
    max-width: 87%;
    overflow: hidden;
    white-space: pre-line;
    animation: typing 0.5s steps(40) 0.1s 1 normal both;
}

@keyframes typing {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
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
    right: 0.8%;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.close-button:hover {
    cursor: pointer;
    background-color: darkred;
    color: white;
}

</style>
