<template>
  <div v-if="nickname !== getMyNickname()" class="d-flex justify-content-start mb-4">
    <div class="img_cont_msg">
      <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img_msg" />
    </div>
    <div style="position: relative;">
      <div>
        <span style="color: white; margin-left: 10px;">{{props.nickname}}</span>
      </div>
      <div class="msg_cotainer">
        {{ props.mensagem }}
        <span class="msg_time">{{props.time}}</span>
      </div>
    </div>
  </div>
  <div  v-else class="d-flex justify-content-end mb-4">
    <div class="msg_cotainer_send">
      {{ props.mensagem }}
      <span class="msg_time">{{props.time}}</span>
    </div>
    <div class="img_cont_msg">
      <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img_msg" />
    </div>
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
  mensagem: String,
  time: String,
  nickname: String
})

// Get your own nickname from the player data
const getMyNickname = () => {
  console.log(user.user.id);
  return user.user.nickname;
};
</script>
