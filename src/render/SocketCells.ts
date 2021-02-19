import Cell from "../objects/Cell/index";
import Virus from "../objects/Virus/Virus";
import { Subtype } from "../objects/types";
import Food from "../objects/Food";

class SingleSocketCells {
  public data: Map<number, Cell | Virus | Food>;

  constructor() {
    this.data = new Map();
  }

  public add(id: number, cell: Cell | Virus | Food): void {
    this.data.set(id, cell);
  }

  public remove(id: number): void {
    this.data.delete(id);
  }

  public clear() {
    this.data.clear();
  }
}

export default class SocketCells {
  public firstTab: SingleSocketCells;
  public secondTab: SingleSocketCells;
  public topOneTab: SingleSocketCells;

  constructor() {
    this.firstTab = new SingleSocketCells();
    this.secondTab = new SingleSocketCells();
    this.topOneTab = new SingleSocketCells();
  }

  public add(subtype: Subtype, cell: Cell | Virus | Food, id: number): void {
    switch (subtype) {
      case 'FIRST_TAB':
        this.firstTab.add(id, cell);
        break;
      
      case 'SECOND_TAB':
        this.secondTab.add(id, cell);
        break;

      case 'TOP_ONE_TAB':
        this.topOneTab.add(id, cell);
        break;
    }
  }

  public remove(subtype: Subtype, id: number): void {
    switch (subtype) {
      case 'FIRST_TAB':
        this.firstTab.remove(id);
        break;

      case 'SECOND_TAB':
        this.secondTab.remove(id);
        break;

      case 'TOP_ONE_TAB':
        this.topOneTab.remove(id);
        break;
    }
  }

  public clear() {
    this.firstTab.clear();
    this.secondTab.clear();
    this.topOneTab.clear();
  }
}