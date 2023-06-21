<template>
  <div v-if="props.message.nickname !== getMyNickname()" class="d-flex justify-content-start mb-4">
    <div v-if="props.displayUser" class="img_cont_msg">
      <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img_msg" />
    </div>
    <div v-else class="img_cont_msg"></div>
    <div style="position: relative;">
      <div v-if="props.displayUser">
        <span style="color: white; margin-left: 10px;">{{props.message.nickname}}</span>
      </div>
      <div class="msg_cotainer">
        {{ props.message.message }}
        <span class="msg_time">{{"8:40PM"}}</span>
      </div>
    </div>
  </div>
  <div  v-else class="d-flex justify-content-end mb-4">
    <div class="msg_cotainer_send">
      {{ props.message.message }}
      <span class="msg_time_send">{{"8:40PM"}}</span>
    </div>
    <div v-if="props.displayUser"  class="img_cont_msg">
      <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img_msg" />
    </div>
    <div v-else class="img_cont_msg"></div>
  </div>
</template>

<script setup lang="ts">
//Bootstrap;
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { defineProps } from "vue";
import { userStore } from "@/stores/userStore";

const user = userStore();

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
  ,
  displayUser: {
    type: Boolean,
  },
});

const mensagem = props.message.message;
const time = props.message.time;
const nickname = props.message.nickname;

// Get your own nickname from the player data
const getMyNickname = () => {
  console.log(user.user.id);
  return user.user.nickname;
};
</script>
