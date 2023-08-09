<template>
    <img v-if="props.paddle" id="paddleImage" :src="getPaddle()" class="user_paddle_image">
</template>

<script setup lang="ts">
import { TypeSkin, skin } from '@/game/ping_pong/Skin';

const props = defineProps<{ paddle: string }>();

function getPaddle() {
    const skinPadle = props.paddle ? props.paddle : "";

    return skin.get_skin_src(TypeSkin.Paddle + "_" + skinPadle);
}

</script>

<style scoped lang="scss">

</style>
