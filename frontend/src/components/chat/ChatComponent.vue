<template>
    <div class="tesss">
    <ChatMessageComponent style="width: 60%;"></ChatMessageComponent>
    <ChatListComponent style="width: 40%;"></ChatListComponent>
  </div>
</template>

<script setup lang="ts">
import ChatListComponent from "./ChatListComponent.vue"
import ChatMessageComponent from "./ChatMessageComponent.vue"

</script>

<style scoped lang="scss">

.tesss
{

  width: 60%;
  height: 60%;
  position: absolute;
  right: 0px;
  bottom: 0px;
  margin: 0px;
  padding: 0px;
  display: flex;
  background-color: "red";
}

</style>