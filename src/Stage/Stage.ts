import * as PIXI from 'pixi.js';
import { Application, Container, filters, utils } from 'pixi.js';
import Globals from '../Globals';
import TextureGenerator from '../Textures/TexturesGenerator';
import World from '../render/World';
import { KawaseBlurFilter } from '@pixi/filter-kawase-blur';
import Master from '../Master';
import { IMapOffsets } from '../tabs/Socket/Socket';
import Hotkeys from '../tabs/Hotkeys';
import GameAPI from '../communication/GameAPI';
import GameSettings from '../Settings/Settings';
import FrontAPI from '../communication/FrontAPI';
import WorldState from '../states/WorldState';
import { createTokens, getColor } from '../utils/helpers';
import PlayerState from '../states/PlayerState';
import GamePerformance from '../GamePerformance';
import { GAME_VERSION } from '../Versions';

class Stage {
  public app: Application;
  public stageFilter: KawaseBlurFilter; // @ts-ignore
  public colorFilter: filters.ColorMatrixFilter;
  public world: World;
  public hue: number;
  public root: Container;
  public mainContainer: Container;
  public foodVirusCellContainer: Container;
  public unblurStage: () => any;
  public blurStage: () => any;
  public showStageTicker: () => void;
  public hideTicker: () => void;
  public hotkeys: Hotkeys;

  constructor() {
    utils.sayHello(GAME_VERSION);
    (window as any).GameAPI = new GameAPI(this);
    (window as any).GameSettings = GameSettings.init(this);

    this.app = new Application({
      resizeTo: window,
      autoDensity: true,
      sharedLoader: true,
      sharedTicker: true,
      resolution: 1,
      backgroundColor: getColor(GameSettings.all.settings.theming.map.backgroundTint),
      antialias: GameSettings.all.settings.game.performance.antialiasing,
      powerPreference: 'high-performance',
      forceCanvas: false
    });

    this.stageFilter = new KawaseBlurFilter(0, 8, false);
    this.colorFilter = new filters.ColorMatrixFilter();

    PIXI.settings.ANISOTROPIC_LEVEL = 16;
    PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.POW2;
    PIXI.settings.ROUND_PIXELS = false;
  }

  public updateRendererBackgroundColor(): void {
    this.app.renderer.backgroundColor = getColor(GameSettings.all.settings.theming.map.backgroundTint);
  }

  async init() {
    document.body.appendChild(this.app.view);
    Globals.init(this.app);

    await TextureGenerator.init();

    this.world = new World(this);
    this.createMainScene();

    window.GameAPI.connectOgar();
    return true;
  }

  public async play(): Promise<string> {
    return new Promise(async (resolve: any, reject: any) => {
      if (PlayerState.first.connected) {

        const tokens = createTokens(
          this.world.controller.firstTabSocket.socketData.token,
          this.world.controller.firstTabSocket.socketData.serverToken
        );

        if (PlayerState.first.playing || PlayerState.first.spawning) {

          this.unblurGameScene(true);
          resolve(tokens);

        } else {

          await this.world.controller.spawnFirstTab().then(() => {
            this.unblurGameScene(true);
            PlayerState.first.focused = true;
            resolve(tokens);
          })
          .catch(() => reject());

        }

      } else {
        reject();
      }
    });
  }

  public async connect(token?: string, serverToken?: boolean): Promise<string> {
    if (WorldState.gameJoined) {
      await this.disconnect();

      this.world.view.center();

      WorldState.gameJoined = false;
    }

    const socketData = await Master.connect(token, serverToken);

    return this.world.controller.init(socketData)
      .then((mapOffsets) => {
        this.join(mapOffsets);
      
        return createTokens(
          this.world.controller.firstTabSocket.socketData.token, 
          this.world.controller.firstTabSocket.socketData.serverToken
        );
      });
  }

  public async disconnect(): Promise<boolean> {
    WorldState.gameJoined = false;

    await this.hideGameScene();

    this.world.controller.disconnectAll();
    this.world.clear();

    return true;
  }

  public join(mapOffsets: IMapOffsets): void {
    WorldState.gameJoined = true;
    this.createGameScene(mapOffsets);
    this.showGameScene();
  }

