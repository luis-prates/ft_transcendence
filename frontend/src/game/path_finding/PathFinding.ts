import { Character } from "@/game/base/Character";
import { Map } from "@/game/lobby/objects/Map";
import type { GameObject } from "../base/GameObject";

export type eventCompleted = (objectDestination: GameObject | undefined) => void;

interface PathFindingNode {
  x: number;
  y: number;
  g: number;
  preview: PathFindingNode | null;
  direction: number;
}

export interface PathNode {
  x: number;
  y: number;
  direction: number;
}

export class PathFinding {
  public static TOP = 0;
  public static DOWN = 1;
  public static LEFT = 2;
  public static RIGHT = 3;
  public static LEFT_TOP = 4;
  public static LEFT_DOWN = 5;
  public static RIGHT_TOP = 6;
  public static RIGHT_DOWN = 7;
  open: PathFindingNode[] = [];

  close: PathFindingNode[] = [];

  private path: PathNode[] = [];

  private onCompleted: eventCompleted | undefined = undefined;
  private character: Character;

  private _isPathFinding = false;
  private objectDestination: GameObject | undefined = undefined;

  constructor(character: Character) {
    this.character = character;
    // this.onCompleted = null;
    // const imageModule = await import(/* webpackIgnore: true */ `../caminho/para/${this.imageUrl}`);
  }

  calculateDistance(nodeA: PathFindingNode, nodeB: PathFindingNode): number {
    const dx = Math.abs(nodeA.x - nodeB.x);
    const dy = Math.abs(nodeA.y - nodeB.y);
    return dx + dy;
  }

  public setDistinctionObject(objectDestination: GameObject, onCompleted?: eventCompleted) {
    let destination = { x: objectDestination.x - 10, y: objectDestination.y };
    if (objectDestination.getPointEvent) {
      destination = objectDestination.getPointEvent();
      console.log("destination: ", destination);
    }
    this.setDistinction(destination.x, destination.y, 0, objectDestination, onCompleted);
  }
  /**
   * the event onCompleted is executed only once, when the object reaches the destination
   */
  public setDistinction(dx: number, dy: number, direction: number, objectDestination: GameObject | undefined = undefined, onCompleted?: eventCompleted): boolean {
    let x = this.character.x;
    let y = this.character.y;
    this.onCompleted = onCompleted;
    this.objectDestination = objectDestination;
    this.open = [];
    this.close = [];
    this.path = [];
    this.time = 0;
    x /= Map.SIZE;
    y /= Map.SIZE;
    dx /= Map.SIZE;
    dy /= Map.SIZE;
    if (this.isEmpty(Map.map, dx, dy)) {
      this.createNodes(Map.map, { x, y, g: 0, preview: null, direction }, dx, dy);
      this.open = [];
      this.close = [];
    }
    this._isPathFinding = this.path.length > 0;
    if (!this._isPathFinding) this.character.animation.setStop(true);
    return this._isPathFinding;
  }

  private createPathNodes(node: PathFindingNode, preview: PathFindingNode | null) {}

  private createPath(node: PathFindingNode | null) {
    while (node != null && node.preview != null) {
      this.path.unshift({ x: node.x, y: node.y, direction: node.direction });
      this.createPathNodes(node, node.preview);
      node = node.preview;
    }
  }

