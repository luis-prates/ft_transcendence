import { Game, Map, Tree, WaterFont, type GameObject, Lobby } from "@/game";

import { Player } from "../..";
import { ref } from "vue";
import { MapObject } from "./MapObject";

export class MapEdit extends Lobby {
  constructor(map: Map) {
    super(map, new Player(ref(undefined), MapObject.startPossition));
    window.addEventListener("keydown", (e) => {
      if (e.key === "p") MapObject.debugView.value = !MapObject.debugView.value;
      map.keydown(e.key);
      e.preventDefault();
    });
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.camera.width = this.map.w;
    this.camera.height = this.map.h;
  }

  draw(): void {
    super.draw();
    this.drawSelection();
  }

  drawSelection() {
    if (MapObject.selection && (MapObject.action.value === 5 || MapObject.action.value === 0)) {
      const color = MapObject.action.value === 5 ? "blue" : "red";
      this.context.globalAlpha = 0.3;
      this.context.fillStyle = color;
      this.context.fillRect(MapObject.selection.x, MapObject.selection.y, MapObject.selection.w, MapObject.selection.h);
      this.context.globalAlpha = 1;
      this.context.strokeStyle = color;
      this.context.lineWidth = 2;
      this.context.strokeRect(MapObject.selection.x, MapObject.selection.y, MapObject.selection.w, MapObject.selection.h);
    }
  }

  handleMouseDown(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = Math.floor((event.clientX - rect.left) / Map.SIZE) * Map.SIZE;
    const mouseY = Math.floor((event.clientY - rect.top) / Map.SIZE) * Map.SIZE;
    MapObject.selection = {
      x: mouseX,
      y: mouseY,
      w: Map.SIZE,
      h: Map.SIZE,
    };
    this.drawSelection();
  }

  // Função para manipular o evento de mover o mouse
  handleMouseMove(event: MouseEvent) {
    if (MapObject.selection) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = Math.floor((event.clientX - rect.left) / Map.SIZE) * Map.SIZE;
      const mouseY = Math.floor((event.clientY - rect.top) / Map.SIZE) * Map.SIZE;

      MapObject.selection.w = mouseX - MapObject.selection.x;
      MapObject.selection.h = mouseY - MapObject.selection.y;
      this.drawSelection();
    }
  }

  // Função para manipular o evento de soltar o botão do mouse
  handleMouseUp(event: MouseEvent) {
    if (MapObject.action.value == 2) return;
    if (MapObject.selection) {
      // MapObject.selection.x = Math.abs(MapObject.selection.x);
      // MapObject.selection.y = Math.abs(MapObject.selection.y);
      // MapObject.selection.w = Math.abs(MapObject.selection.w);
      // MapObject.selection.h = Math.abs(MapObject.selection.h);
      // const x = MapObject.selection.x < MapObject.selection.w ? MapObject.selection.x : MapObject.selection.w;
      // const y = MapObject.selection.y < MapObject.selection.h ? MapObject.selection.y : MapObject.selection.h;
      // const w = MapObject.selection.x < MapObject.selection.w ? MapObject.selection.w : MapObject.selection.x;
      // const h = MapObject.selection.y < MapObject.selection.h ? MapObject.selection.h : MapObject.selection.y;
      // MapObject.selection = { x, y, w: w - x, h: h - y };
      // console.log(MapObject.selection);
    }

    Game.Map.mouseClick(event.offsetX, event.offsetY, event.button);
    MapObject.selection = null;
  }

  protected async mouseClick(event: MouseEvent) {
    if (MapObject.action.value == 2) super.mouseClick(event);
  }

  addGameObjectData(data: any): GameObject {
    const gamaObject: GameObject = super.addGameObjectData(data);
    MapObject.datas.push({ gamaObject, data });
    return gamaObject;
  }

  removeGameObject(gameObject: GameObject): void {
    super.removeGameObject(gameObject);
    const index = MapObject.datas.findIndex((data) => data.gamaObject === gameObject);
    if (index >= 0) MapObject.datas.splice(index, 1);
  }
}
