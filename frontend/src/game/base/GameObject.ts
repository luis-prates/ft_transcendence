export type GameObjectType = "map" | "character" | "npc" | "item" | "player" | "camera" | "table" | "door" | "tree" | "water_font";

export interface GameObject {
  type: GameObjectType;
  imagem: any;
  x: number;
  y: number;
  w: number;
  h: number;
  objectId: number;
  isSelect: boolean;

  draw(contex: CanvasRenderingContext2D): void;
  update?(deltaTime: number): void;
  mouseClick?(x: number, y: number, button: number): void;
  onSelected?(): void;
  onDeselected?(): void;
  getPointEvent?(): { x: number; y: number };
  destroy?(): void;
  setData(data: any): void;
  interaction?(gameObject: GameObject): void;
  isCollision?(gameObject: GameObject): boolean;
}

function SocketObject(config: { type: string }) {
  return function (target: any) {
    // Aqui você pode adicionar a lógica desejada para o decorador
    console.log(`Criando um objeto do tipo ${config.type}`);
    // Outras operações relacionadas ao decorador...

    // Retorna a classe modificada ou adiciona propriedades/funções a ela
    return target;
  };
}
