<template>
  <div class="profile">
    <img alt="Avatar" :src="user.image" class="avatar" />
    <div >
      <input type="text" v-model="user.name" />
      <input type="text" v-model="user.email" />
      <input type="text" v-model="user.nickname" />
      <input type="file" @change="onFileChanged($event)" accept="image/*" capture />
      <button @click="onSubmit">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import { reactive } from "vue";

const store = userStore();
const user = reactive( {
  name: store.user.name,
  email: store.user.email,
  nickname: store.user.nickname,
  image: store.user.image,
});

function onFileChanged(event: any) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    user.image = reader.result as string;
    console.log("onFileChanged", reader.result);
  };
}

function onSubmit() {
  // console.log("onSubmit", user.image);
}
</script>

<style scoped>
.profile {
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: none;
  background-color: var(--color-background);
  /* border-radius: 10px; */
  box-shadow: 0px 0px 10px 0px rgba(120, 29, 29, 0.75);
}

.profile div {
  width: auto;
  padding: 10px;
  margin: 10px;
}

.profile div input,
button {
  width: 100%;
  min-height: 30px;
  margin: 5px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>
