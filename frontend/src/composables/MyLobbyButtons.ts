import Router from "../router";
import { socketClass } from "../socket/SocketClass";
import type { Socket } from "socket.io-client";
import { LeaderBoard } from "../../src/game/Menu/LeaderBoard";
import { FriendsMenu } from "../../src/game/Menu/FriendsMenu";
import { Messages } from "../../src/game/Menu/Messages";
import { BattleMenu } from "../../src/game/Menu/BattleMenu";
import { userStore } from '@/stores/userStore';

export function MyLobbyButtons() {

  const onLeaveClick = () => {
    // Handle Leave click
    const socket: Socket = socketClass.getLobbySocket();
    
    console.log("onLeaveClick");
    userStore().logout();
    //Router.setRoute(Router.ROUTE_LOGIN)
    Router.push(`/`);
    socket.disconnect();
  }

  // Handle Messages click
  function onMessagesClick(clearNotification: any) {
    userStore().userSelected = "messages";
    clearNotification();
  }

  // Handle Friends click
  const onFriendsClick = () => {
    userStore().userSelected = "friends";
  }

  // Handle Battles click
  const onBattlesClick = () => {
    userStore().userSelected = "battles";
  }

  // Handle Leaderboard click
  const onLeaderboardClick = () => {
    userStore().userSelected = "leaderboard";
  }

  return {
    onLeaveClick,
    onMessagesClick,
    onFriendsClick,
    onBattlesClick,
    onLeaderboardClick,
  };
}
