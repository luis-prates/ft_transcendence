import { Player } from '../../player/Player';
import { GameClass, Status } from './GamePong';
import { gameRequest, playerInfo } from '../../socket/SocketInterface';

export class Games {
	private games: GameClass[] = [];

	public connection(player: Player) {
		//! done in game.service.ts
		player.onLobby('new_game', (e: gameRequest) => this.new_game(player, e));
		//! done in game.service.ts
		player.onLobby('entry_game', (e: playerInfo) => this.entry_game(player, e));
	}

	new_game(player: Player, e: gameRequest) {
		console.log('PLAYER_1: ', e);
		// this.games.push(
		// 	new GameClass(e, () => {
		// 		this.games = this.games.filter(
		// 			g => g.data.objectId != e.objectId,
		// 		);
		// 		console.log('remove game: ', this.games.length);
		// 		player?.map.removeGameObject(player, e.objectId);
		// 	}),
		// );
	}

	entry_game(player: Player, info: playerInfo) {
		console.log(info);
		const game = this.games.find(g => g.data.objectId == info.objectId);
		if (game) {
			game.entry_game(player, true, info);
			console.log(this.games);
		}
	}

	disconnect(player: Player) {
		console.log('Socket desconectado:', player.id);
		function isInGame(game: GameClass) {
			const disconnect = player.id;
			if (game.status == Status.Finish) {
				return;
			}
			if (game.player1.socket.id == disconnect) {
				game.endGame(2);
			} else if (game.player2.socket.id == player.id) {
				game.endGame(1);
			}
			const index = game.watchers.findIndex((socket: any) => socket.socket.id === disconnect);
			if (index !== -1) {
				game.watchers.splice(index, 1);
				console.log('Socket removido da lista de watchers');
				this.emitAll('game_view', this.watchers.length);
			}
		}
		this.games.forEach(game => isInGame(game));
	}
}
