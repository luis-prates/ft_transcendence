import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { userStore, type User, type Block } from "./userStore";
import { env } from "@/env";
import axios from "axios";

export interface ChatMessage {
  id: string;
  content: string;
  channelId: number;
  userId: number;
  createdAt?: string;
  user: any;
}

export interface ChatUser {
  id: any;
  image: string;
  nickname: string;
  status: any;
  isAdmin?: boolean;
  isMuted?: boolean;
}

export interface channel {
  objectId: any;
  name: string;
  avatar: any;
  password?: string;
  messages: ChatMessage[];
  users: ChatUser[];
  type: string;
  ownerId?: number;
  messagesLoaded?: boolean;
  banList: ChatUser[];
}


export const chatStore = defineStore("chat", () => {
  const channels = reactive<channel[]>([]);
  const selected = ref<any | undefined>(undefined);
  const user = userStore().user;

  //TODO DM channel name must be something like: 'Denny conversation'
  function addChannel(newChannel: any, message: String) {
    const channel: channel = {
      objectId: newChannel.id,
      name: newChannel.name,
      avatar: newChannel.avatar ? newChannel : "",
      password: "",
      messages: [],
      users: newChannel.users.map((user: any) => ({ id: user.userId, ...user })),
      type: newChannel.type,
      ownerId: newChannel.ownerId,
      messagesLoaded: false,
      banList: newChannel.banList,
    };
    const channelSelected = channels.find((c: channel) => {
      return c.objectId === channel.objectId;
    });
    if (!channelSelected) {
      channels.push(channel);
      console.log("O channel foi adicionado: " , channel);
    }
    else {
      console.log("Channel already exists!");
    }
  }

  function isUserInSelectedChannel(id: number): boolean {
    if (selected.value && selected.value) {
      const selectedChannel = selected.value as channel;
      return selectedChannel.users.some((u: ChatUser) => u.id === id);
    }
    return false;
  }

  function addMessage(message: ChatMessage) {
    const channelSelected = channels.find((c: channel) => c.objectId === message.channelId);
    console.log("channelSelected: ", channelSelected);
    console.log("ObjectId: ", message.channelId);
    if (channelSelected && message) {
      message.createdAt = new Date().toString();

    // Search for the user in channel.users
    const userChat = channelSelected.users.find((user: ChatUser) => user.id === message.userId);
    if (userChat) {
      message.user = userChat;
    }
      if (channelSelected.messagesLoaded == false) {
        getMessages(channelSelected);
      }
      channelSelected.messages.push(message);
      console.log("Vai adicionar a messagem ao chat");
    }
    console.log("Os channels do store: ", channels);
  }

  function activateMessage(message: ChatMessage) {
    if (selected.value && message) {
      selected.value.messages.push(message);
    }
  }

  function selectChannel(channel: channel | undefined) {
    if (channel) {
      selected.value = channel;
    } else {
      selected.value = undefined;
    }
  }

  async function getMessages(channel: channel | undefined) {
    if (channel) {
      selected.value = channel;
      try {
        if (channel.messagesLoaded == false) {
          channel.messagesLoaded = true;
          const response = await axios.get(`${env.BACKEND_SERVER_URL}/chat/channels/${channel.objectId}/messages`, {
            headers: { Authorization: `Bearer ${user.access_token_server}` },
          });
          let messages = response.data;
          const blockList = user.block.filter((block: Block) => block.blockedId !== user.id);
          blockList.forEach(function (block: Block) { messages = messages.filter((message: ChatMessage) => block.blockedId !== message.userId); })

          // Process the messages as needed
          selected.value.messages = messages;
          console.log("RESPOSTA DO SERVER: ", messages);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      selected.value = undefined;
    }
  }

  async function banUser(channelId:number, userId: number) {

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token_server}`,
      },
    };

    await axios
      .post(`${env.BACKEND_SERVER_URL}/chat/channels/${channelId}/ban/${userId}`, 
        { channelId: channelId, userId: userId, }, options)
      .then(function (response: any) {
        console.log(`User:${userId} was banned : ${response.data}`);
      })
      .catch((err) => console.error(err));
  }

  async function getChannels() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };
    try {
      const response = await axios.get(env.BACKEND_SERVER_URL + "/chat/channels", options);
      const responseData = response.data;
      console.log("response: ", responseData);

      // Transform the response data into an array of channels
      const transformedChannels = responseData.map((channelData: any) => {
        const transformedUsers =
          channelData.users?.map((user: any) => ({
            id: user.user.id ?? "",
            image: user.user.image ?? "",
            nickname: user.user.nickname ?? "",
            status: user.user.status ?? "",
            isAdmin: user.isAdmin ?? false,
            isMuted: user.isMuted ?? false,
          })) ?? [];
          const transformedBanUsers =
          channelData.banList?.map((user: any) => ({
            id: user.id ?? "",
            image: user.image ?? "",
            nickname: user.nickname ?? "",
            status: user.status ?? "",
            isAdmin: user.isAdmin ?? false,
            isMuted: user.isMuted ?? false,
          })) ?? [];
          return {
            objectId: channelData.id ?? "",
            name: channelData.name ?? "",
            avatar: channelData.avatar ?? "",
            password: channelData.password ?? "",
            users: transformedUsers,
            type: channelData.type ?? "",
            messages: channelData.messages ?? [],
            messagesLoaded: false, // Messages not Initialized
            ownerId: channelData.ownerId ?? "",
            banList: transformedBanUsers,
        };
      });

      // Update the channels array with the transformed data
      channels.splice(0, channels.length, ...transformedChannels);
      console.log("RESULTADO DO GETCHANNELS: ", channels);
    } catch (error) {
      console.error(error);
    }
  }

  async function leaveChannel(channelId: string) {
    const options = {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };
      try {
        // Leave the channel
        await axios.delete(`${env.BACKEND_SERVER_URL}/chat/channels/${channelId}/leave`, options);
  
        // Process the response if needed
        console.log("Left the channel successfully");
  
      } catch (error) {
        console.error(error);
      }
  }

  async function editChannel(channelId: any, editChannelDto: any) {
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token_server}`,
      },
      body: JSON.stringify(editChannelDto),
    };
  
    try {
      console.log("Vai editar o channel: ", channelId);
      const response = await fetch(`${env.BACKEND_SERVER_URL}/chat/channels/edit/${channelId}`, options);
  
      if (response.ok) {
        const updatedChannel = await response.json();
        return updatedChannel;
      } else if (response.status === 404) {
        return "CHANNEL_NOT_FOUND";
      } else {
        return "GENERIC_ERROR";
      }
    } catch (error) {
      console.error(error);
      return "NETWORK_ERROR";
    }
  }

  async function createChannel(channel: channel) {

    const createChannelDto = {
      name: channel.name,
      usersToAdd: channel.users,
      channelType: channel.type,
      password: channel.password ? channel.password : undefined,
      avatar: channel.avatar,
    };
    console.log("createChannelDto:", createChannelDto);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token_server}`,
      },
      body: JSON.stringify(createChannelDto),
    };
    try {
      const response = await fetch(`${env.BACKEND_SERVER_URL}/chat/channels`, options);
      const data = await response.json();
      console.log("CREATE CHANNEL:", data);

      // Check if the response indicates a successful operation
      if (response.ok) {
        // Return any relevant data here if needed
        //store.getChannels();
        return false;
      } else if (response.status == 409) {
        return "409"; //409 == Conflit error (same name || same id?)
      } else {
        return "GENERIC_ERROR";
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function joinChannel(channelId: string) {
    const joinChannelDto = {
      channelId: channelId,
    };
    console.log("joinChannelDto:", joinChannelDto);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token_server}`,
      },
      body: JSON.stringify(joinChannelDto),
    };
    try {
      const response = await fetch(`${env.BACKEND_SERVER_URL}/chat/channels/${channelId}/join`, options);
      //const data = await response.json();
      //console.log("JOINED CHANNEL:", data);

      // Check if the response indicates a successful operation
      if (response.ok) {
        // Return any relevant data here if needed
        //store.getChannels();
        return false;
      } else {
        return "GENERIC_ERROR";
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // Function to remove a user from a specific channel
  function removeUserFromChannel(channelId: any, userId:any) {
    const channel = channels.find((channel: channel) => channel.objectId === channelId);

    if (channel) {
      const userIndex = channel.users.findIndex((user: ChatUser) => user.id === userId);

      if (userIndex !== -1) {
        channel.users.splice(userIndex, 1);
      }
      else {
        console.warn(`User with ID ${userId} not found inside ${channelId} channel ID.`);
      }

    } else {
      console.warn(`Channel with ID ${channelId} not found.`);
    }
  }

  // Function to add a user to a specific channel
function addUserToChannel(channelId: any, user: ChatUser) {
  const channel = channels.find((channel: channel) => channel.objectId === channelId);

  if (channel) {
    if (!Array.isArray(channel.users)) {
      channel.users = [];
    }
    const userExists = Array.isArray(channel.users) && channel.users.some((existingUser: ChatUser) => existingUser.id === user.id);

    if (!userExists) {
      channel.users.push(user);
    }
    else {
      console.warn(`User with ID ${user.id} is already inside ${channelId} channel ID.`);
    }

  } else {
    console.warn(`Channel with ID ${channelId} not found.`);
  }
}

async function makeAdmin(channel: channel, userChat: ChatUser) {
  console.log("CHANNEL:", channel)
  if (channel.ownerId != user.id)
  {
    console.log("You aren't a OWNER!");
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.access_token_server}`,
    },
  };

  await axios
    .post(`${env.BACKEND_SERVER_URL}/chat/channels/${channel.objectId}/admin/${userChat.id}`, 
      { channelId: channel.objectId, userId: userChat.id, }, options)
    .then(function (response: any) {
      console.log(`Make Adminstrator : ${response.data}`);
      userChat.isAdmin = true;
    })
    .catch((err) => console.error(err));
}


async function demoteAdmin(channel: channel, userChat: ChatUser) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.access_token_server}`,
    },
  };

  await axios
  .post(`${env.BACKEND_SERVER_URL}/chat/channels/${channel.objectId}/users/${userChat.id}/demote`, 
    { channelId: channel.objectId, userId: userChat.id, }, options)
  .then(function (response: any) {
    console.log(`Demote Adminstrator : ${response.data}`);
    userChat.isAdmin = false;
  })
  .catch((err) => console.error(err));
}


