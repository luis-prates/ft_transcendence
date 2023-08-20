<template>
	<div class="npc_window">
		<div class="npc_avatar"></div>
		<div id="npc_say" class="typewriter">{{ props.message }}</div>
	</div>
</template>

<script setup lang="ts">
import { userStore } from '@/stores/userStore';
import { getCurrentInstance, onMounted, ref } from 'vue';

const props = defineProps<{ npc:any, message: any }>();

const instance = getCurrentInstance();


onMounted(() => {
    if (props.npc.timeOut)
    {
      setTimeout(() => {
        instance?.emit('close-bubble');
      }, props.npc.timeOut * 1000);
    }
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

@keyframes slideBackground {
    0% {
        background-size: 2000% 2000%;
		// background-position-x: -835px;
    	background-position-y: -40px;
    }
	100% {
        background-size: 2000% 2000%;
		// background-position-x: -960px;
    	background-position-y: -45px;
	}
}

.typewriter {
    position: absolute;
    left: 12%;
    top: 5%;
    height: 20%;//90%
    max-width: 87%;
    overflow: hidden;
    animation: typing 3s steps(40) 1s 1 normal both; /* Aplica a animação */
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
