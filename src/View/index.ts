import Subview from "./Subview";
import { IViewport } from "../tabs/Socket/Socket";
import GameSettings from "../Settings/Settings";
import SocketCells from "../render/SocketCells";
import PlayerCells from "../render/PlayerCells";
import PlayerState from "../states/PlayerState";
import WorldState from "../states/WorldState";
import Ogar from "../Ogar";
import * as PIXI from 'pixi.js';

class View {
  public mouse: View.IWindowMouse = { x: 0,  y: 0, zoomValue: 0.0375};
  public camera: View.ICamera = { x: 0, y: 0, scale: 0.02281 };
  public firstTab: Subview;
  public secondTab: Subview;
  public topOneTab: Subview;

  private scrollAvailable: boolean = false;
  private globalWindowBounds: View.IGlobaWindowBounds = { width: 0, height: 0, scale: 0 }

  constructor(data: View.ITabs, private canvas: HTMLCanvasElement) {
    this.firstTab = new Subview(data.socketCells.firstTab.data, data.playerCells.firstTab);
    this.secondTab = new Subview(data.socketCells.secondTab.data, data.playerCells.secondTab);
    this.topOneTab = new Subview(data.socketCells.topOneTab.data);

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('wheel', (e: MouseWheelEvent) => {
      if (!this.scrollAvailable) {
        return;
      }

      this.mouse.zoomValue *= Math.pow((0.8 + (GameSettings.all.settings.game.gameplay.zoomSpeed / 100)), (e.deltaY / 140 || e.detail || 0))

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

  private calcScale(): void {
    const zoom = Math.max(this.canvas.width / 1080, this.canvas.height / 1920) * this.mouse.zoomValue;
    this.camera.scale = (9 * this.camera.scale + zoom) / 10;
  }

  private calcCam(valueX: number, valueY: number, isPlaying?: boolean): void {
    if (isPlaying && GameSettings.all.settings.game.gameplay.cameraStyle === 'Default') {
      this.camera.x = (this.camera.x + valueX) / 2;
      this.camera.y = (this.camera.y + valueY) / 2;
    } else {
      const speed = GameSettings.all.settings.game.gameplay.cameraSpeed * 6 * PIXI.Ticker.shared.deltaTime;

      this.camera.x = ((speed - 1) * this.camera.x + valueX) / speed;
      this.camera.y = ((speed - 1) * this.camera.y + valueY) / speed;
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
    if (!Ogar.connected) {
      return;
    }

    Ogar.firstTab.updatePosition(
      this.firstTab.viewport.x - (this.firstTab.mapOffsets.minX + 7071),
      this.firstTab.viewport.y - (this.firstTab.mapOffsets.minY + 7071),
      this.firstTab.playerBox.mass
    );
    
    Ogar.secondTab.updatePosition(
      this.secondTab.viewport.x - (this.secondTab.mapOffsets.minX + 7071),
      this.secondTab.viewport.y - (this.secondTab.mapOffsets.minY + 7071),
      this.secondTab.playerBox.mass
    );
  }

  public center(): void {
    WorldState.spectator.free = false;
    WorldState.spectator.topOne = false;
    WorldState.spectator.center = true;
    WorldState.spectator.topOneWithFirst = false;
  }

  public spectateTopOne(firstTab: boolean): void {
    WorldState.spectator.free = false;
    WorldState.spectator.center = false;
    WorldState.spectator.topOne = true;
    WorldState.spectator.topOneWithFirst = firstTab;
  }

  public freeSpectate(): void {
    WorldState.spectator.center = false;
    WorldState.spectator.topOne = false;
    WorldState.spectator.free = true;
    WorldState.spectator.topOneWithFirst = false;
  }

  private updateCamera(): void {
    const { firstTab, secondTab, topOneTab } = this;

    const notPlaying = !PlayerState.first.playing && !PlayerState.second.playing;

    // veis is centered and player is not playing
    if (WorldState.spectator.center && notPlaying) {

      const x = (WorldState.mapOffsets.minX + WorldState.mapOffsets.maxX) / 2;
      const y = (WorldState.mapOffsets.minY + WorldState.mapOffsets.maxY) / 2;
      this.calcCam(x, y);

    } else if (WorldState.spectator.topOne && !WorldState.spectator.topOneWithFirst && notPlaying) {

      // spectating top one with top one tab
      const { x, y } = topOneTab.getShiftedViewport();
      this.calcCam(x, y, false);
        
    } else {

      const isSpectating = WorldState.spectator.free || (WorldState.spectator.topOne && WorldState.spectator.topOneWithFirst);

      // spectating top one with first player tab.
      // used when gameMode !== :party or when spectateType === 'Disabled'
      if (isSpectating && notPlaying) {
        const { x, y } = firstTab.getShiftedViewport();
        this.calcCam(x, y);
      } else {

        // game is not centered, check if playing 
        if (PlayerState.first.playing || PlayerState.second.playing) {

          // user is playing, check if multibox
          if (GameSettings.all.settings.game.multibox.enabled) {

            // calc centered cam between the tabs and correct cursor position
            if (PlayerState.first.playing && PlayerState.second.playing) {
              const { x, y } = secondTab.getShiftedViewport();
              const ftv = firstTab.getShiftedViewport();

              this.calcCam((ftv.x + x) / 2, (ftv.y + y) / 2, true);

              firstTab.cursor.x -= (ftv.x - x) / 2;
              firstTab.cursor.y -= (ftv.y - y) / 2;
              secondTab.cursor.x -= (secondTab.viewport.x - ftv.x + secondTab.mapOffsetsShift.x) / 2;
              secondTab.cursor.y -= (secondTab.viewport.y - ftv.y + secondTab.mapOffsetsShift.y) / 2;
            } else {

              // only first tab is playing
              if (PlayerState.first.playing) {
                const { x, y } = firstTab.getShiftedViewport();
                this.calcCam(x, y, true);
              }

              // only second tab is playing
              if (PlayerState.second.playing) {
                const { x, y } = secondTab.getShiftedViewport();
                this.calcCam(x, y, true);
              }
            }
          } else {

            // multibox disabled so calc cam of the first tab
            const { x, y } = firstTab.getShiftedViewport();
            this.calcCam(x, y, true);
          }
        }
      }
    }
  }

  public renderTick(): View.ICamera {
    this.calcScale();
    this.updateFirstTab();
    this.updateSecondTab();
    this.updateCamera();
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