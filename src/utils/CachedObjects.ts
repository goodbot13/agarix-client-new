import Cell from "../objects/Cell";
import Ejected from "../objects/Ejected";
import Food from "../objects/Food"

export default new class CachedObjects {
  private food: Array<Food> = [];
  private ejected: Array<Ejected> = [];
  private cells: Array<Cell> = [];

  private MAX_POOL_SIZE = 768;

  constructor() {
    (window as any).CachedObjects = this;
  }

  public getFood(): Food {
    if (this.food.length) {
      return this.food.pop();
    }

    for (let i = 0; i < 50; i++) {
      const food = new Food();
      this.food.push(food);
    }

    return this.food.pop();
  }

  public addFood(food: Food): void {
    if (this.food.length < this.MAX_POOL_SIZE) {
      this.food.push(food);
    }
  }

  public getEjected(): Ejected {
    if (this.ejected.length) {
      return this.ejected.pop();
    }

    for (let i = 0; i < 50; i++) {
      const ejected = new Ejected();
      this.ejected.push(ejected);
    }

    return this.ejected.pop();
  }

  public addEjected(ejected: Ejected): void {
    if (this.ejected.length < this.MAX_POOL_SIZE) {
      this.ejected.push(ejected);
    }
  }

  public getCell(): Cell {
    if (this.cells.length) {
      return this.cells.pop();
    }

    for (let i = 0; i < 50; i++) {
      const cell = new Cell();
      this.cells.push(cell);
    }

    return this.cells.pop();
  }

  public addCell(cell: Cell): void {
    if (this.cells.length < this.MAX_POOL_SIZE) {
      this.cells.push(cell);
    }
  }
}