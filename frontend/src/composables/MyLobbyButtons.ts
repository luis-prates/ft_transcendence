import { ref } from 'vue';
import Router from "../router";
import { socketClass } from "../socket/SocketClass";
import type { Socket } from "socket.io-client";
import { LeaderBoard } from "../../src/game/Menu/LeaderBoard";
import { FriendsMenu } from "../../src/game/Menu/FriendsMenu";
import { Messages } from "../../src/game/Menu/Messages";
import { BattleMenu } from "../../src/game/Menu/BattleMenu";

export function MyLobbyButtons() {

  let battleMenu: boolean = false;
  let leaderBoardMenu: boolean = false;
  let messagesMenu: boolean = false;
  let friendsMenu: boolean = false;
  
  const onLeaveClick = () => {
    // Handle Leave click
    const socket: Socket = socketClass.getLobbySocket();
    
    console.log("onLeaveClick");
    Router.setRoute(Router.ROUTE_LOGIN)
    Router.push(`/`);
    socket.disconnect();
  }

  // Handle Messages click
  function onMessagesClick(clearNotification: any) {
    if (menuIsActive())
      return ;
    clearNotification();
    messagesMenu = true;
    const confirmButton = new Messages();
    confirmButton.show((value) => {
      if (value == "EXIT") {
        messagesMenu = false;
      }
    });
  }

  // Handle Friends click
  const onFriendsClick = () => {
    if (menuIsActive())
      return ;
    friendsMenu = true;
    const friendsBoard = new FriendsMenu();
    friendsBoard.show((value) => {
      if (value == "EXIT") {
        friendsMenu = false;
      }
    });
  }

  // Handle Battles click
  const onBattlesClick = () => {
    if (menuIsActive())
      return ;
    battleMenu = true;
    const battleBoard = new BattleMenu();
    battleBoard.show((value) => {
      if (value == "EXIT") {
        battleMenu = false;
      }
    });
  }

  // Handle Leaderboard click
  const onLeaderboardClick = () => {
    if (menuIsActive())
      return ;
    leaderBoardMenu = true;
    const leaderBoard = new LeaderBoard();
    leaderBoard.show((value) => {
      if (value == "EXIT") {
        leaderBoardMenu = false;
      }
    });
  }

  const menuIsActive = () => {
    if (messagesMenu || battleMenu || leaderBoardMenu || friendsMenu)
      return true;
    return false;
  }

  return {
    onLeaveClick,
    onMessagesClick,
    onFriendsClick,
    onBattlesClick,
    onLeaderboardClick,
  };
}