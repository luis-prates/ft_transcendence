<template>
  <div class="chat">
    <ChatContent @protected-channel="protectedChannel" :protectedStatus="protectedChannelStatus" @update-channel-status="updateChannelStatus" :channelStatus="channel" @update-create-channel="updateCreateChannel" :createChannel="createChannel" class="chat_mensagen" />
    <ChatList ref="chatListRef" @protected-channel="protectedChannel" @update-channel-status="updateChannelStatus" :channelStatus="channel" @update-create-channel="updateCreateChannel" :createChannel="createChannel" class="chat_list"/>
  </div>
</template>

<script setup lang="ts">
import ChatList from "./ChatList.vue";
import ChatContent from "./ChatContent.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { chatStore, type channel, type ChatMessage, type ChatUser } from "@/stores/chatStore";
import { userStore } from "@/stores/userStore";
import { socketClass } from "@/socket/SocketClass";
import { provide } from 'vue';//channelStatus
import type { Socket } from "socket.io-client";
//import { send } from "process";
//import { AxiosHeaders } from "axios";

const store = chatStore();
const user = userStore();

const showTesss = ref(false);
const showbuttom = ref(false);
const chatListRef = ref<InstanceType<typeof ChatList> | null>(null);

socketClass.setChatSocket({ query: { userId: user.user.id } });
const socket: Socket = socketClass.getChatSocket();

function toggleTesss() {
  showTesss.value = !showTesss.value;
  showbuttom.value = !showbuttom.value;
}

