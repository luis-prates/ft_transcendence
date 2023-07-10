<template>
  <div class="loginElement" href>
    <!-- <a class="login" :href="env.REDIRECT_URI_42_API">Login</a> -->
	<span class="borderLine"></span>
	<form>
		<h2>Sign In</h2>
		<div class="inputBox">
			<input type="text" required="true" v-model="objectId" >
			<span>User Id (for testing)</span>
			<i></i>
		</div>
		<!-- <div class="inputBox">
			<input type="password" required="true" >
			<span>Password</span>
			<i></i>
		</div> -->
		<!-- <div class="links">
			<a href="#">Forgot password</a>
			<a href="#">Signup</a>
		</div> -->
		<div class="loginBox">
			<input type="submit" value="Login" @click="tes($event)" :disabled="!objectId">
			<a class="login" :href="env.REDIRECT_URI_42_API" target="_self">Login with</a>
		</div>
	</form>
    <!-- <p>Message is: {{ objectId }}</p> -->
    <!-- <input v-model="objectId" @change="tes()" /> -->
	<!-- <app-notification/> -->
	<!-- <ErrorModal :errorMessage="error" :isActive="true" :closeModal="closeModal" /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { userStore } from "../stores/userStore";
import Router from "../router/index";
import { ref } from "vue";
import { socketClass } from "@/socket/SocketClass";
import { env } from "@/env";
import type { Socket } from "socket.io-client";
import { EventBus } from '@/event-bus'

const props = defineProps({
  token: String,
  error: String,
});

const name = "LoginPage";
const objectId = ref("");
let showModal = ref(false);
let error = ref('');
let socket: Socket | any = null;

const store = userStore();

const closeModal = () => {
	showModal.value = false;
}

function tes(event: any) {
	event.preventDefault();
  console.log("objectId.value in nessage box 1: ", objectId.value);
  store.user.id = parseInt(objectId.value);
  store.user.name = "user_" + objectId.value;
  store.user.nickname = "user_" + objectId.value;
  store.user.money = 0;
  store.user.email = "user_" + objectId.value + "@gmail.com";
  store
        .loginTest()
        .then(() => {
		socketClass.setLobbySocket({
			query: {
				userId: store.user.id,
			}
		});
		socket = socketClass.getLobbySocket();
  		socket.emit("connection_lobby", { userId: objectId.value, objectId: objectId.value.toString() });
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
	console.log("props.code : ", props.token);
	if (props.error) {
		console.log("props.error : ", props.error);
		error.value = props.error as string;
		showModal.value = true;
		EventBus.emit('notify', {
			type: 'failure',
			title: 'Failed to login',
			message: 'Login has been failed. Please try again.',
			action: 'close'
		});
	}
  if (props.token || store.user.isLogin) {
    store
      .login(props.token)
      .then(() => {
		socketClass.setLobbySocket({
			query: {
				userId: store.user.id,
			}
		});
		socket = socketClass.getLobbySocket();
        socket.emit("connection_lobby", { userId: objectId.value, objectId: store.user.id.toString() });
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

@import '@/assets/styles/login.css'

</style>
