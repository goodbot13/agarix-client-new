import Subview from "./Subview";
import { IViewport } from "../tabs/Socket/Socket";
import GameSettings from "../Settings/Settings";
import SocketCells from "../render/SocketCells";
import PlayerCells from "../render/PlayerCells";
import Ogar from "../Ogar";

class View {
  public mouse: View.IWindowMouse = { x: 0,  y: 0, zoomValue: 0.0375};
  public camera: View.ICamera = { x: 0, y: 0, scale: 0.02281 };
  public firstTab: Subview;
  public secondTab: Subview;
  public topOneTab: Subview;
  public centered: boolean = false;
  public topOneSpectating: boolean = false;
  public freeSpectating: boolean = false;

  private scrollAvailable: boolean = false;
  private globalWindowBounds: View.IGlobaWindowBounds = { width: 0, height: 0, scale: 0 }

  constructor(data: View.ITabs, private canvas: HTMLCanvasElement, private ogar: Ogar) {
    this.firstTab = new Subview(data.socketCells.firstTab.data, data.playerCells.firstTab);
    this.secondTab = new Subview(data.socketCells.secondTab.data, data.playerCells.secondTab);
    this.topOneTab = new Subview(data.socketCells.topOneTab.data);

    this.canvas = canvas;
    this.ogar = ogar;

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('wheel', (e: MouseWheelEvent) => {
      if (!this.scrollAvailable) {
        return;
      }

      this.mouse.zoomValue *= Math.pow((0.835 + (GameSettings.all.settings.game.gameplay.zoomSpeed / 100)), (e.deltaY / 140 || e.detail || 0))

      if (this.mouse.zoomValue <= 0.0228) {
        this.mouse.zoomValue = 0.02281;
      }

      if (this.mouse.zoomValue >= 0.5) {
        this.mouse.zoomValue = 0.499;
      }
    });
  }
  
  public shouldObjectBeCulled(objX: number, objY: number, size: number): boolean  {
    let { width, height } = this.globalWindowBounds;
    const { x, y } = this.camera;

    const hasX = (x - width < objX + size) && (x + width > objX - size);
    const hasY = (y - height < objY + size) && (y + height > objY - size)

    return !hasX || !hasY;
  }

  public setScrollAvailable(value: boolean): void {
    this.scrollAvailable = value;
  }

  public center(): void {
    this.freeSpectating = false;
    this.topOneSpectating = false;
    this.centered = true;
  }

  public spectateTopOne(): void {
    this.freeSpectating = false;
    this.centered = false;
    this.topOneSpectating = true;
  }

  public freeSpectate(): void {
    this.centered = false;
    this.topOneSpectating = false;
    this.freeSpectating = true;
  }


  private calcScale(): void {
    const zoom = Math.max(this.canvas.width / 1080, this.canvas.height / 1920) * this.mouse.zoomValue;
    this.camera.scale = (9 * this.camera.scale + zoom) / 10;
  }

  private calcCam(valueX: number, valueY: number, isPlaying?: boolean): void {
    if (isPlaying) {
      this.camera.x = (this.camera.x + valueX) / 2;
      this.camera.y = (this.camera.y + valueY) / 2;
    } else {
      this.camera.x = ((29 * this.camera.x + valueX) / 30);
      this.camera.y = ((29 * this.camera.y + valueY) / 30);
    }

    this.globalWindowBounds.width = this.canvas.width / 2 / this.camera.scale;
    this.globalWindowBounds.height = this.canvas.height / 2 / this.camera.scale;
  }

  private calcCursorPosition(viewport: IViewport): View.ITabCursor {
    const x = (this.mouse.x - this.canvas.width / 2) / this.camera.scale + viewport.x;
    const y = (this.mouse.y - this.canvas.height / 2) / this.camera.scale + viewport.y;
    return { x, y };
  }

  private updateFirstTab(): void {
    this.firstTab.calcPlayingStats();
    this.firstTab.cursor = this.calcCursorPosition(this.firstTab.viewport);
  }

