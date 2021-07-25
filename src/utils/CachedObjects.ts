import Cell from "../objects/Cell";
import Ejected from "../objects/Ejected";
import Food from "../objects/Food"

class FlexiblePool<T> {
  private created: number = 0;
  private gotFromCache: number = 0;
  private pushedToCache: number = 0;
  private actualLimit: number = 0;
  private observable: Array<T> = [];
  
  constructor(private readonly type: TPoolType, private limit: number) { 
    this.actualLimit = limit;
  }

  private createNewElement(): T {
    switch (this.type) {
      case 'FOOD':
        return new Food() as unknown as T;

      case 'EJECTED':
        return new Ejected() as unknown as T;

      case 'CELL':
        return new Cell() as unknown as T;
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
}

export default new class CachedObjects {
  private food: FlexiblePool<Food> = new FlexiblePool('FOOD', 1024);
  private ejected: FlexiblePool<Ejected> = new FlexiblePool('EJECTED', 1024);
  private cells: FlexiblePool<Cell> = new FlexiblePool('CELL', 1024);

  constructor() {
    (window as any).CachedObjects = this;
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