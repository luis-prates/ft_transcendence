<template>
  <div class="item">
    <div style="width: 70px">
      <img class="avatar" :src="props.channel.avatar || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'" />
    </div>
    <div style="width: 70px; font-family: monospace">
      <h3 class="name">{{ props.channel.name }}</h3>
      <!-- <h5 class="status"><span :class="props.channel.status"></span>{{ props.channel.status }}</h5> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { type channel } from "@/stores/chatStore";
import { defineProps } from "vue";

const props = defineProps<{ channel: channel }>();
</script>

<style scoped>
.status {
  margin: 1%;
  right: -10%;
  display: inline-block;
  transform: translateY(-50%);
  color: #8d8d8d;
}

.status span {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translateX(-50%);
}

.online {
  background-color: #82c264;
}

.playing {
  background-color: #649cc2;
}

.offline {
  background-color: #ff4400;
}
.name {
  margin: 5%;
  padding-top: 10px;
  color: aliceblue;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 200%;
  white-space: nowrap;
}

.item {
  display: flex;
  width: 100%;
  height: 70px;
  max-height: 70px;
}
.item:hover {
  background-color: #696c75;
}

.avatar {
  /* display: inline-block; */
  padding: 3px;
  height: 75%;
  width: 75%;
  border-radius: 50%;
  background-color: #878b96;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10%;
}
</style>
