import Cell from "../objects/Cell/index";
import { IViewport, IMapOffsets, IMapOffsetsShift } from "../tabs/Socket/Socket";
import { View } from ".";
import Virus from "../objects/Virus/Virus";
import Food from "../objects/Food";

class Subview {
  public isPlaying: boolean = false;
  public playerCells: Map<number, Cell>;
  public socketCells: Map<number, Cell | Virus | Food>;
  public viewport: IViewport = { x: 0, y: 0, scale: 0 };
  public cursor: View.ITabCursor = { x: 0, y: 0 };
  public playerBox: View.IPlayerBox = { width: 0, height: 0, mass: 0 };
  public bounds: View.IBounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  public mapOffsets: IMapOffsets = { minX: 0, minY: 0, maxY: 0, maxX: 0 };
  public mapOffsetsShift: IMapOffsetsShift = { x: 0, y: 0 };

  constructor(socketCells?: Map<number, Cell | Virus | Food>, playerCells?: Map<number, Cell>) {
    this.socketCells = socketCells;
    this.playerCells = playerCells;
  }

  public setMapOffsets(mapOffsets: IMapOffsets, mapOffsetsShift?: IMapOffsetsShift): void {
    this.mapOffsets = mapOffsets;
    
    if (mapOffsetsShift) {
      this.mapOffsetsShift = mapOffsetsShift;
    }
  } 

  public calcBounds(): void {
    const cells = [...this.socketCells.values()];

    if (!cells.length) {
      this.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
      return;
    }

    const posX = cells.slice().sort((cellA, cellB) => cellA.x - cellB.x);
    const posY = cells.slice().sort((cellA, cellB) => cellA.y - cellB.y);

    this.bounds.left = posX[0].x;
    this.bounds.right = posX[posX.length - 1].x;
    this.bounds.top = posY[0].y;
    this.bounds.bottom = posY[posY.length - 1].y;
    this.bounds.width = Math.abs(this.bounds.right - this.bounds.left);
    this.bounds.height = Math.abs(this.bounds.bottom - this.bounds.top);
  }

  public hasInViewBounds(x: number, y: number, size?: number): boolean {
    const { left, right, top, bottom } = this.bounds;

    if (left === 0 && right === 0 && top === 0 && bottom === 0) {
      return false;
    }

    size = size ? size : 0;

    const matchX = x + size >= left && x - size <= right;
    const matchY = y + size >= top && y - size <= bottom;

    return matchX && matchY;
	}
  
  public viewportUpdate(viewport: IViewport): void {
    this.viewport = viewport;
  }

  public getShiftedViewport(): IViewport {
    return {
      x: this.viewport.x + this.mapOffsetsShift.x,
      y: this.viewport.y + this.mapOffsetsShift.y,
      scale: this.viewport.scale
    }
  }

  calcPlayingStats() {
    if (this.playerCells.size) {
      this.viewport.x = 0;
      this.viewport.y = 0;

      let targetSize: number = 0;
      let size: number = 0;

      this.playerCells.forEach((cell) => {
        size += cell.originalSize;
        targetSize += cell.newOriginalSize * cell.newOriginalSize;
        this.viewport.x += (cell.x - this.mapOffsetsShift.x) / this.playerCells.size;
        this.viewport.y += (cell.y - this.mapOffsetsShift.y) / this.playerCells.size;
      });

      this.viewport.scale = Math.pow(Math.min(64 / size, 1), 0.4000);
      this.playerBox.mass = ~~(targetSize / 100); 
    }
  }
}

export default Subview;