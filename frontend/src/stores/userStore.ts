import { reactive } from "vue";
import { defineStore } from "pinia";
import { env } from "../env";
import axios from "axios";
import type { ProductSkin, TypeSkin } from "@/game/ping_pong/Skin";

enum UserStatus {
	OFFLINE = "OFFLINE",
	IN_GAME = "IN_GAME",
	ONLINE = "ONLINE",
}

export interface Historic {
  winner: string;
  loser: string;
  player1: string;
  player2: string;
  result: string;
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
  nickname: string;             //nickName in the Game
  image: string;                //image Profile
  avatar: number;               //Avatar in The Lobby           
  infoPong: InfoPong;
  money: number;
}

export const userStore = defineStore("user", () => {
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
        user.infoPong.skin.tables =  response.data.dto.tableSkinsOwned;
        user.infoPong.skin.paddles =  response.data.dto.paddleSkinsOwned;
        //TODO
        //user.infoPong.historic = [],
       console.log("response: " , response.data.dto)
      })
      .catch(function (error) {
        console.error(error);
      });
    user.isLogin = true;
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

    //TODO

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

    await fetch("https://unbecoming-fact-production.up.railway.app/users", options)
      .then(async (response) => console.log(await response.json()))
      .catch((err) => console.error(err));
  }

  return { user, login, loginTest, update, updateProfile, buy_skin, updateTableDefault };
});
