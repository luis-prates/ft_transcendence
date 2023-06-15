<template>
  <div class="parent-container">

    <div class="d-flex item-box">
      <div class="img_cont">
        <img :src="props.channel.avatar !== '' ? props.channel.avatar : 'https://therichpost.com/wp-content/uploads/2020/06/avatar2.png'" class="rounded-circle user_img" />
        <span class="online_icon offline"></span>
      </div>
      <div class="user_info">
        <span>{{ props.channel.name }}</span>
        <p>{{ props.channel.users.length }}</p>
      </div>
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
