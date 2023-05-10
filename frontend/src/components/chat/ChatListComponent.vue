<template>
  <div>
    <div style=" background-color: #444653; border-radius: 0px 4px 0px 0px; height: 60%;">
      <input style="background-color: #696C75; border-radius: 5px; color: #d8d8d8; width: 60%;" placeholder="Search"/>
      <button @click="sendMessage" style="background-color: transparent; color:#525252; font-size:x-large; color: #d8d8d8; border-radius: 15%;">≣</button>
    </div>
    <li class="list" style=" background-color: #444653; height: 300px;">

      <u v-for="channel in store.channels">
      <ChatItemComponent :channel="channel" />
    </u>
<!--    
    <u>
      <ChatItemComponent name="Ezequiel"  status="playing"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u>
    <u>
      <ChatItemComponent name="Ezequiel"  status="offline"/>
    </u> -->

  </li>
</div>
</template>

export interface channel{
  name: string,
  status: string,
  avatar: string,
  password?: string,
  messages: message[],

}

<script setup lang="ts">
    import ChatItemComponent from "./ChatItemComponent.vue"
    import { chatStore } from "@/stores/chatStore"

    const store = chatStore();

    function sendMessage()
    {
      console.log("sendMessage");
      store.addChannel({
      name: "string",
      status: "string",
      avatar: "https://cdn.intra.42.fr/users/a99e8dd9d772038a6765065e3ac5187f/ede-alme.jpg",
      messages: [],
      })
    }

</script>

<style scoped>
.list
{
    /* max-width: 100%; */
    max-height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    list-style-type: none;
    /* overflow: scroll; */
    overflow-y:auto;
    
    /* overscroll-behavior-y: visibility: hidden;; */
}

input{
    /* display: flex; */
    /* background-color: blueviolet; */
    /* width: 100%; */
    height: 20px;
    width: 80%;
    margin: 20px;
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
  color:aliceblue
}

</style>