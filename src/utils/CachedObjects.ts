import Cell from "../objects/Cell";
import Ejected from "../objects/Ejected";
import Food from "../objects/Food"
import World from "../render/World";

class FlexiblePool<T> {
  private created: number = 0;
  private gotFromCache: number = 0;
  private pushedToCache: number = 0;
  private actualLimit: number = 0;
  private observable: Array<T> = [];
  
  constructor(private readonly type: TPoolType, private limit: number, private world: World) { 
    this.actualLimit = limit;
  }

  private createNewElement(): T {
    switch (this.type) {
      case 'FOOD':
        return new Food(this.world) as unknown as T;

      case 'EJECTED':
        return new Ejected(this.world) as unknown as T;

      case 'CELL':
        return new Cell(this.world) as unknown as T;
    }
  }

  public add(obj: T): void {
    if (this.observable.length >= this.actualLimit) {
      return;
    }

    this.observable.push(obj);

    this.pushedToCache++;
  }

  public get(): T {
    if (this.observable.length) {
      this.gotFromCache++;
      return this.observable.pop();
    }

    for (let i = 0; i < 50; i++) {
      this.created++;
      this.observable.push(this.createNewElement());
    }

    if (this.created > this.actualLimit) {
      this.actualLimit += 50;
    }

    return this.observable.pop();
  }

  public getStatistic(): IPoolStatistic {
    return {
      created: this.created,
      pushedToCache: this.pushedToCache,
      gotFromCache: this.gotFromCache,
    }
  }

  public getPool(): Array<T> {
    return this.observable;
  }
}

export default class CachedObjects {
  private food: FlexiblePool<Food>;
  private ejected: FlexiblePool<Ejected>;
  private cells: FlexiblePool<Cell>;

  constructor(private world: World) {
    this.food = new FlexiblePool('FOOD', 1024, world);
    this.ejected = new FlexiblePool('EJECTED', 1024, world);
    this.cells = new FlexiblePool('CELL', 1024, world);

    (window as any).CachedObjects = this;
  }

  public getPool(type: TPoolType): Array<Food | Ejected | Cell> {
    switch (type) {
      case 'CELL':
        return this.cells.getPool();
      
      case 'EJECTED':
        return this.ejected.getPool();

      case 'FOOD':
        return this.food.getPool();
    }
  }

  public getFood(): Food {
    return this.food.get();
  }

  public addFood(food: Food): void {
    this.food.add(food);
  }

  public getEjected(): Ejected {
    return this.ejected.get();
  }

  public addEjected(ejected: Ejected): void {
    this.ejected.add(ejected);
  }

  public getCell(): Cell {
    return this.cells.get();
  }

  public addCell(cell: Cell): void {
    this.cells.add(cell);
  }

  public getStatistic(type: TPoolType): IPoolStatistic {
    switch (type) {
      case 'FOOD':
        return this.food.getStatistic();

      case 'EJECTED':
        return this.ejected.getStatistic();

      case 'CELL': 
        return this.cells.getStatistic();

      default:
        return { created: -1, pushedToCache: -1, gotFromCache: -1 }
    }
  }
}

export type TPoolType = 'FOOD' | 'EJECTED' | 'CELL'; 
export interface IPoolStatistic {
  created: number,
  gotFromCache: number,
  pushedToCache: number
}