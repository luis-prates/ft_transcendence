<template>
    <div class="d-flex item-box">
      <div class="img_cont">
        <img :src="getImage()" class="user_img" />
        <span v-if="isBanned()" style="right: 10%; top: 30%;">🚫</span>
        <span v-else-if="isBlocked()" style="right: 10%; top: 30%;">🔒</span>
      </div>
      <div class="user_info">
        <span>{{ props.channel.name }}</span>
        <p >{{ getSubLabel() }}</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { type channel } from "@/stores/chatStore";
import { userStore } from "@/stores/userStore";
import defaultAvatar from "@/assets/chat/chat_avatar.png";
import defaultUser from "@/assets/chat/avatar.png";

const user = userStore();

const props = defineProps<{ channel: channel }>();

function getSubLabel() : string {

  if (props.channel.type !== 'DM')
    return (props.channel.users.length + " Users");
  else
    return props.channel.messages.length > 0 ? props.channel.messages.length + " Messages" : "";
}

function getImage() {
  return props.channel.avatar !== '' ? props.channel.avatar : (props.channel.type !== 'DM' ? defaultAvatar : defaultUser);
}

const isBanned = () => {
  const foundUser = props.channel.banList.find((banList) => banList.id === user.user.id);
  if (foundUser) {
    return true;
  }
  return false;
}

const isBlocked = () => {
  const foundUser = props.channel.users.find((users) => users.id === user.user.id);
  if (foundUser || props.channel.type != "PROTECTED") {
    return false;
  }
  return true;
};

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