async function muteUser(channel: channel, userChat: ChatUser) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.access_token_server}`,
    },
  };

  await axios
    .post(`${env.BACKEND_SERVER_URL}/chat/channels/${channel.objectId}/mute/${userChat.id}`, 
      { channelId: channel.objectId, userId: userChat.id, }, options)
    .then(function (response: any) {
      console.log(`Mute: ${userChat.nickname}, ${response.data}`);
      userChat.isMuted = true;
    })
    .catch((err) => console.error(err));
}

async function unmuteUser(channel: channel, userChat: ChatUser) {
  if (channel.ownerId != user.id)
  {
    console.log("You aren't a OWNER!");
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.access_token_server}`,
    },
  };

  await axios
  .post(`${env.BACKEND_SERVER_URL}/chat/channels/${channel.objectId}/unmute/${userChat.id}`, 
    { channelId: channel.objectId, userId: userChat.id, }, options)
  .then(function (response: any) {
    console.log(`Unmute : ${userChat.nickname}, ${response.data}`);
    userChat.isMuted = false;
  })
  .catch((err) => console.error(err));
}

async function kickUserFromChannel(channel: channel, userChat: ChatUser) {
 
  if (userChat.isAdmin)
  {
    console.log("Is admin!");
  }

  const options = {
    method: "DELETE",
    headers: { Authorization: `Bearer ${user.access_token_server}`, },
  };

  console.log("ENVIO;", channel.objectId, ", ", userChat.id)

  await axios
    .delete(`${env.BACKEND_SERVER_URL}/chat/channels/${channel.objectId}/users/${userChat.id}`, options)
    .then(function (response: any) {
      console.log(`KickUser : ${userChat.nickname}, ${response.data}`);
      userChat.isMuted = false;
    })
    .catch((err) => console.error(err));
}

  return {
    channels,
    selected,
    addChannel,
    getMessages,
    addMessage,
    getChannels,
    editChannel,
    createChannel,
    activateMessage,
    selectChannel,
    isUserInSelectedChannel,
    leaveChannel,
    joinChannel, 
    removeUserFromChannel,
    addUserToChannel,
    makeAdmin,
    demoteAdmin,
    muteUser,
    unmuteUser,
    kickUserFromChannel,
    banUser,
  };
});
