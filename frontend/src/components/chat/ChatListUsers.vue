<template>
  <div class="d-flex bd-highlight">
    <div class="img_cont">
      <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img" />
      <span class="online_icon offline"></span>
    </div>
    <div class="user_info">
      <span>{{ props.user.nickname }}</span>
      <p>Offline</p>
    </div>
  </div>
</template>

<script setup lang="ts">
//Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { defineProps } from "vue";
import { type ChatUser } from "@/stores/chatStore";

const props = defineProps<{ user: ChatUser }>();

</script>

<style scoped></style>
