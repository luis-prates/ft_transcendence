<template>
	<!-- Modal -->
	<ErrorModal v-model:errorMessage="errorMessage" ref="errorModalRef" />
	<div class="loginElement" href>
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
import ErrorModal from '@/components/login/ErrorModal.vue'
import { Modal } from 'bootstrap';

type BootstrapModal = InstanceType<typeof Modal>

const props = defineProps({
	token: String,
	error: String,
});

const name = "LoginPage";
const objectId = ref("");

const errorMessage = ref('');
const errorModalRef = ref<BootstrapModal | null>(null);
let socket: Socket | any = null;

const showErrorModal = (message: string) => {
	errorMessage.value = message;
};

function encodeImageToBase64(filePath: string) {
  return fetch(filePath)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return `data:image/png;base64,${base64String}`;
    });
}

const store = userStore();

function tes(event: any) {
	event.preventDefault();
	console.log("objectId.value in nessage box 1: ", objectId.value);
	store.user.id = parseInt(objectId.value);
	store.user.name = "user_" + objectId.value;
	store.user.nickname = "user_" + objectId.value;
	store.user.money = 0;
	store.user.email = "user_" + objectId.value + "@gmail.com";
	encodeImageToBase64('src/assets/images/pingpong/avatar_default.jpg')
		.then(base64Image => {
			store.user.image = base64Image;
		})
		.catch(error => {
			console.error('Ocorreu um erro ao codificar a imagem:', error);
	  	});

	store
        .loginTest()
        .then(() => {
		socketClass.setLobbySocket({
			query: {
				userId: store.user.id,
			}
		});
		socket = socketClass.getLobbySocket();
		socket.emit("connection_lobby", { userId: objectId.value, objectId: objectId.value.toString(), nickname: store.user.nickname, avatar: store.user.avatar });
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
		showErrorModal(props.error);
	}
	if (props.token || store.user.isLogin)
	{
		store
		.login(props.token)
		.then(() => {
			socketClass.setLobbySocket({
				query: {
					userId: store.user.id,
				}
			});
			objectId.value = store.user.id.toString();
			socket = socketClass.getLobbySocket();
			socket.emit("connection_lobby", { userId: store.user.id, objectId: store.user.id.toString(), nickname: store.user.nickname, avatar: store.user.avatar });
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
