import { reactive } from "vue";
import { defineStore } from "pinia";
import { env } from "../env";
import axios from "axios";
import type { ProductSkin, TypeSkin } from "@/game/ping_pong/Skin";

export enum GameStatus {
	NOT_STARTED,
	IN_PROGESS,
	FINISHED,
}

enum UserStatus {
  OFFLINE = "OFFLINE",
  IN_GAME = "IN_GAME",
  ONLINE = "ONLINE",
}

export interface Block {
  blockedId: number;
  blockerId: number;
}

export interface Friendship {
  createdAt: string;
  id: number;
  requesteeId: number;
  requesteeName: string;
  requestorId: number;
  requestorName: string;
  status: string;
  updatedAt: string;
}

export interface Historic {
  gameStats: {
    loserId: number, 
    loserName: string,
    loserScore: number,
    winnerId: number,
    winnerName: string,
    winnerScore: number,
  };
  gameType: string;
  id: string;
  players: {
    id: number;
    nickname: string;
    image: string;
  }[];
}

export interface InfoPong {
  level: number;
  xp: number;
  color: string;
  skin: {
    default: {
      tableColor: string;
      tableSkin: string;
      paddle: string;
    };
    tables: string[];
    paddles: string[];
  };
  historic: Historic[];
}

export interface User {
  access_token_server: string;
  accessToken: string;
  refreshToken: string;
  isLogin: boolean;
  id: number;
  email: string;
  name: string;
  nickname: string; //nickName in the Game
  image: string; //image Profile
  avatar: number; //Avatar in The Lobby
  infoPong: InfoPong;
  money: number;
  friends: any,
  friendsRequests: Friendship[],
  isPlayer: boolean;
  block: Block[],
}

