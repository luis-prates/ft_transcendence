import { Server } from 'socket.io';
import { Player } from './Player';
import * as fs from 'fs';
import * as path from 'path';

export interface TableData {
  className: string;
  x: number;
  y: number;
  objectId: string;
  pontoEvento: { x: number; y: number; isFree: boolean }[];
}

export default class Lobby {
  public players: Player[] = [];
  private tables: TableData[] = [];
  private io: Server;
  private static instance: Lobby;
  private map: any;

  constructor(io: Server) {
    console.log('lobby created');
    this.io = io;
    Lobby.instance = this;
    const jsonPath = path.join(__dirname, '..', 'public', 'map_1.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonObject = JSON.parse(jsonData);
    this.map = jsonObject;
  }

  public static emitAll(event: string, data: any, ignorerPlayer?: Player): void {
    Lobby.instance.players.forEach((clientSocket) => {
      if (ignorerPlayer === undefined || clientSocket.objectId !== ignorerPlayer.objectId) clientSocket.emit(event, data);
    });
  }

  public static removePlayer(player: Player): void {
    Lobby.instance.players = Lobby.instance.players.filter((clientSocket) => {
      return clientSocket.socket.id !== player.socket.id;
    });
  }

  loadLobby(player: Player): void {
    const clientSocket = this.players.find((clientSocket) => clientSocket.objectId === player.objectId);
    const data: any[] = this.players.filter((e) => e.objectId != player.objectId).map((e) => e.data);
    data.push(...this.tables);
    console.log('load lobby: ', data);
    player.data.x = this.map.start_position.x;
    player.data.y = this.map.start_position.y;
    player.emit('load_lobby', {
      map: this.map,
      player: clientSocket ? clientSocket.data : player.data,
      data: data,
    });
    if (clientSocket) {
      clientSocket.socket = player.socket;
      console.log('re-connected socket: ', player.objectId);
    } else {
      this.players.push(player);
      Lobby.emitAll('new_gameobject', player.data, player);
      console.log('new player: ', player.objectId);
    }
  }

  public putPlayer(player: Player): void {
    this.loadLobby(player);
    player.socket.on('new_gameobject', (data) => {
      if (data.className === 'Table') this.tables.push(data);
      Lobby.emitAll('new_gameobject', data, player);
    });
    player.socket.on('update_gameobject', (data) => {
      player.data = data;
      Lobby.emitAll('update_gameobject', data, player);
    });

    // socket.on('new_player', (...args) => {
    //   socket.data = args[0];
    //   console.log('new player: ', socket.data.objectId);
    //   this.emitAll('new_player', socket.data, socket);
    //   this.players.forEach((clientSocket) => {
    //     if (clientSocket.id !== socket.id)
    //       socket.emit('new_player', clientSocket.data);
    //   });
    //   this.tables.forEach((table) => {
    //     socket.emit('new_table', table);
    //   });
    //   this.players.push(socket);
    // });

    // socket.on('player_move', (...args) => {
    //   socket.data = args[0];
    //   // console.log('player_move: ', socket.data);
    //   this.emitAll('player_move', socket.data, socket);
    //   socket.data.pathFinding = [];
    // });

    // socket.on('new_table', (...args) => {
    //   console.log('new_table: ', args[0]);
    //   this.tables.push(args[0]);
    //   this.emitAll('new_gameobject', args[0]);
    //   // remover a mesa da lista, apos 1 minuto
    //   setTimeout(() => {
    //     socket.emit('remove_gameobject', args[0]);
    //     this.tables = this.tables.filter((table) => {
    //       return table.objectId !== args[0].objectId;
    //     });
    //     console.log('remove_gameobject: ', args[0]);
    //   }, 60000);
    // });
  }
}