onMounted(() => {
  // if (!socket)
  // {
  //   socketClass.setChatSocket({ query: { userId: user.user.id } });
  // }
  // socket = socketClass.getChatSocket();  
  store.getChannels();
  
  /* socket.on("join_chat", (data: channel) => {
    console.log("join_chat", data);
    store.addChannel(data);
  });*/

  socket.onAny((eventName, eventData) => {
    console.log("Received event: ", eventName);
    console.log("Event data: ", eventData);
  });

  socket.on('message', (data: { channelId: number, senderId: number, message: string }) => {
    const { channelId, senderId, message } = data;
    
    console.log("Received message", data);
    console.log(`Received message from ${senderId} in channel ${channelId}: ${message}`);
    store.addMessage({channelId: channelId, content: message, id: "1", user: "user_" + senderId.toString(), userId: senderId})
    console.log("Channels: do socket ", store.channels);
    //store.addMessage(channelId, message);
  });

  socket.on('channel-created', (eventData: { newChannel: any, message: any }) => {
    const { newChannel, message } = eventData;
    store.addChannel(newChannel, message);
    chatListRef.value?.getFilteredChannels();
  });

  socket.on('user-removed', (eventData: { channelId: any, message: any, user: any }) => {
    const { channelId, user } = eventData;
    store.removeUserFromChannel(channelId, user.id);
  });

  socket.on("channel-removed", (eventData) => {
    const { channelId } = eventData;
    if (store.selected &&  store.selected.objectId == channelId){
      updateChannelStatus(false);
    }
    store.removeUserFromChannel(channelId, user.user.id);
    chatListRef.value?.getFilteredChannels();
  });
  socket.on("channel-deleted", (eventData) => {
    const { channelId } = eventData;
    if (store.selected &&  store.selected.objectId == channelId){
      updateChannelStatus(false);
    }
    const curChannelIndex = chatStore().channels.findIndex(
    (channel) => channel.objectId === channelId
  );
  if (curChannelIndex !== -1) {
    store.channels.splice(curChannelIndex, 1);
    chatListRef.value?.getFilteredChannels();
  }
  });
  socket.on("channel-added", (eventData) => {
    const { channelId } = eventData;
    store.userToChannel(channelId, user.user);
      chatListRef.value?.getFilteredChannels();
  });
  //TODO, user-added acionado 3x
  socket.on("user-added", (eventData) => {
    console.log("Acionou o evento: eventData" , eventData);
    const { channelId, user } = eventData;
    store.userToChannel(channelId, user);
  });

  //Mute
  socket.on("user-muted-in-channel", (eventData) => {
    console.log("Mute" , eventData);
    const { channelId, userId, user } = eventData;

    const curUser = getUserInChannel(channelId, userId);
    if (curUser)
      curUser.isMuted = true;
  });

  //Unmute
  socket.on("user-unmuted-in-channel", (eventData) => {
    console.log("UnMuted" , eventData);
    const { channelId, userId, user } = eventData;

    const curUser = getUserInChannel(channelId, userId);
    if (curUser)
      curUser.isMuted = false;
  });

  //Make Admin
  socket.on("user-promoted-in-channel", (eventData) => {
    console.log("Admin" , eventData);
    const { channelId, userId } = eventData;

    const curUser = getUserInChannel(channelId, userId);
    if (curUser)
      curUser.isAdmin = true;
  });

  //Demote
  socket.on("user-demoted-in-channel", (eventData) => {
    console.log("Demote" , eventData);
    const { channelId, userId } = eventData;

    const curUser = getUserInChannel(channelId, userId);
    if (curUser)
      curUser.isAdmin = false;
  });

  //new Owner
  socket.on("user-promoted-to-owner", (eventData) => {
    const { channelId, userId, message } = eventData;

    const curChannel = chatStore().channels.find((channel: channel) => channel.objectId == channelId);
    if (curChannel)
    {
      if (message.includes("You have been promoted to owner in channel"))
      {
        curChannel.ownerId = userStore().user.id;
      }
      else {
        curChannel.ownerId = userId;
      }
    }
  });

  //Edit Channel channel-edited
  socket.on("channel-edited", (eventData) => {
    const { editedChannel } = eventData;

    const curChannel = chatStore().channels.find((channel: channel) => channel.objectId == editedChannel.id);
    if (curChannel)
    {
      curChannel.avatar = editedChannel.avatar ? editedChannel.avatar : "";
      curChannel.name = editedChannel.name;
      curChannel.type = editedChannel.type;
    }
  });

  //Kick
  socket.on("user-removed-from-channel", (eventData) => {
    console.log("Kick" , eventData);
    const { channelId, userId, user } = eventData;

    const curChannel = chatStore().channels.find((channel: channel) => channel.objectId == channelId);
    if (curChannel)
    {
      const curUser = curChannel.users.find((userChannel: ChatUser) => userChannel.id == userId);
      if (curUser)
        store.removeUserFromChannel(channelId, userId);
    }
  });

  //ban
  socket.on("user-banned-in-channel", (eventData) => {
    const { channelId, userId, message } = eventData;
    console.log(message);
    
    const curChannel = chatStore().channels.find((channel: channel) => channel.objectId == channelId);
    if(curChannel) {
      const curUser = curChannel.users.find((userChannel: ChatUser) => userChannel.id == userId);
      if (curUser) {
        store.removeUserFromChannel(channelId, userId);
        curChannel.banList.push(curUser);
      }
    }
  });

  //unban
  socket.on("user-unbanned-in-channel", (eventData) => {
    const { channelId, userId, message } = eventData;
    console.log(message);

    const curChannel = chatStore().channels.find((channel: channel) => channel.objectId === channelId);
    if (curChannel) {
      const curUserIndex = curChannel.banList.findIndex((userChannel: ChatUser) => userChannel.id === userId);
      if (curUserIndex !== -1) {
        const curUser = curChannel.banList[curUserIndex];
        curChannel.banList.splice(curUserIndex, 1);
      }
    }
  });

  //You Prometed
  socket.on("user-promoted", (eventData) => {
    const { channelId, message, userId} = eventData;

    if (message.includes("You have been promoted in channel")) {
      const curUser = getUserInChannel(channelId, userStore().user.id);
      if (curUser)
        curUser.isAdmin = true;
    }
    else {
      const curUser = getUserInChannel(channelId, userId);
      if (curUser)
        curUser.isAdmin = true;
    }
  });

  //You Demoted
  socket.on("user-demoted", (eventData) => {
    const { channelId, message, userId} = eventData;

    if (message.includes("You have been demoted in channel")) {
      const curUser = getUserInChannel(channelId, userStore().user.id);
      if (curUser)
        curUser.isAdmin = false;
    }
    else {
      const curUser = getUserInChannel(channelId, userId);
      if (curUser)
        curUser.isAdmin = false;
    }
  });

  //You Kick
  //TODO, se tiver o chat aberto da erro
  // socket.on("user-removed", (eventData) => {
  //   console.log("Kick" , eventData);
  //   const { channelId } = eventData;

  //   const curChannel = chatStore().channels.find((channel: channel) => channel.objectId == channelId);
  //   if (curChannel)
  //   {
  //     const curUser = curChannel.users.find((userChannel: ChatUser) => userChannel.id == user.user.id);
  //     if (curUser)
  //       curChannel.users = curChannel.users.filter((userChannel: ChatUser) => userChannel.id != user.user.id);
  //   }
  // });
  

  function getUserInChannel(channelId: any, userId: any) : ChatUser | undefined
  {
    const curChannel = chatStore().channels.find((channel: channel) => channel.objectId == channelId);
    if (curChannel)
    {
      const curUser = curChannel.users.find((userChannel: ChatUser) => userChannel.id == userId);
      if (curUser)
        return curUser;
    }
    return undefined
  }

});

onUnmounted(() => {
  socket.off("message");
});

// Data initialization
const channel = ref(false);
const createChannel = ref(false);
const protectedChannelStatus = ref(false);

// Provide the channel status to chld components
provide('channelValue', channel);
// Method to update channelStatus when emitted from child component
const updateChannelStatus = (newStatus: boolean) => {
  channel.value = newStatus;
};
//testing for emits protected channel
const protectedChannel = (newStatus: boolean) => {
  protectedChannelStatus.value = newStatus;
}

// Method to update createChannel var when emitted from child component
const updateCreateChannel = (newStatus: boolean) => {
  console.log("chamou a funcao!");
  createChannel.value = newStatus;
};
</script>

<style scoped lang="scss">

.chat
{
    bottom: 0px;
    position: absolute;
    padding: 0px;
    margin: 0px;
    display: flex;
    flex-direction: row;
    pointer-events: none;
    min-width: 580px;
    min-height: 250px;
}
.chat_mensagen {
  flex-grow: 1;
  margin-right: 10px;
}

.chat_list {
  width: 40%;
  max-width: 250px;
  margin-left: auto;
}
</style>
