import Stage from "../Stage/Stage";
import Logger from "../utils/Logger";
import { TGameMode } from '../Master/GameMode';
import GameSettings from '../Settings/Settings';
import WorldState from "../states/WorldState";
import FacebookLogin from "../tabs/Login/FacebookLogin";
import GoogleLogin from "../tabs/Login/GoogleLogin";
import Master from "../Master";
import SkinsLoader from "../utils/SkinsLoader";
import Ogar from "../Ogar";

export default class GameAPI {

  private logger: Logger;

  constructor(private stage: Stage) {
    this.logger = new Logger('GameAPI');
  }





  /*************** Master ***************/

  public setMode(mode: TGameMode): void {
    Master.gameMode.set(mode);
    this.logger.info(`Game mode changed to [${mode}]`);
  }

  public setRegion(index: number): void {
    Master.regions.setCurrent(index);
    this.logger.info(`Game region changed to [name: ${Master.regions.getCurrent()}, index: ${index}]`);
  }





  /*************** Ogar ***************/

  public async connectOgar(): Promise<boolean> {
    await Ogar.firstTab.connect();
    await Ogar.secondTab.connect();
    
    if (!Ogar.connected) {
      Ogar.connected = true;

      Ogar.firstTab.player.nick = GameSettings.all.profiles.leftProfileNick;
      Ogar.firstTab.player.skin = GameSettings.all.profiles.leftProfileSkinUrl;
      
      Ogar.secondTab.player.nick = GameSettings.all.profiles.rightProfileNick;
      Ogar.secondTab.player.skin = GameSettings.all.profiles.rightProfileSkinUrl;
    
      if (WorldState.gameJoined) {
        Ogar.firstTab.join(
          this.stage.world.controller.socketData.https.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1],
          this.stage.world.controller.socketData.token
        );

        Ogar.secondTab.join(
          this.stage.world.controller.socketData.https.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1],
          this.stage.world.controller.socketData.token
        );
      }
      
