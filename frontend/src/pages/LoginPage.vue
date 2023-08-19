<template>
	<!-- Modal -->
	<CustomModal @closeModal="modalClosed" v-model:message="customMessage" :type="modalType" ref="customModalRef" />
	<TwoFactorPrompt ref="twoFactorPromptRef" @submit="twoFactorSubmit" />
	<FirstLoginPrompt ref="firstLoginPromptRef" v-model:type="firstLoginType" :prefilledCode="prefilledCode" :errorMessage="invalidPatch" @submit="firstLoginSubmit" />
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
				<input type="email" required="true" placeholder=" " >
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
import CustomModal from '@/components/utils/CustomModal.vue'
import axios from "axios";
import TwoFactorPrompt from '@/components/login/TwoFactorPrompt.vue'
import FirstLoginPrompt from "@/components/login/FirstLoginPrompt.vue";
import userDefaultAvatar from '@/assets/images/pingpong/avatar_default.jpg'

const props = defineProps({
	token: String,
	error: String,
	firstTime: Boolean,
});

const objectId = ref("");

const customMessage = ref('');
const customModalRef = ref<InstanceType<typeof CustomModal> | null>(null);
const twoFactorPromptRef = ref<InstanceType<typeof TwoFactorPrompt> | null>(null);
const firstLoginPromptRef = ref<InstanceType<typeof FirstLoginPrompt> | null>(null);
const modalType = ref('');
const firstLoginType = ref('');
const prefilledCode = ref('');
const invalidPatch = ref('');
const resolveCondition = ref(false);
const modalClosed = () => {
	if(resolveCondition.value) {
		onModalClose(true);
		resolveCondition.value = false;
	}
};

let socket: Socket | any = null;

let resolveTwoFactorPrompt: (value: boolean) => void;

let twoFactorSubmit = async (code: string) => {
    // Code to handle the submitted 2FA code
	const isValid = await twoFactorPrompt(code.toString());
	resolveTwoFactorPrompt(isValid);
};

let resolveFirstLoginPrompt: (value: string) => void;

let resolveFirstLoginPromptImage: (value: string) => void;

let firstLoginSubmit = async (data: any) => {
	if (data.type === "nickname") {
		resolveFirstLoginPrompt(data.content);
	}
	else if (data.type === "picture") {
		resolveFirstLoginPromptImage(data.content);
	}
}

function encodeImageToBase64(filePath: string) {
  return fetch(filePath)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return `data:image/png;base64,${base64String}`;
    });
}

let onModalClose: (value: boolean) => void;

let modalClosePromise = new Promise((resolve) => {
	onModalClose = resolve
});

const store = userStore();

async function handleTwoFA() {
	let isTwoFASuccessful = false;
	try {
		let validTwoFA = await new Promise<boolean>((resolve) => {
			resolveTwoFactorPrompt = resolve;
			twoFactorPromptRef.value?.showModal();
			isTwoFASuccessful = true;
		});
		if (!validTwoFA) {
			showModal("Two Factor Authentication code is invalid. Please try again.", "warning");
			isTwoFASuccessful = false;
		}	
	} catch (error) {
		console.log(error);
		isTwoFASuccessful = false;
	}
	return isTwoFASuccessful;
}

async function handleFirstLogin() {
	try {
		let updateSuccess = false;
		while (!updateSuccess) {
			let newNickname = await new Promise<string>((resolve) => {
				resolveFirstLoginPrompt = resolve;
				showFirstLoginModal(store.user.nickname, "nickname");
			});
			store.user.nickname = newNickname;
			updateSuccess = await store.firstTimePrompt();
			if (!updateSuccess) {
				invalidPatch.value = "Nickname is already taken. Please try again.";
				await sleep(1000);
			}
		}
		invalidPatch.value = "";
		await sleep(1000);
		updateSuccess = false;
		while (!updateSuccess) {
			let newImage = await new Promise<string>((resolve) => {
				resolveFirstLoginPromptImage = resolve;
				showFirstLoginModal(store.user.image, "picture");
			});
			store.user.image = newImage;
			updateSuccess = await store.firstTimePrompt();
			if (!updateSuccess) {
				invalidPatch.value = "Image failed to upload. Please try again.";
				await sleep(1000);
			}
		}
		invalidPatch.value = "";
	} catch (error) {
		console.log(error);
	}
}

