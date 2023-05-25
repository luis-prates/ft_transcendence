import { reactive } from "vue";
import { defineStore } from "pinia";
import { env } from "../env";
import axios from "axios";

export interface User {
  access_token_server: string;
  accessToken: string;
  refreshToken: string;
  isLogin: boolean;
  id: number;
  name: string;
  email: string;
  nickname: string;
  image: string;
}

export const userStore = defineStore("user", () => {
  const user = reactive({
    access_token_server: "",
    accessToken: "",
    refreshToken: "",
    name: "",
    email: "",
    id: 0,
    nickname: "",
    isLogin: false,
    image: "",
  });

  async function login(authorizationCode: string | undefined) {
    console.log("login", authorizationCode);
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
        const photoResponse = await axios.get("https://api.intra.42.fr/v2/users/" + userInfoResponse.data.id, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        user.image = photoResponse.data.image.link;
        console.log(userInfoResponse.data);
        user.name = userInfoResponse.data.displayname;
        user.email = userInfoResponse.data.email;
        user.id = userInfoResponse.data.id;
        user.nickname = userInfoResponse.data.login;
        await axios
          .post("https://unbecoming-fact-production.up.railway.app/auth/signin", user)

          // axios.request(options)
          .then(function (response: any) {
            user.access_token_server = response.data.access_token;
            user.name = response.data.dto.name;
            user.email = response.data.dto.email;
            user.id = response.data.dto.id;
            user.nickname = response.data.dto.nickname;
            user.image = response.data.dto.image;
            console.log("server:", response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
        user.isLogin = true;
      })
      .catch((error) => {
        console.log(error);
        user.isLogin = false;
      });
    // .finally(() => window.location.href = window.location.origin);
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

  return { user, login, update };
});
