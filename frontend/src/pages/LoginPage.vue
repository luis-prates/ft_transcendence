<template>
  <div class="box" href>
    <a class="login" :href="redirect_uri()">Login</a>
    <p>Message is: {{ objecId }}</p>
    <input v-model="objecId" @change="tes()" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { userStore } from "../stores/userStore";
import Router from "../router/index";
import { ref, defineProps } from "vue";
import { socketClass } from "@/socket/Socket";

const props = defineProps({
  code: String,
});

const name = "LoginPage";
const objecId = ref("");

const store = userStore();

function redirect_uri() {
  return (
    "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8985ddec657252ac6a80b66fd17077abd4e2e48b220557d48247edcf459c72fc&redirect_uri=" +
    window.location.href.substring(0, window.location.href.length - 1) +
    "%2F&response_type=code"
  );
}

function tes() {
  console.log("objecId.value: ", objecId.value);
  store.user.id = parseInt(objecId.value);
  setTimeout(() => {
    Router.setRoute(Router.ROUTE_ALL);
    Router.push("/");
  }, 1000);
}

onMounted(() => {
  if (props.code || store.user.isLogin) {
    store
      .login(props.code)
      .then(() => {
        store.user.id = parseInt(objecId.value);
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
