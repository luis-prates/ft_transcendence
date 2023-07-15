<template>
	<!-- Modal -->
	<ErrorModal v-model:errorMessage="errorMessage" ref="errorModalRef" />
	<TwoFactorPrompt ref="twoFactorPromptRef" @submit="twoFactorSubmit" />
	<div class="loginElement" href>
		<span class="borderLine"></span>
		<form>
			<h2>Sign In</h2>
			<div class="inputBox">
				<input type="number" required="true" v-model="objectId" placeholder=" " >
				<span>User Id (for testing)</span>
				<i></i>
			</div>
			<div class="inputBox">
				<input type="email" required="true"  placeholder=" " >
				<span>Email Test</span>
				<i></i>
			</div>
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
import axios from "axios";
import TwoFactorPrompt from '@/components/login/TwoFactorPrompt.vue'

const props = defineProps({
	token: String,
	error: String,
});

const name = "LoginPage";
const objectId = ref("");

const errorMessage = ref('');
const errorModalRef = ref<InstanceType<typeof ErrorModal> | null>(null);
const twoFactorPromptRef = ref<InstanceType<typeof TwoFactorPrompt> | null>(null);

let socket: Socket | any = null;

const showErrorModal = (message: string) => {
	errorMessage.value = message;
	(errorModalRef.value as typeof ErrorModal | null)?.showModal();
};

let resolveTwoFactorPrompt: (value: boolean) => void;

let twoFactorSubmit = async (code: string) => {
    // Code to handle the submitted 2FA code
	const isValid = await twoFactorPrompt(code.toString());
	resolveTwoFactorPrompt(isValid);
};

const store = userStore();

function tes(event: any) {
	let validTwoFA = false;
	event.preventDefault();
	console.log("objectId.value in nessage box 1: ", objectId.value);
	store.user.id = parseInt(objectId.value);
	store.user.name = "user_" + objectId.value;
	store.user.nickname = "user_" + objectId.value;
	store.user.money = 0;
	store.user.email = "user_" + objectId.value + "@gmail.com";
	store
        .loginTest()
        .then(async (isTwoFAEnabled) => {
		if (isTwoFAEnabled) {
			await new Promise<boolean>((resolve) => {
				resolveTwoFactorPrompt = resolve;
				twoFactorPromptRef.value?.showModal();
			}).then((isValid) => {
				if (!isValid) {
					showErrorModal("Two Factor Authentication code is invalid. Please try again.");
					validTwoFA = false;
				} else {
					validTwoFA = true;
				}
			});
			if (!validTwoFA) {
				return ;
			}
		}
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

async function twoFactorPrompt(twoFactorCode: string) {
	let twoFAValid = false;
	if (twoFactorCode) {
		try {
			await axios.post(env.BACKEND_PORT + "/auth/2fa/validate", {
				twoFACode: twoFactorCode,
			},
			{
				headers: {
					Authorization: "Bearer " + store.user.access_token_server,
				},
			}).then((res) => {
				console.log(res)
				const message: string = res.data.message;
				if (message.startsWith("2FA code is valid")) {
					twoFAValid = true;
				}
				else {
					twoFAValid = false;
				}
			});
		} catch (error: any) {
			// handle bad request
			console.log(`${error.response.data.error} with status code ${error.response.status} and message: ${error.response.data.message}`)
			twoFAValid = false;
		}
	}
	return twoFAValid;
}

</script>

<style scoped>

@import '@/assets/styles/login.css'

</style>
