import { Player } from 'src/lobby';
import { Game, Status } from './GamePong';
import { gameRequest, playerInfo, updatePlayer } from './SocketInterface';

export class Games {
	private games: Game[] = [];

	public connection(player: Player) {
		player.on('new_game', (e: gameRequest) => this.new_game(player, e));
		player.on('entry_game', (e: playerInfo) => this.entry_game(player, e));
	}

	new_game(player: Player, e: gameRequest) {
		console.log('PLAYER_1: ', e);
		this.games.push(
			new Game(e, () => {
				this.games = this.games.filter((g) => g.data.objectId != e.objectId);
				console.log('remove game: ', this.games.length);
				player?.map.removeGameObject(e.objectId);
			}),
		);
	}

	entry_game(player: Player, info: playerInfo) {
		console.log(info);
		const game = this.games.find((g) => g.data.objectId == info.objectId);
		if (game) {
			game.entry_game(player, info);
			console.log(this.games);
		}
	}

	disconnect(player: Player) {
		console.log('Socket desconectado:', player.id);
		function isInGame(game: Game) {
			const disconect = player.id;
			if (game.status == Status.Finish) return;
			if (game.player1.socket.id == disconect) game.endGame(2);
			else if (game.player2.socket.id == player.id) game.endGame(1);
			const index = game.watchers.findIndex((socket: any) => socket.socket.id === disconect);
			if (index !== -1) {
				game.watchers.splice(index, 1);
				console.log('Socket removido da lista de watchers');
				this.emitAll('game_view', this.watchers.length);
			}
		}
		this.games.forEach((game) => isInGame(game));
	}
}
