import { ref } from 'vue';

export function MyLobbyButtons() {
  const onMessagesClick = () => {
    // Handle Messages click
    console.log("onMessagesClick");
  }

  const onBattlesClick = () => {
    // Handle Battles click
    console.log("onBattlesClick");
  }

  const onLeaderboardClick = () => {
    // Handle Leaderboard click
    console.log("onLeaderboardClick");
  }

  return {
    onMessagesClick,
    onBattlesClick,
    onLeaderboardClick,
  };
}