  public createMainScene(): void {
    this.root = new Container();
    this.mainContainer = new Container();
    this.foodVirusCellContainer = new Container();

    this.root.addChild(this.mainContainer);
    this.app.stage.addChild(this.root);
    this.app.stage.addChild(this.world.minimap);
    this.foodVirusCellContainer.addChild(this.world.food, this.world.cells);
    this.mainContainer.addChild(this.world.map, this.foodVirusCellContainer);

    let frameStart = performance.now(); 

    this.app.ticker.add(() => {
      FrontAPI.setEllapsedFrametime(performance.now() - frameStart);
      frameStart = performance.now();

      GamePerformance.FPSCounter.tick();
      WorldState.ticks++;

      const { x, y, scale } = this.world.view.renderTick();

      this.root.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
      this.mainContainer.pivot.set(x, y);
      this.mainContainer.scale.set(scale);
      this.world.renderer.renderFrame();
    });
    
    this.blurGameScene();
    this.world.map.setPosition(-7071, -7071);
    this.world.view.mouse.zoomValue = 0.25;
  }

  public createGameScene(mapOffsets: IMapOffsets): void {
    this.world.map.setPosition(mapOffsets.minX, mapOffsets.minY);
    this.world.view.center();
    this.world.view.mouse.zoomValue = 0.04085;
    this.world.view.camera.scale = 0.04085;
    this.root.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
    this.foodVirusCellContainer.alpha = 0;
  }

  public blurGameScene() {
    this.world.view.setScrollAvailable(false);

    if (GameSettings.all.settings.game.effects.wtfRgbMode) {
      return;
    }

    Globals.gameBluring = true;

    this.app.ticker.remove(this.unblurStage);
    this.app.ticker.remove(this.blurStage);

    this.app.stage.filters = [this.colorFilter];
    this.hue = 0;

    this.blurStage = () => {
      this.hue += 6 * PIXI.Ticker.shared.deltaTime;
      this.colorFilter.hue(this.hue, false);

      if (this.hue >= 120 * PIXI.Ticker.shared.deltaTime) {
        this.app.ticker.remove(this.blurStage);
        Globals.gameBlured = true;
        Globals.gameBluring = false;

        // remove FPS cap or set it to the cap level
        const { fpsLockType } = GameSettings.all.settings.game.performance;
        this.app.ticker.maxFPS = fpsLockType !== 'Screen-hz' ? Number(fpsLockType) : 0;
      }
    }

    this.app.ticker.add(this.blurStage);
  }

  public unblurGameScene(enableScroll: boolean) {
    this.world.view.setScrollAvailable(enableScroll);

    if (GameSettings.all.settings.game.effects.wtfRgbMode) {
      return;
    }

    this.app.ticker.remove(this.unblurStage);
    this.app.ticker.remove(this.blurStage);

    this.unblurStage = () => {
      this.hue -= 6 * PIXI.Ticker.shared.deltaTime;
      this.colorFilter.hue(this.hue, false);

      if (this.hue <= 0) {
        this.app.ticker.remove(this.unblurStage);
        this.app.stage.filters = [];

        this.hue = 0;

        Globals.gameBlured = false;
        Globals.gameBluring = false;

        // remove FPS cap or set it to the cap level
        const { fpsLockType } = GameSettings.all.settings.game.performance;
        this.app.ticker.maxFPS = fpsLockType !== 'Screen-hz' ? Number(fpsLockType) : 0;
      }
    }

    this.app.ticker.add(this.unblurStage);
  }

  public showGameScene() {
    this.foodVirusCellContainer.alpha = 0;

    this.showStageTicker = () => {
      if (this.foodVirusCellContainer.alpha >= 1) {
        this.app.ticker.remove(this.showStageTicker);
        this.foodVirusCellContainer.filters = [];
        this.foodVirusCellContainer.alpha = 1;

        // remove FPS cap or set it to the cap level
        const { fpsLockType } = GameSettings.all.settings.game.performance;
        this.app.ticker.maxFPS = fpsLockType !== 'Screen-hz' ? Number(fpsLockType) : 0;
        return;
      }

      this.foodVirusCellContainer.alpha += 0.033 * PIXI.Ticker.shared.deltaTime;
    }

    this.app.ticker.add(this.showStageTicker);
  }

  public hideGameScene() {
    return new Promise((resolve: any) => {
      if (!this.root) {
        resolve();
        return;
      }

      this.hideTicker = () => {
        this.foodVirusCellContainer.alpha -= 0.03 * PIXI.Ticker.shared.deltaTime;

        if (this.foodVirusCellContainer.alpha <= 0) {
          this.app.ticker.remove(this.hideTicker);
          resolve();
        }
      }

      this.app.ticker.add(this.hideTicker);
    });
  }
}

export default Stage;