import { Camera } from "./lobby/objects/Camera";
import { Player } from "./lobby/objects/Player";
import { Map } from "./lobby/objects/Map";
import { Npc } from "./lobby/objects/Npc";
import { Game } from "@/game/base/Game";
import { Character } from "./base/Character";
import { type GameObject, type Rectangle } from "./base/GameObject";
import { Lobby } from "./lobby/Lobby";
import { Table } from "./lobby/objects/Table";
import { Tree } from "./lobby/objects/Tree";
import { WaterFont } from "./lobby/objects/WaterFont";
import { Menu, type ElementUI, type MenuLayer, type ElementUIType } from "./Menu/Menu";

export { Player, Camera, Map, Npc, Game, Character, Lobby, Table, Tree, WaterFont, Menu };
export type { GameObject, Rectangle, ElementUI, MenuLayer, ElementUIType };

export const listClass: { [key: string]: any } = {
  Character,
  Player,
  Npc,
  Table,
  Tree,
  WaterFont,
};
