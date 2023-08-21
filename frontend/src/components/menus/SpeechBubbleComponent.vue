<template>
	<div class="npc_window" @click="nextSpeechOrClose()">
		<div id="npcAvatar" class="npc_avatar"></div>
        <div style="position: absolute; left: 12%; color: orange;">
            {{ props.npc.nickname }}:
        </div>
        <div id="npc_say" class="typewriter">{{ props.message }}</div>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';

const props = defineProps<{ npc: any, message: any }>();

const instance = getCurrentInstance();


function changeAvatarPage() {

    const inputName = document.getElementById("npcAvatar") as HTMLDivElement;
    const current_avatar = props.npc.avatar;
    inputName.style.backgroundPositionX = `-${32 + (481) * ((current_avatar - 4) >= 0 ? current_avatar - 4 : current_avatar)}px`;
    inputName.style.backgroundPositionY = `-${(current_avatar - 4) >= 0 ? 1004 : 40}px`;

    inputName.style.backgroundPosition = `${inputName.style.backgroundPositionX} ${inputName.style.backgroundPositionY}`;
    inputName.classList.add("slideBackground");
}

function nextSpeechOrClose() {
    instance?.emit('close-bubble');
}

onMounted(() => {
    changeAvatarPage();

    // if (props.npc.timeOut)
    // {
    //   setTimeout(() => {
    //     instance?.emit('close-bubble');
    //   }, props.npc.timeOut * 1000);
    // }
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

.npc_avatar {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 1%;
    transform: translateY(-50%);
    background-image: url('src/assets/images/lobby/115990-9289fbf87e73f1b4ed03565ed61ae28e.jpg');
    background-size: 2000% 2000%;
    background-position-x: -835px;
    background-position-y: -40px;
	background-color: gold;
	border: 2px solid black;
	animation: slideBackground 0.5s infinite alternate;
}

// @keyframes slideBackground {
//     0% {
//         background-size: 2000% 2000%;
// 		// background-position-x: -835px;
//     	background-position-y: -40px;
//     }
// 	100% {
//         background-size: 2000% 2000%;
// 		// background-position-x: -960px;
//     	background-position-y: -45px;
// 	}
// }

.typewriter {
    position: absolute;
    left: 12%;
    top: 20%;
    height: 20%;//75%;
    max-width: 87%;
    overflow: hidden;
    animation: typing 3s steps(40) 1s 1 normal both;
}

@keyframes typing {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}

</style>