      return true;
    }
  }

  public disconnectOgar(): void {
    if (Ogar.connected) {
      Ogar.firstTab.disconnect();
      Ogar.secondTab.disconnect();
      Ogar.connected = false;
    }
  }

  public setTag(): void {
    Ogar.firstTab.player.tag = GameSettings.all.profiles.tag;
    Ogar.firstTab.emitter.sendPlayerTag();
  }

  public setFirstTabNick(): void {
    Ogar.firstTab.player.nick = GameSettings.all.profiles.leftProfileNick;
    Ogar.firstTab.emitter.sendPlayerNick();
  }

  public setFirstTabSkin(): void {
    const { leftProfileSkinUrl } = GameSettings.all.profiles;
    
    Ogar.firstTab.player.skin = leftProfileSkinUrl;
    Ogar.firstTab.emitter.sendPlayerSkin();

    SkinsLoader.load(leftProfileSkinUrl);
  }

  public setSecondTabNick(): void {
    const { rightProfileNick } = GameSettings.all.profiles;
    
    Ogar.secondTab.player.nick = rightProfileNick;
    Ogar.secondTab.emitter.sendPlayerNick();
  }

  public setSecondTabSkin(): void {
    const { rightProfileSkinUrl } = GameSettings.all.profiles;

    Ogar.secondTab.player.skin = rightProfileSkinUrl;
    Ogar.secondTab.emitter.sendPlayerSkin();

    SkinsLoader.load(rightProfileSkinUrl);
  }

  public sendMessage(message: string): void {
    Ogar.firstTab.sendChat(message);
  }





  /*************** View ***************/
  
  public spectateTopOne(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    WorldState.spectator.free && this.stage.world.controller.stopFreeSpectate();

    const { spectatorMode } = GameSettings.all.settings.game.gameplay;
    const gameMode = Master.gameMode.get();

    if (!this.stage.world.controller.topOneViewEnabled) {
      this.stage.world.controller.connectTopOneTab().then(() => {
        this.stage.world.view.spectateTopOne(false);
      });
    } else {
      this.stage.world.view.spectateTopOne(false);
    }
  }

  public spectateCenter(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    if (WorldState.spectator.topOne && WorldState.spectator.topOneWithFirst) {
      this.stage.world.controller.firstTabSocket.emitter.sendSpectate();
    }

    if (WorldState.spectator.free) {
      this.stage.world.controller.stopFreeSpectate();
    }

    this.stage.world.view.center();
  }

  public spectateTarget(): void {
    return;

    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    if (WorldState.spectator.topOne && WorldState.spectator.topOneWithFirst) {
      this.stage.world.controller.firstTabSocket.emitter.sendSpectate();
    }

    if (WorldState.spectator.free) {
      this.stage.world.controller.stopFreeSpectate();
    }
  }

  public spectateFree(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    if (WorldState.spectator.topOne && WorldState.spectator.topOneWithFirst) {
      this.stage.world.controller.firstTabSocket.emitter.sendSpectate();
    }

    if (!WorldState.spectator.free) {
      this.stage.world.controller.spectateFree();
    }

    this.stage.world.view.freeSpectate();
  }





  /*************** Socket controller ***************/

  public reconnectFirstTab(): void {
    this.stage.world.controller.disconnectFirstTab();
    setTimeout(() => this.stage.world.controller.connectFirstPlayerTab(), 200);
  }

  public reconnectSecondTab(): void {
    this.stage.world.controller.disconnectSecondTab();
    setTimeout(() => this.stage.world.controller.connectSecondPlayerTab(), 200);
  }

  public reconnectSpectator(): void {
    const { spectatorMode } = GameSettings.all.settings.game.gameplay;

    if (spectatorMode === 'Disabled') {
      return;
    }

    if (spectatorMode === 'Top one') {
      this.stage.world.controller.disconnectTopOneTab();
      setTimeout(() => this.stage.world.controller.connectTopOneTab(), 200);
    }

    if (spectatorMode === 'Full map') {
      this.stage.world.controller.disconnectFullMapView();
      setTimeout(() => this.stage.world.controller.enableFullMapView(), 200);
    }
  }

  public fullMapViewAbort(): void {
    setTimeout(() => this.setFullMapView(false), 333);
  }

  public setFullMapView(enabled: boolean): void {
    if (enabled) {
      this.stage.world.controller.enableFullMapView();
    } else {
      this.stage.world.controller.disconnectFullMapView();

      if (GameSettings.all.settings.game.minimap.realPlayersCells && GameSettings.all.settings.game.gameplay.spectatorMode !== 'Top one') {
        this.stage.world.minimap.reset();
      }
    }
  }

  public setTopOneView(enabled: boolean): void {
    if (enabled) {
      this.stage.world.controller.disconnectFullMapView();
      this.stage.world.controller.connectTopOneTab();
    } else {
      this.stage.world.controller.disconnectTopOneTab();
      this.stage.world.minimap.reset();
    }
  }

  public setMultiboxEnabled(enabled: boolean) {
    if (enabled) {
      this.stage.world.controller.connectSecondPlayerTab();
      this.logger.info('Multibox mode enabled');
    } else {
      this.stage.world.controller.disconnectSecondTab();
      this.logger.info('Multibox mode disabled');
    }
  }
  




  /*************** Main ***************/

  public play(): Promise<string> {
    return this.stage.play();
  }

  public join(token?: string, serverToken?: boolean): Promise<string> {
    return this.stage.connect(token, serverToken);
  }

  public setSceneBlurred(blurred: boolean, zoom?: boolean) {
    if (blurred) {
      this.stage.blurGameScene();
    } else {
      this.stage.unblurGameScene(zoom);
    }
  }

  




  /*************** Login ***************/
  public logInWithFb(): void {
    FacebookLogin.prepareToken(this.stage.world.controller);
  }

  public logOutWithFb(): void {
    FacebookLogin.logOut();
  }

  public logInWithGoogle(): void {
    GoogleLogin.prepareToken(this.stage.world.controller);
  }

  public logOutWithGoogle(): void {
    GoogleLogin.logOut();
  }
}

declare global {
  interface Window {
    GameAPI: {
      setSceneBlurred(blurred: boolean, zoom?: boolean): void,
      join(token?: string): Promise<string>,
      play(): Promise<string>,
      setMultiboxEnabled(enabled: boolean): void,
      setTopOneView(enabled: boolean, reset?: boolean): void,
      setFullMapView(enabled: boolean): void,
      fullMapViewAbort(): void,
      spectateFree(): void,
      spectateTarget(): void,
      spectateCenter(): void,
      spectateTopOne(): void,
      sendMessage(message: string): void,
      setSecondTabSkin(): void,
      setSecondTabNick(): void,
      setFirstTabSkin(): void,
      setFirstTabNick(): void,
      setTag(): void,
      disconnectOgar(): void,
      connectOgar(): Promise<boolean>,
      setRegion(index: number): void,
      setMode(mode: TGameMode): void,
      logInWithFb(): void,
      logOutWithFb(): void,
      logInWithGoogle(): void,
      logOutWithGoogle(): void,

      reconnectFirstTab(): void,
      reconnectSecondTab(): void,
      reconnectSpectator(): void,

      init(): void
    }
  }
}