function tes(event: any) {
	event.preventDefault();
	console.log("objectId.value in nessage box 1: ", objectId.value);
	store.user.id = parseInt(objectId.value);
	store.user.name = "user_" + objectId.value;
	store.user.nickname = "user_" + objectId.value;
	store.user.money = 0;
	store.user.email = "user_" + objectId.value + "@gmail.com";
	encodeImageToBase64(userDefaultAvatar)
		.then(base64Image => {
			store.user.image = base64Image;
		})
		.catch(error => {
			console.error('Ocorreu um erro ao codificar a imagem:', error);
	  	});

	store
        .loginTest()
        .then(async (response) => {
			if (response.isTwoFAEnabled) {
				const twoFASuccess = await handleTwoFA();
				if (!twoFASuccess) {
					return;
				}
			}
			if (response.firstTime === true) {
				await handleFirstLogin();
				await sleep(1000);
			}

			showModal("Login Success", "success");
			resolveCondition.value = true;
			await Promise.race([sleep(1500), modalClosePromise]);
			resolveCondition.value = false;
			hideModal();

			socketClass.setLobbySocket({
				query: {
					userId: store.user.id,
				}
			});
			socket = socketClass.getLobbySocket();
			socket.emit("connection_lobby", {
				userId: objectId.value,
				objectId: objectId.value.toString(),
				nickname: store.user.nickname,
				avatar: store.user.avatar
			});

			await sleep(1500);
			Router.setRoute(Router.ROUTE_ALL);
			Router.push("/");
			console.log(store.user.isLogin);
		})
		.catch((err) => {
			console.log(err);
		});
}

onMounted(() => {
	console.log("props.code : ", props.token);
	if (props.error) {
		showModal(props.error, "error");
	}
	if (props.token || store.user.isLogin)
	{
		store
		.login(props.token).then(async (user) => {

			if (user?.isTwoFAEnabled) {
				const twoFASuccess = await handleTwoFA();
				if (!twoFASuccess) {
					return;
				}
			}
			if (props.firstTime === true) {
				await handleFirstLogin();
				await sleep(1000);
			}

			showModal("Login Success", "success");
			resolveCondition.value = true;
			await Promise.race([sleep(3000), modalClosePromise]);
			resolveCondition.value = false;
			hideModal();

			socketClass.setLobbySocket({
				query: {
					userId: store.user.id,
				}
			});
			objectId.value = store.user.id.toString();
			socket = socketClass.getLobbySocket();
			socket.emit("connection_lobby", { userId: store.user.id, objectId: store.user.id.toString(), nickname: store.user.nickname, avatar: store.user.avatar });
			await sleep(2000);
			Router.setRoute(Router.ROUTE_ALL);
			Router.push("/");
			console.log(store.user.isLogin);
		});
	}
});

async function twoFactorPrompt(twoFactorCode: string) {
	let twoFAValid = false;
	if (twoFactorCode) {
		try {
			await axios.post(env.BACKEND_SERVER_URL + "/auth/2fa/validate", {
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

const showModal = (message: string, type: string) => {
	customMessage.value = message;
	modalType.value = type;
	(customModalRef.value as typeof CustomModal | null)?.showModal();
};

const showFirstLoginModal = (code: string, type: string) => {
	console.log(`code: ${code}, type: ${type}`);
	prefilledCode.value = code;
	firstLoginType.value = type;
	(firstLoginPromptRef.value as typeof FirstLoginPrompt | null)?.showModal();
};

function hideModal() {
	(customModalRef.value as typeof CustomModal | null)?.hideModal();
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

</script>

<style scoped>

@import '@/assets/styles/login.css'

</style>