  public createNodes(map: number[][], node: PathFindingNode | null, dx: number, dy: number): void {
    dx = Math.floor(dx);
    dy = Math.floor(dy);
    if (node != null) {
      this.close.push(node);
      this.open = this.open.filter((n) => n != node);
      if (node.x == dx && node.y == dy) this.createPath(node);
      else {
        //LEFT
        this.addNode(node, map, -1, 0, dx, dy, PathFinding.LEFT);
        //RIGHT
        this.addNode(node, map, 1, 0, dx, dy, PathFinding.RIGHT);
        //TOP
        this.addNode(node, map, 0, -1, dx, dy, PathFinding.TOP);
        //DOWN
        this.addNode(node, map, 0, 1, dx, dy, PathFinding.DOWN);

        //LEFT TOP
        this.addNode(node, map, -1, -1, dx, dy, PathFinding.LEFT_TOP);
        //RIGHT TOP
        this.addNode(node, map, 1, -1, dx, dy, PathFinding.RIGHT_TOP);
        //LEFT DOWN
        this.addNode(node, map, -1, 1, dx, dy, PathFinding.LEFT_DOWN);
        //RIGHT DOWN
        this.addNode(node, map, 1, 1, dx, dy, PathFinding.RIGHT_DOWN);

        let lowerCost: PathFindingNode | null = null;
        for (let l of this.open) {
          if (lowerCost == null || lowerCost.g > l.g) lowerCost = l;
        }
        this.createNodes(map, lowerCost, dx, dy);
      }
    }
  }

  private addNode(preview: PathFindingNode, map: number[][], x: number, y: number, dx: number, dy: number, direction: number): void {
    x += preview.x;
    y += preview.y;
    x = Math.floor(x);
    y = Math.floor(y);
    if (this.isPossible(map, x, y)) {
      if (!(x != preview.x && y != preview.y) || (this.isEmpty(map, preview.x, y) && this.isEmpty(map, x, preview.y))) {
        this.open.push({ x, y, g: this.getG(x, y, dx, dy), preview, direction });
      }
    }
  }

  private getG(x: number, y: number, dx: number, dy: number) {
    let cx = x != dx ? 14 : 10;
    let cy = y != dy ? 14 : 10;
    x = x - dx;
    x = x < 0 ? -x : x;
    y = y - dy;
    y = y < 0 ? -y : y;
    return cx * x + cy * y;
  }

  private isEmpty(map: number[][], x: number, y: number): boolean {
    x = Math.floor(x);
    y = Math.floor(y);
    return y >= 0 && y < map.length && x >= 0 && x < map[0].length && map[x][y] == 0;
  }

  private isPossible(map: number[][], x: number, y: number): boolean {
    if (this.isEmpty(map, x, y)) {
      for (let e of this.close) {
        if (x == e.x && y == e.y) return false;
      }
      return true;
    }
    return false;
  }

  public getPath(): PathNode[] {
    return this.path;
  }

  public setPath(path: PathNode[] | null): void {
    if (path == null) path = [];
    this.path = path;
    if (this.path.length > 0) this._isPathFinding = true;
    this.time = 0;
    console.log("setPath: ", this.path);
  }

  time: number = 0;
  time2: number = 0;

  private getAnimation(direction: number): string {
    switch (direction) {
      case PathFinding.LEFT:
        return "walk_left";
      case PathFinding.RIGHT:
        return "walk_right";
      case PathFinding.TOP:
        return "walk_top";
      case PathFinding.DOWN:
        return "walk_bottom";
      case PathFinding.LEFT_TOP:
        return "walk_left";
      case PathFinding.RIGHT_TOP:
        return "walk_right";
      case PathFinding.LEFT_DOWN:
        return "walk_left";
      case PathFinding.RIGHT_DOWN:
        return "walk_right";
    }
    return "idle";
  }

  public update(deltaTime: number): void {
    if (this._isPathFinding) {
      if (this.path.length > 0) {
        this.time += deltaTime;
        if (this.time > this.character.speed) {
          let node = this.path[0];
          this.time = 0;
          if (node != null) {
            this.character.move(node.x * Map.SIZE, node.y * Map.SIZE, this.getAnimation(node.direction));
            this.path.shift();
          }
        }
      } else {
        this._isPathFinding = false;
        if (this.objectDestination != null) {
          this.character.setLookAt(this.objectDestination);
        }
        if (this.onCompleted != undefined) this.onCompleted(this.objectDestination);
        this.character.animation.setStop(true);
      }
    }
  }
}
