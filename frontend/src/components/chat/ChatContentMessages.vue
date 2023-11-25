<template>
  <div v-if="props.message.userId  !== getMyUserId()" class="d-flex justify-content-start mb-4">
    <div v-if="props.displayUser" class="img_cont_msg">
      <img :src="getImage()" class="rounded-circle user_img_msg" />
    </div>
    <div v-else class="img_cont_msg"></div>
    <div style="position: relative;">
      <div v-if="props.displayUser">
        <span style="color: white; margin-left: 10px;">{{props.message.user.nickname }}</span>
      </div>
      <div class="msg_cotainer">
        {{ props.message.content }}
        <span class="msg_time">{{ formattedTimestamp }}</span>
      </div>
    </div>
  </div>
  <div  v-else class="d-flex justify-content-end mb-4">
    <div class="msg_cotainer_send">
      {{ props.message.content }}
      <span class="msg_time_send">{{ formattedTimestamp }}</span>
    </div>
    <div v-if="props.displayUser"  class="img_cont_msg">
      <img :src="getImage()" class="rounded-circle user_img_msg" />
    </div>
    <div v-else class="img_cont_msg"></div>
  </div>
</template>

<script setup lang="ts">
//Bootstrap;
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { ref } from "vue";
import { userStore } from "@/stores/userStore";
import avatar from "@/assets/chat/avatar.png"

const defaultAvatar = avatar;

function getImage() {
  return props.message.user.image ? props.message.user.image : defaultAvatar;
}

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

const time = props.message.createdAt;

// Get your own nickname from the player data
const getMyUserId = () => {
  //console.log(user.user.id);
  return user.user.id;
};

//Function that will calculate the time lapsed until the last message
function formatTimestamp(timestamp: string): string {
  const createdAt = new Date(timestamp);
  const currentTime = new Date();
  
  // Calculate the time difference in milliseconds
  const timeDifference = currentTime.getTime() - createdAt.getTime();
  
  // Convert the time difference to seconds, minutes, hours, days, months, or years
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 60) {
    return `now`;
  } else if (minutes < 60) {
    if (minutes == 1)
      return `${minutes} minute ago`;
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    if (hours == 1)
      return `${hours} hour ago`;
    return `${hours} hours ago`;
  } else if (days < 30) {
    if (days == 1)
      return `${days} day ago`;
    return `${days} days ago`;
  } else if (months < 12) {
    if (months == 1)
      return `${months} month ago`;
    return `${months} months ago`;
  } else {
    if (years == 1)
      return `${years} year ago`;
    return `${years} years ago`;
  }
}
// Create a reactive variable to store the formatted timestamp
const formattedTimestamp = ref(formatTimestamp(time));

// Update every minute
setInterval(() => {
  formattedTimestamp.value = formatTimestamp(time);
}, 60000);

</script>
