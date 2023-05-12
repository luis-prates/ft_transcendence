export class InputHandler {
  keys: string[];

  constructor() {
    this.keys = [];
    window.addEventListener("keydown", (e) => {
      if (
        (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "w" || e.key === "s") &&
        this.keys.indexOf(e.key) === -1
      ) {
        this.keys.push(e.key);
      }
      //console.log(e.key, this.keys);
    });
   /* window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "w" || e.key === "s") {
        this.keys.splice(this.keys.indexOf(e.key), 1);
      }
      //console.log(e.key, this.keys);
    });*/
  }
}