export const userStore = defineStore("user", function () {
  const randomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  //! wallet - should it be deleted?
  const user = reactive({
    access_token_server: "",
    accessToken: "",
    refreshToken: "",
    name: "",
    email: "",
    id: 0,
    status: UserStatus.ONLINE,
    nickname: "",
    isLogin: false,
    image: "",
    avatar: 0,
    money: 10,
	isPlayer: true,
    infoPong: {
      level: 1,
      xp: 0,
      color: randomColor(),
      skin: {
        default: {
          tableColor: "#1e8c2f",
          tableSkin: "",
          paddle: "",
        },
        tables: [],
        paddles: [],
      },
      historic: [],
    },
    friends: Array(),
    friendsRequests: Array(),
    block: Array(),
  });

  async function login(authorizationCode: string | undefined) {
    if (user.isLogin) return;
    await axios
      .post("https://api.intra.42.fr/oauth/token", {
        grant_type: "authorization_code",
        client_id: env.CLIENT_ID,
        client_secret: env.CLIENT_SECRET,
        code: authorizationCode,
        redirect_uri: env.REDIRECT_URI,
      })
      .then(async (response) => {
        user.accessToken = response.data.access_token;
        user.refreshToken = response.data.refresh_token;

        const userInfoResponse = await axios.get("https://api.intra.42.fr/v2/me", {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        user.image = userInfoResponse.data.image.link;
        console.log(userInfoResponse.data);
        user.name = userInfoResponse.data.displayname;
        user.email = userInfoResponse.data.email;
        user.id = userInfoResponse.data.id;
        user.nickname = userInfoResponse.data.login;
        user.money = userInfoResponse.data.money;
        console.log("user\n", JSON.stringify(user));
        await axios
          .post(env.BACKEND_PORT + "/auth/signin", user)

          // axios.request(options)
          .then(function (response: any) {
            user.access_token_server = response.data.access_token;
            user.name = response.data.dto.name;
            user.email = response.data.dto.email;
            user.id = response.data.dto.id;
            user.nickname = response.data.dto.nickname;
            user.image = response.data.dto.image;
            user.money = response.data.dto.money;
          })
          .catch(function (error) {
            console.error(error);
          });
        user.isLogin = true;
      })
      .catch((error) => {
        console.error(error);
        user.isLogin = false;
      });
    // .finally(() => window.location.href = window.location.origin);
  }

  async function loginTest() {
    if (user.isLogin) return;
    await axios
      .post(env.BACKEND_PORT + "/auth/signin", user)

      // axios.request(options)
      .then(function (response: any) {
        console.log("response: ", response.data);
        
        user.access_token_server = response.data.access_token;
        user.id = response.data.user.id;
        user.status = response.data.user.status;
        user.name = response.data.user.name;
        user.email = response.data.user.email;
        user.nickname = response.data.user.nickname;
        user.image = response.data.user.image;
        user.money = response.data.user.money;
        user.avatar = response.data.user.avatar;
        user.infoPong.level = response.data.user.level;
        user.infoPong.xp = response.data.user.xp;
        user.infoPong.color = response.data.user.color;
        user.infoPong.skin.default.tableColor = response.data.user.tableColorEquipped;
        user.infoPong.skin.default.tableSkin = response.data.user.tableSkinEquipped;
        user.infoPong.skin.default.paddle = response.data.user.paddleSkinEquipped;
        user.infoPong.skin.tables = response.data.user.tableSkinsOwned;
        user.infoPong.skin.paddles = response.data.user.paddleSkinsOwned;
        getFriends();
        getFriendRequests();
        getBlockedUsers();
        getUserGames(user.id);
      })
      .catch(function (error) {
        console.error(error);
      });
    user.isLogin = true;
    console.log("USER: ", user);
    // .finally(() => window.location.href = window.location.origin);
  }

  async function updateProfile() {
    let body = {} as any;
    body.nickname = user.nickname;
    body.avatar = user.avatar;
    body.image = user.image;
    body.color = user.infoPong.color;
    body.paddleSkinEquipped = user.infoPong.skin.default.paddle;

    const options = {
      method: "PATCH",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
      body: new URLSearchParams(body),
    };
    await fetch(env.BACKEND_PORT + "/users/update_profile", options)
      .then(async (response) => console.log(await response.json()))
      .catch((err) => console.error(err));
  }

  async function buy_skin(skin: string, type: TypeSkin, price: number) {
    let body = {} as any;
    body.skin = skin;
    body.typeSkin = type;
    body.price = price;

    const options = {
      method: "PATCH",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
      body: new URLSearchParams(body),
    };

    await fetch(env.BACKEND_PORT + "/users/buy_skin", options)
      .then(async (response) => console.log("buy_shop:", await response.json()))
      .catch((err) => console.error(err));
  }

  async function updateTableDefault(tableColor: string, tableSkin: string) {
    let body = {} as any;
    body.color = tableColor;
    body.skin = tableSkin;

    const options = {
      method: "PATCH",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
      body: new URLSearchParams(body),
    };
    await fetch(env.BACKEND_PORT + "/users/update_table_skin", options)
      .then(async (response) => console.log(await response.json()))
      .catch((err) => console.error(err));
  }

  async function getUsers() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_PORT + "/users/users", options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("Users: ", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function getUserProfile(userId: number) {

      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      return await axios
        .get(env.BACKEND_PORT + "/users/get_profile/" + userId, options)

        // axios.request(options)
        .then(function (response: any) {
          console.log("Profile: ", response.data);
          return response.data;
        })
        .catch(function (error) {
          console.error(error);
        });
  }

  async function update(userUpdate: { name: string; email: string; nickname: string; image: string; }) {
      let body = {} as any;
      if (user.name != userUpdate.name) body.name = userUpdate.name;
      if (user.email != userUpdate.email) body.email = userUpdate.email;
      if (user.nickname != userUpdate.nickname) body.nickname = userUpdate.nickname;
      if (user.image != userUpdate.image) body.image = userUpdate.image;
      console.log("body\n", body, "\nuser\n", user.access_token_server);
      const options = {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
        body: new URLSearchParams(body),
      };

      await fetch(env.BACKEND_PORT + "/users", options)
        .then(async (response) => console.log(await response.json()))
        .catch((err) => console.error(err));
  }


  async function getFriends() {

      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      return await axios
        .get(env.BACKEND_PORT + "/friendship/friends/", options)

        // axios.request(options)
        .then(function (response: any) {
          console.log("Friends: ", response.data.friends);
          user.friends = response.data.friends;
          return response.data;
        })
        .catch(function (error) {
          console.error(error);
        });
  }

  async function getFriendRequests() {

      const options = {
        method: "GET",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      return await axios
        .get(env.BACKEND_PORT + "/friendship/requests/", options)
        .then(function (response: any) {
          console.log("FriendsRequests: ", response.data);
          user.friendsRequests = response.data;
          return response.data;
        })
        .catch(function (error) {
          console.error(error);
        });
  }

  async function sendFriendRequest(userId: number) {

      const options = {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      await fetch(env.BACKEND_PORT + "/friendship/send/" + userId, options)
        .then(async function (response: any) {
          user.friendsRequests.push(await response.json());
          console.log(user.friendsRequests);
        })
        .catch((err) => console.error(err));
  }

  async function cancelFriendRequest(userId: number) {

      const options = {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      await fetch(env.BACKEND_PORT + "/friendship/cancel/" + userId, options)
        .then(async function (response: any) {

          const index = user.friendsRequests.findIndex((friendship) => friendship.requesteeId === userId);
          if (index !== -1) user.friendsRequests.splice(index, 1);
          console.log("friendRequest: ", user.friendsRequests);
        })
        .catch((err) => console.error(err));
  }

  async function acceptFriendRequest(userId: number) {

      const options = {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      await fetch(env.BACKEND_PORT + "/friendship/accept/" + userId, options)
        .then(async function (response: any) {
          user.friends.push(await response.json());
          console.log(user.friends);
        })
        .catch((err) => console.error(err));
  }

  async function rejectFriendRequest(userId: number) {

      const options = {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      await fetch(env.BACKEND_PORT + "/friendship/reject/" + userId, options)
        .then(async function (response: any) {

          const index = user.friendsRequests.findIndex((friendship) => friendship.requestorId == userId);
          if (index !== -1) user.friendsRequests.splice(index, 1);
          console.log("Reject: ", userId, ": ", user.friendsRequests);
        })
        .catch((err) => console.error(err));
  }

  async function deleteFriend(userId: number) {

      const options = {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      await fetch(env.BACKEND_PORT + "/friendship/unfriend/" + userId, options)
        .then(async function (response: any) {

          const index = user.friends.findIndex((friendship) => friendship.id === userId);
          if (index !== -1) user.friendsRequests.splice(index, 1);
          console.log("Unfriend: ", userId, ": ", user.friendsRequests);
        })
        .catch((err) => console.error(err));
  }

  async function getBlockedUsers() {

    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_PORT + "/blocklist/", options)
      .then(function (response: any) {
        console.log("Block: ", response.data);
        user.block = response.data;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function blockUser(userId: number) {

      const options = {
        method: "POST",
        headers: { Authorization: `Bearer ${user.access_token_server}` },
      };

      await fetch(env.BACKEND_PORT + "/blocklist/block/" + userId, options)
        .then(async function (response: any) {
          user.friends.push(await response.json());
          console.log(user.friends);
        })
        .catch((err) => console.error(err));
  }

  async function unblockUser(userId: number) {

    const options = {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_PORT + "/blocklist/block/" + userId, options)
      .then(async function (response: any) {

        const index = user.block.findIndex((block) => block == userId);
        if (index !== -1) user.friendsRequests.splice(index, 1);
        console.log("Block: ", userId, ": ", user.block);
      })
      .catch((err) => console.error(err));
  }

  async function getBlockedBy() {

    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_PORT + "/blocklist/blockedBy", options)
      .then(function (response: any) {
        console.log("Who Blocked Me: ", response.data);
        user.block = response.data;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function getUserGames(userId: number) {
    
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_PORT + "/game/" + userId, options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("Games: ", response.data);
        if (user.id == userId)
          user.infoPong.historic = response.data;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  
  async function getGames(status: number) {
    let body = {} as any;
    body.status = status;

    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
      body: new URLSearchParams(body),
    };

    return await axios
      .get(env.BACKEND_PORT + "/game/active", options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("Games: ", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

    /* async function createChannel() {
      const createChannelDto = {
        name: "asdasdasdas",
        usersToAdd: [69], //diferente do gajo que criou
        channelType: "PUBLIC",
        password: "senha"
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token_server}`
        },
        body: JSON.stringify(createChannelDto)
      };
      try {
        const response = await fetch(`${env.BACKEND_PORT}/chat/channels`, options);
        const data = await response.json();
        console.log("CREATE CHANNEL:", data);
      } catch (error) {
        console.error(error);
      }
    }*/



  return {
    user, login, loginTest,

    //User Information
    update, updateProfile, buy_skin, updateTableDefault, getUsers, getUserProfile,

    //Friends
    getFriends, getFriendRequests,

    //Send Request Friend
    sendFriendRequest, acceptFriendRequest, cancelFriendRequest, rejectFriendRequest, deleteFriend,

    //Block
    getBlockedUsers, blockUser, unblockUser, getBlockedBy,

    //Game
    getUserGames, getGames,
  };
});
