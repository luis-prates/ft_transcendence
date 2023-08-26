import "./assets/styles/main.css";
import '@/scss/styles.scss';
import ContextMenu from '@imengyu/vue3-context-menu'
// stylesheet
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap';
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import Router from "./router";
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faCheckCircle, faExclamationCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faExclamationCircle, faExclamationTriangle, faInfoCircle, faCheckCircle);

const app = createApp(App);

// Removendo o menu de contexto em toda a aplicação
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

app.use(createPinia());
app.use(ContextMenu);
app.use(Router.getRouter());
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount("#app");

// import 'bootstrap/dist/js/bootstrap.js'