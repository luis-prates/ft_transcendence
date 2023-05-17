<template>
  <div class="box" href>
    <!-- <ProfileComponent class="profile" />     -->
    <LobbyComponent />

    <!-- <ProfileComponent class="profile" /> -->
  </div>
</template>

<script setup lang="ts">
import { userStore } from "@/stores/userStore";
import { ProfileComponent, LobbyComponent } from "@/components";
import { onBeforeRouteLeave } from "vue-router";

const store = userStore();
onBeforeRouteLeave((to, from, next) => {
  console.log("to", to);
  // Aqui você pode executar a lógica desejada quando o usuário tenta sair da página

  // Por exemplo, exibir uma mensagem de confirmação
  const shouldLeave = window.confirm("Deseja sair desta página?");
  if (shouldLeave) {
    // Se o usuário confirmar, permita a saída
    next();
  } else {
    // Caso contrário, cancele a navegação
    next(false);
  }
});

console.log(store.user);
</script>

<style scoped>
.box {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: chocolate;
  /* z-index: 0; */
}

.profile {
  width: 30%;
}
</style>
