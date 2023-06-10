<template>
  <div v-if="props.type == 'start'" class="d-flex justify-content-start mb-4">
    <div class="img_cont_msg">
      <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img_msg" />
    </div>
    <div class="msg_cotainer">
      {{ props.mensagem }}
      <span class="msg_time">{{props.time}}</span>
    </div>
  </div>
  <div  v-if="props.type == 'end'" class="d-flex justify-content-end mb-4">
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

const props = defineProps({
  type: String,
  mensagem: String,
  time: String
})

</script>
