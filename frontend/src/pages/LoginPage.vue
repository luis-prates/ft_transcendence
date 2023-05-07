<template>
  <div class="box" href>
    <a
      class="login"
      href="https://api.intra.42.fr/oauth/authorize?
client_id=u-s4t2ud-8985ddec657252ac6a80b66fd17077abd4e2e48b220557d48247edcf459c72fc&
redirect_uri=http://localhost:5173%2F&response_type=code"
      >Login</a
    >
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { userStore } from "../stores/userStore";
import Router from "../router/index";

const props = defineProps({
  code: String,
});

const store = userStore();

onMounted(() => {
if (props.code || store.user.isLogin) {
    console.log(props.code);
    store
      .login(props.code)
      .then(() => {
        Router.setRoute(Router.ROUTE_ALL);
        Router.push("/");
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
