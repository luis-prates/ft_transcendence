<template>
  <div class="box2">
    <div class="search">
      <input placeholder="Search" />
      <button @click="sendMessage">≣</button>
    </div>
    <li class="list">
      <u v-for="channel in store.channels">
        <ChatItemComponent :channel="channel" @click="selectChannel(channel)"/>
      </u>
    </li>
  </div>
</template>

<script setup lang="ts">
import ChatItemComponent from "./ChatItemComponent.vue";
import { chatStore, type channel } from "@/stores/chatStore";

const store = chatStore();

function selectChannel(channel:channel) {
  console.log("Carregou no channel!\n", channel);
  store.showChannel(channel)
}

function sendMessage() {
  console.log("sendMessage");
  store.addChannel({
    name: "string",
    status: "string",
    avatar: "https://cdn.intra.42.fr/users/a99e8dd9d772038a6765065e3ac5187f/ede-alme.jpg",
    messages: [],
  });
}
</script>

<style scoped lang="scss">
.box2 {
  background-color: #444653; 
  .search {
    height: 20%;
    width: 100%;
    margin: 0px;
    padding: 5px;
    display: flex;
    // background-color: #444653; border-radius: 0px 4px 0px 0px; height: 60%;
    input {
      background-color: #696c75;
      border-radius: 5px;
      color: #d8d8d8;
      width: 80%;
      margin: 10px;
      height: 55%;
      padding: 0px;
    }

    button {
      background-color: transparent;
      color: #525252;
      font-size: x-large;
      color: #d8d8d8;
      border-radius: 15%;
      top: 5px;
      right: 0px;
      height: 70%;
      text-align: start;
      padding: 0px;
    }
  }

  .list {
    /* max-width: 100%; */
    height: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    list-style-type: none;
    /* overflow: scroll; */
    overflow-y: auto;
   
  }

   /* SCROLL CONFIGURATION */
   ::-webkit-scrollbar {
      width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    ::placeholder {
      color: aliceblue;
    }
}
</style>
