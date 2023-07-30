import { reactive } from "vue";
import { defineStore } from "pinia";
import { env } from "../env";
import axios from "axios";
import type { TypeSkin } from "@/game/ping_pong/Skin";
import type { Socket } from "socket.io-client";
import { socketClass } from "@/socket/SocketClass";
import { ConfirmButton, STATUS_CONFIRM } from "@/game/Menu/ConfirmButton";
import { Game } from "@/game/base/Game";

export enum GameStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGESS = "IN_PROGESS",
  FINISHED = "FINISHED",
}

enum UserStatus {
  OFFLINE = "OFFLINE",
  IN_GAME = "IN_GAME",
  ONLINE = "ONLINE",
}

export interface Block {
  blocker: {
    id: number;
    nickname: string;
    image: string;
  };
  blockerId: number;
  blockedId: number;
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

export interface GAME {
  winnerId: number;
  winnerNickname: string;
  winnerScore: number;
  loserId: number;
  loserNickname: string;
  loserScore: number;
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
  historic: GAME[];
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
  friends: any;
  friendsRequests: Friendship[];
  block: Block[];
  isTwoFAEnabled: boolean;
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
    isTwoFAEnabled: false,
  });

  async function login(authorizationCode: string | undefined) {
    if (user.isLogin || authorizationCode === undefined) return;
    user.access_token_server = authorizationCode;
    user.isLogin = false;

    await axios
      .get(env.BACKEND_SERVER_URL + "/users/me", {
        headers: {
          Authorization: "Bearer " + authorizationCode,
        },
      })
      .then(function (response: any) {
        user.id = response.data.id;
        user.name = response.data.name;
        user.nickname = response.data.nickname;
        user.email = response.data.email;
        user.status = response.data.status;
        user.image = response.data.image;
        user.money = response.data.money;
        user.avatar = response.data.avatar;
        user.infoPong.level = response.data.level;
        user.infoPong.xp = response.data.xp;
        user.infoPong.color = response.data.color;
        user.infoPong.skin.default.tableColor = response.data.tableColorEquipped;
        user.infoPong.skin.default.tableSkin = response.data.tableSkinEquipped;
        user.infoPong.skin.default.paddle = response.data.paddleSkinEquipped;
        user.infoPong.skin.tables = response.data.tableSkinsOwned;
        user.infoPong.skin.paddles = response.data.paddleSkinsOwned;
        user.isTwoFAEnabled = response.data.isTwoFAEnabled;
        getFriends();
        getFriendRequests();
        getBlockedUsers();
        getBlockedBy();
        getUserGames(user.id);
		user.isLogin = true;
      })
      .catch(function (error) {
        console.error(error);
        user.isLogin = false;
      });
    // .finally(() => window.location.href = window.location.origin);
    return user;
  }

  async function firstTimePrompt() {
    let updateSuccess = false;
    try {
      await axios.patch(
        env.BACKEND_SERVER_URL + "/users/update_profile",
        {
          nickname: user.nickname,
          image: user.image,
        },
        {
          headers: {
            Authorization: "Bearer " + user.access_token_server,
          },
        }
      );
      updateSuccess = true;
    } catch (error) {
      console.error(error);
      updateSuccess = false;
    }
    return updateSuccess;
  }

  async function loginTest() {
	let isFirstTime = false;
    // if (user.isLogin) return;
    await axios
      .post(env.BACKEND_SERVER_URL + "/auth/signin", user)

      // axios.request(options)
      .then(function (response: any) {
        console.log("response: ", response.data);

        user.access_token_server = response.data.access_token;
        user.id = response.data.dto.id;
        user.status = response.data.dto.status;
        user.name = response.data.dto.name;
        user.email = response.data.dto.email;
        user.nickname = response.data.dto.nickname;
        user.image = response.data.dto.image;
        user.money = response.data.dto.money;
        user.avatar = response.data.dto.avatar;
        user.infoPong.level = response.data.dto.level;
        user.infoPong.xp = response.data.dto.xp;
        user.infoPong.color = response.data.dto.color;
        user.infoPong.skin.default.tableColor = response.data.dto.tableColorEquipped;
        user.infoPong.skin.default.tableSkin = response.data.dto.tableSkinEquipped;
        user.infoPong.skin.default.paddle = response.data.dto.paddleSkinEquipped;
        user.infoPong.skin.tables = response.data.dto.tableSkinsOwned;
        user.infoPong.skin.paddles = response.data.dto.paddleSkinsOwned;
        user.isTwoFAEnabled = response.data.dto.isTwoFAEnabled;
		isFirstTime = response.data.firstTime;
        getFriends();
        getFriendRequests();
        getBlockedUsers();
        getBlockedBy();
        getUserGames(user.id);
      })
      .catch(function (error) {
        console.error(error);
      });
    user.isLogin = true;
    console.log("USER: ", user);
    // .finally(() => window.location.href = window.location.origin);
    return { firstTime: isFirstTime, isTwoFAEnabled: user.isTwoFAEnabled};
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
    await fetch(env.BACKEND_SERVER_URL + "/users/update_profile", options)
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

    await fetch(env.BACKEND_SERVER_URL + "/users/buy_skin", options)
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
    await fetch(env.BACKEND_SERVER_URL + "/users/update_table_skin", options)
      .then(async (response) => console.log(await response.json()))
      .catch((err) => console.error(err));
  }

  async function getUsers() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_SERVER_URL + "/users/users", options)

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
      .get(env.BACKEND_SERVER_URL + "/users/get_profile/" + userId, options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("Profile: ", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function update(userUpdate: { name: string; email: string; nickname: string; image: string }) {
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

    await fetch(env.BACKEND_SERVER_URL + "/users", options)
      .then(async (response) => console.log(await response.json()))
      .catch((err) => console.error(err));
  }

  async function getFriends() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_SERVER_URL + "/friendship/friends/", options)

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
      .get(env.BACKEND_SERVER_URL + "/friendship/requests/", options)
      .then(function (response: any) {
        console.log("FriendsRequests: ", response.data);
        user.friendsRequests = response.data;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function sendFriendRequest(userId: number, userNickname: string) {
    const options = {
      method: "POST",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/friendship/send/" + userId, options)
      .then(async function (response: any) {
        //Add Store()
        console.log(response);
        console.log(user.friendsRequests);

        const request = {
          requesteeId: userId,
          requesteeName: userNickname,
          requestorId: user.id,
          requestorName: user.nickname,
        };
        user.friendsRequests.push(request);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("sendFriendRequest", request);
      })
      .catch((err) => console.error(err));
  }

  async function cancelFriendRequest(userId: number) {
    const options = {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/friendship/cancel/" + userId, options)
      .then(async function (response: any) {
        //Add Store()
        const index = user.friendsRequests.findIndex((friendship) => friendship.requesteeId === userId);
        if (index !== -1) user.friendsRequests.splice(index, 1);
        console.log("friendRequest: ", user.friendsRequests);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("cancelFriendRequest", {
          requesteeId: userId,
          requestorId: user.id,
        });
      })
      .catch((err) => console.error(err));
  }

  async function acceptFriendRequest(userId: number, userNickname: string) {
    const options = {
      method: "POST",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/friendship/accept/" + userId, options)
      .then(async function (response: any) {
        user.friendsRequests = user.friendsRequests.filter((request: Friendship) => request.requestorId != userId);
        user.friends.push({
          id: userId,
          nickname: userNickname,
        });
        console.log(user.friends);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("acceptFriendRequest", {
          requesteeId: user.id,
          requesteeName: user.nickname,
          requestorId: userId,
        });
      })
      .catch((err) => console.error(err));
  }

  async function rejectFriendRequest(userId: number) {
    const options = {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/friendship/reject/" + userId, options)
      .then(async function (response: any) {
        const index = user.friendsRequests.findIndex((friendship) => friendship.requestorId == userId);
        if (index !== -1) user.friendsRequests.splice(index, 1);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("rejectFriendRequest", {
          requesteeId: user.id,
          requesteeName: user.nickname,
          requestorId: userId,
        });
        console.log("Reject: ", userId, ": ", user.friendsRequests);
      })
      .catch((err) => console.error(err));
  }

  async function deleteFriend(userId: number) {
    const options = {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/friendship/unfriend/" + userId, options)
      .then(async function (response: any) {
        const index = user.friends.findIndex((friendship) => friendship.id === userId);
        if (index !== -1) user.friends.splice(index, 1);
        console.log("Unfriend: ", userId, ": ", user.friends);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("deleteFriend", {
          unfriend: userId,
          id: user.id,
        });
      })
      .catch((err) => console.error(err));
  }

  async function getBlockedUsers() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_SERVER_URL + "/blocklist/", options)
      .then(function (response: any) {
        user.block.push(...response.data);
        console.log("Block: ", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function blockUser(userId: number, userNickname: string, userImage: string) { 
    const options = {
      method: "POST",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/blocklist/block/" + userId, options)
      .then(async function (response: any) {
        //Add in Store
        const existingEvent = user.block.find((block: any) => block.blockedId === userId);
        if (!existingEvent) {
          user.block.push({
            blocked: {
              id: userId,
              nickname: userNickname,
              image: userImage,
            },
            blockedId: userId,
            blockerId: user.id,
          });
        }
        console.log("Block User:", userNickname, user.block);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("block_user", {
          blockerId: user.id,
          blockerNickname: user.nickname,
          blockId: userId,
        });
      })
      .catch((err) => console.error(err));
  }

  async function unblockUser(userId: number) {
    const options = {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    await fetch(env.BACKEND_SERVER_URL + "/blocklist/block/" + userId, options)
      .then(async function (response: any) {
        //Add in Store
        user.block = user.block.filter((block: any) => block.blockedId != userId);
        console.log("UnBlock: ", userId, ": ", user.block);

        //Emit
        const lobbySocket: Socket = socketClass.getLobbySocket();
        lobbySocket.emit("unblock_user", {
          blockerId: user.id,
          blockerNickname: user.nickname,
          blockId: userId,
        });
      })
      .catch((err) => console.error(err));
  }

  async function getBlockedBy() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_SERVER_URL + "/blocklist/blockedBy", options)
      .then(function (response: any) {
        user.block.push(...response.data);
        console.log("Who Blocked Me: ", response.data);
        console.log("Block List", user.block);
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
      .get(env.BACKEND_SERVER_URL + "/game/user/" + userId, options)
      .then(function (response: any) {
        console.log("Games: ", response.data);
        if (user.id == userId) user.infoPong.historic = response.data;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function getGames(status: GameStatus) {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
      params: new URLSearchParams([["status", status]]),
    };

    return await axios
      .get(env.BACKEND_SERVER_URL + "/game/active", options)

      // axios.request(options)
      .then(function (response: any) {
        console.log("Games: ", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function getLeaderboard() {
    const options = {
      method: "GET",
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .get(env.BACKEND_SERVER_URL + "/game/leaderboard", options)
      .then(function (response: any) {
        console.log("LeaderBoard: ", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function createGame(userId: number, gameRequest: any) {
    let body = {} as any;
    body.gameType = "PUBLIC";
    body.players = [userId];
    body.gameRequest = gameRequest;

    const options = {
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .post(env.BACKEND_SERVER_URL + "/game/create", body, options)
      .then(function (response: any) {
        console.log(`GAME: ${response.data}`);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  async function twoFAGenerate(): Promise<string> {
    const options = {
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .post(env.BACKEND_SERVER_URL + "/auth/2fa/generate", undefined, options)
      .then(function (response: any) {
        console.log(`2Fa: ${response.data}`);
        return response.data.responseObj;
      })
      .catch(function (error) {
        console.error(error);
        throw new Error(error);
      });
  }

  async function twoFATurnOn(twoFactorCode: string): Promise<string> {
    const options = {
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };
    console.log("code:", twoFactorCode);
    return await axios
      .post(env.BACKEND_SERVER_URL + "/auth/2fa/turn-on", { twoFACode: twoFactorCode }, options)
      .then(function (response: any) {
        console.log(`2Fa ON: ${response.data}`);
        user.isTwoFAEnabled = true;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
        throw new Error(error);
      });
  }

  async function twoFATurnOff(twoFactorCode: string): Promise<string> {
    const options = {
      headers: { Authorization: `Bearer ${user.access_token_server}` },
    };

    return await axios
      .post(env.BACKEND_SERVER_URL + "/auth/2fa/turn-off", { twoFACode: twoFactorCode }, options)
      .then(function (response: any) {
        console.log(`2Fa OFF: ${response.data}`);
        user.isTwoFAEnabled = false;
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
        throw new Error(error);
      });
  }

  function challengeUser(challangedUserID: number, challangedUserNickname: string) : string
  {
    const lobbySocket = socketClass.getLobbySocket();
    const confirmButton = new ConfirmButton(challangedUserNickname, STATUS_CONFIRM.CHALLENGE);
    confirmButton.show((value) => {
      if (value == "CONFIRM") {

        lobbySocket.emit("invite_game", { 
          //Desafiador
          challengerId: user.id,
          challengerNickname: user.nickname,
          //Desafiado
          challengedId: challangedUserID,
          challengedNickname: challangedUserNickname,
        });
      
        lobbySocket.on("invite_request_game", (e: any) => {				  
          const confirmButton = new ConfirmButton(e.playerName, STATUS_CONFIRM.CHALLENGE_YOU);
          Game.instance.addMenu(confirmButton.menu);
              confirmButton.show((value) => {
            if (value == "CONFIRM") {
              lobbySocket.emit("challenge_game", {
              challenged: user.id, 
              challenger: e.playerId,
              });
            }
          });
        });

        lobbySocket.on("invite_confirm_game", (message: string) => {
          const confirmButton = new ConfirmButton(message, STATUS_CONFIRM.ERROR, 5000);
          Game.instance.addMenu(confirmButton.menu);
          lobbySocket.off("invite_confirm_game");
        });
        return ("CONFIRM");
      }
      else
        return ("CANCEL");
    });
    return ("");
  }

  return {
    user,
    login,
    loginTest,

    //User Information
    update,
    updateProfile,
    buy_skin,
    updateTableDefault,
    getUsers,
    getUserProfile,
    challengeUser,

    //Friends
    getFriends,
    getFriendRequests,

    //Send Request Friend
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    rejectFriendRequest,
    deleteFriend,

    //Block
    getBlockedUsers,
    blockUser,
    unblockUser,
    getBlockedBy,

    //Game
    getUserGames,
    getGames,
    getLeaderboard,
    createGame,

    //TwoFactor
    twoFAGenerate,
    twoFATurnOn,
    twoFATurnOff,
  
	firstTimePrompt,
  };
});
