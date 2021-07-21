import { IMapOffsets } from "../tabs/Socket/Socket"

export default new class WorldState {
  public gameJoined: boolean = false;
  public ticks: number = 0;

  public mapOffsets: IMapOffsets = { 
    minX: 0, 
    minY: 0, 
    maxX: 0, 
    maxY: 0,
    width: 0,
    height: 0
  }

  public spectator: ISpectator = {
    topOne: false,
    topOneWithFirst: false,
    free: false,
    center: false,
  }
}

interface ISpectator {
  topOne: boolean,
  topOneWithFirst: boolean,
  free: boolean,
  center: boolean,
}