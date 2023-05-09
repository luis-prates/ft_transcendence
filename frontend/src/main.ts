import "./assets/styles/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import Router from "./router";

const app = createApp(App);

// Removendo o menu de contexto em toda a aplicação
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

app.use(createPinia());
app.use(Router.getRouter());
app.mount("#app");
