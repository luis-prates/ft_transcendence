<template>
    <img v-if="props.skin && props.type == TypeSkin.Paddle" id="paddleImage" :src="getPaddle(props.type)" class="user_paddle_image">
    <img v-if="props.skin && props.type == TypeSkin.Table" id="paddleImage" :src="getPaddle(props.type)" class="user_table_image">
</template>

<script setup lang="ts">
import { TypeSkin, skin } from '@/game/ping_pong/Skin';

const props = defineProps<{ skin: string, type: TypeSkin }>();

function getPaddle(type: TypeSkin) {
    const skinPadle = props.skin ? props.skin : "";

    return skin.get_skin_src(type + "_" + skinPadle);
}

</script>

<style scoped lang="scss">


.user_paddle_image {
    height: 125px;
    width: 50px;
    border: 3px solid #000000;
    left: -2.6px;
    top: -3px;
}

.user_table_image {
    height: 125px;
    width: 80%;
    border: 3px solid #000000;
    left: -2.6px;
    top: -3px;
}

</style>