  private updateSecondTab(): void {
    this.secondTab.calcPlayingStats();
    this.secondTab.cursor = this.calcCursorPosition(this.secondTab.viewport);
  }

  private updateOgar() {
    if (!this.ogar.connected) {
      return;
    }

    this.ogar.firstTab.updatePosition(
      this.firstTab.viewport.x - (this.firstTab.mapOffsets.minX + 7071),
      this.firstTab.viewport.y - (this.firstTab.mapOffsets.minY + 7071),
      this.firstTab.playerBox.mass
    );
    
    this.ogar.secondTab.updatePosition(
      this.secondTab.viewport.x - (this.secondTab.mapOffsets.minX + 7071),
      this.secondTab.viewport.y - (this.secondTab.mapOffsets.minY + 7071),
      this.secondTab.playerBox.mass
    );
  }

  private updateCamera(): void {
    if (this.centered && !this.firstTab.isPlaying && !this.secondTab.isPlaying) {

      const x = (this.firstTab.mapOffsets.minX + this.firstTab.mapOffsets.maxX) / 2;
      const y = (this.firstTab.mapOffsets.minY + this.firstTab.mapOffsets.maxY) / 2;

      this.calcCam(x, y);

    } else {

      const isSpectating = this.freeSpectating || this.topOneSpectating;
      const isPlaying = this.firstTab.isPlaying || this.secondTab.isPlaying;

      if (isSpectating && !isPlaying) {
        this.calcCam(this.firstTab.viewport.x, this.firstTab.viewport.y);
      } else {

        // game is not centered, check if playing 
        if (this.firstTab.isPlaying || this.secondTab.isPlaying) {

          // user is playing, check if multibox
          if (GameSettings.all.settings.game.multibox.enabled) {

            // calc centered cam between the tabs and correct cursor position
            if (this.firstTab.isPlaying && this.secondTab.isPlaying) {
              const { x, y } = this.secondTab.getShiftedViewport();

              this.calcCam((this.firstTab.viewport.x + x) / 2, (this.firstTab.viewport.y + y) / 2, true);

              this.firstTab.cursor.x -= (this.firstTab.viewport.x - x) / 2;
              this.firstTab.cursor.y -= (this.firstTab.viewport.y - y) / 2;
              this.secondTab.cursor.x -= (this.secondTab.viewport.x - this.firstTab.viewport.x + this.secondTab.mapOffsetsShift.x) / 2;
              this.secondTab.cursor.y -= (this.secondTab.viewport.y - this.firstTab.viewport.y + this.secondTab.mapOffsetsShift.y) / 2;
            } else {

              // only first tab is playing
              if (this.firstTab.isPlaying) {
                this.calcCam(this.firstTab.viewport.x, this.firstTab.viewport.y, true);
              }

              // only second tab is playing
              if (this.secondTab.isPlaying) {
                const { x, y } = this.secondTab.getShiftedViewport();
                this.calcCam(x, y, true);
              }
            }
          } else {

            // multibox disabled so calc cam of the first tab
            this.calcCam(this.firstTab.viewport.x, this.firstTab.viewport.y, true);
          }
        }
      }
    }
  }

  public renderTick(): View.ICamera {
    this.calcScale();
    this.updateCamera();
    this.updateFirstTab();
    this.updateSecondTab();
    this.updateOgar();

    return this.camera;
  }
}

export default View;

export namespace View {
  export interface IWindowMouse {
    x: number,
    y: number,
    zoomValue: number,
  }

  export interface ICamera {
    x: number,
    y: number, 
    scale: number
  }
  
  export interface ITabCursor {
    x: number,
    y: number
  }

  export interface IPlayerBox {
    width: number,
    height: number,
    mass: number
  }

  export interface IBounds {
    left: number,
    right: number,
    top: number,
    bottom: number,
    width: number,
    height: number
  }

  export interface ITabs {
    socketCells: SocketCells,
    playerCells?: PlayerCells
  }

  export interface IGlobaWindowBounds {
    width: number,
    height: number,
    scale: number
  }
}