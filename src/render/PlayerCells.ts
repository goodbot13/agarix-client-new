import Cell from "../objects/Cell/index";
import { RGB, Subtype } from "../objects/types";
import SkinsLoader from "../utils/SkinsLoader";
import GameSettings from "../Settings/Settings";
import Ogar from "../Ogar";

export default class PlayerCells {
  public firstTab: Map<number, Cell>;
  public secondTab: Map<number, Cell>;
  public firstTabIds: Set<number>;
  public secondTabIds: Set<number>;

  constructor() {
    this.firstTab = new Map();
    this.secondTab = new Map();
    this.firstTabIds = new Set();
    this.secondTabIds = new Set();
  }

  public addFirstTabId(id: number): void {
    this.firstTabIds.add(id);
  }

  public addSecondTabId(id: number): void {
    this.secondTabIds.add(id);
  }

  public addFirstTabCell(id: number, cell: Cell): void {
    this.firstTab.set(id, cell);

    cell.setPlayerCell(
      GameSettings.all.profiles.leftProfileNick, 
      GameSettings.all.profiles.leftProfileSkinUrl
    );

    Ogar.firstTab.player.color.cell = cell.colorHex[1];
  }

  public addSecondTabCell(id: number, cell: Cell): void {
    this.secondTab.set(id, cell);

    cell.setPlayerCell(
      GameSettings.all.profiles.rightProfileNick, 
      GameSettings.all.profiles.rightProfileSkinUrl
    );
    
    Ogar.secondTab.player.color.cell = cell.colorHex[1];
  }

  public remove(subtype: Subtype, id: number): void {
    if (subtype === 'FIRST_TAB') {
      this.firstTab.delete(id);
      this.firstTabIds.delete(id);
    } else if (subtype === 'SECOND_TAB') {
      this.secondTab.delete(id);
      this.secondTabIds.delete(id);
    }
  }

  public clear(): void {
    this.firstTab.clear();
    this.secondTab.clear();
    this.secondTabIds.clear();
    this.firstTabIds.clear();
  }

  public isFirstTab(cell: Cell): boolean {
    const firstEntry: Cell = this.firstTab.values().next().value;

    if (firstEntry) {
      return this.compare(firstEntry.nick, firstEntry.color, cell.nick, cell.color);
    }

    return false;
  }

  public isSecondTab(cell: Cell): boolean {
    const firstEntry: Cell = this.secondTab.values().next().value;

    if (firstEntry) {
      return this.compare(firstEntry.nick, firstEntry.color, cell.nick, cell.color);
    }

    return false;
  }

  private compare(nick: string, color: RGB, nick2: string, color2: RGB): boolean {
    const sameNick = nick === nick2;
    const sameColor = color.blue === color2.blue && color.green === color2.green && color.blue === color2.blue;

    return sameNick && sameColor;
  }
}