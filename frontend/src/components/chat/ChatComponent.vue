<template>
  <button class="hiddenbuttom" :class="{ active: showbuttom }" @click="toggleTesss">⇕</button>
    <div class="tesss" :class="{ active: showTesss }">
      <div style="width: 65%;">
        <ChatMessageComponent v-if="store.selected"></ChatMessageComponent>
      </div>
    <ChatListComponent style="width: 35%;"></ChatListComponent>
  </div>
</template>

<script setup lang="ts">
import ChatListComponent from "./ChatListComponent.vue"
import ChatMessageComponent from "./ChatMessageComponent.vue"
import { ref } from 'vue'
import { chatStore, type channel } from "@/stores/chatStore";

const store = chatStore();

const showTesss = ref(false)
const showbuttom = ref(false)


function toggleTesss() {
  showTesss.value = !showTesss.value
  showbuttom.value = !showbuttom.value
}
</script>

<style scoped lang="scss">

.tesss
{
  width: 40%;
  height: 40%;
  position: absolute;
  right: 0px;
  bottom: 0px;
  margin: 0px;
  padding: 0px;
  display: flex;
  background-color: red;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
}

.tesss.active
{
  transform: translateY(0);
}

.hiddenbuttom
{
  border-radius: 15px 15px 0px 0px;
  position: absolute;
  width: 14%;
  height: 2%;
  right: 0px;
  bottom: 40%;
  color: black;
  transform: translateY(2000%);
  transition: transform 0.3s ease-out;
}

.hiddenbuttom.active
{
  border-radius: 15px 15px 0px 0px;
  transform: translateY(0);
  content: "Show";
  //bottom: 45%;
}

</style>