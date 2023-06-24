<template>
  <div class="box" href>
    <a class="login" :href="env.REDIRECT_URI_42_API">Login</a>
    <p>Message is: {{ objecId }}</p>
    <input v-model="objecId" @change="tes()" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { userStore } from "../stores/userStore";
import Router from "../router/index";
import { ref } from "vue";
import { socketClass } from "@/socket/Socket";
import { env } from "@/env";
import type { Socket } from "socket.io-client";

const props = defineProps({
  code: String,
});

const name = "LoginPage";
const objecId = ref("");
let socket: Socket | any = null;

const store = userStore();

function tes() {
  console.log("objecId.value in nessage box 1: ", objecId.value);
  store.user.id = parseInt(objecId.value);
  store.user.name = "user_" + objecId.value;
  store.user.nickname = "user_" + objecId.value;
  store.user.money = 0;
  store.user.email = "user_" + objecId.value + "@gmail.com";
  store
        .loginTest()
        .then(() => {
		socketClass.setLobbySocket({
			query: {
				userId: store.user.id,
			}
		});
		socket = socketClass.getLobbySocket();
  		socket.emit("connection_lobby", { userId: objecId.value, objectId: objecId.value.toString() });
  		setTimeout(() => {
    		Router.setRoute(Router.ROUTE_ALL);
    		Router.push("/");
  		}, 1000);
        console.log(store.user.isLogin);
      })
      .catch((err) => {
        console.log(err);
      });
}

onMounted(() => {
  if (props.code || store.user.isLogin) {
    store
      .login(props.code)
      .then(() => {
		console.log("objecId.value in nessage box 2: ", objecId.value);
        socket.emit("connection_lobby", { userId: objecId.value, objectId: store.user.id.toString() });
        setTimeout(() => {
          Router.setRoute(Router.ROUTE_ALL);
          Router.push("/");
        }, 1000);
        console.log(store.user.isLogin);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
</script>

<style scoped>
.box {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login {
  padding: 15px 20px;
  width: 350px;
  border: 1px solid #eee;
  border-radius: 6px;
  background-color: var(--button-text-color);
  font-size: 18px;
}
</style>
