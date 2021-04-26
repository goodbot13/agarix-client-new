import Stage from "../Stage/Stage";
import Logger from "../utils/Logger";
import UICommunicationService from "./FrontAPI";
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
    this.logger.info(`Game mode changed to [name: ${Master.regions.getCurrent()}, index: ${index}]`);
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

      this.logger.info('Ogar/Delta server disconnected');
    }
  }

  public setTag(): void {
    Ogar.firstTab.player.tag = GameSettings.all.profiles.tag;
    Ogar.firstTab.emitter.sendPlayerTag();

    /* this.logger.info(`Tag changed: [${GameSettings.all.profiles.tag === '' ? 'no-tag' : GameSettings.all.profiles.tag}]`); */
  }

  public setFirstTabNick(): void {
    Ogar.firstTab.player.nick = GameSettings.all.profiles.leftProfileNick;
    Ogar.firstTab.emitter.sendPlayerNick();
    
    /* this.logger.info(`First tab nick changed: [${GameSettings.all.profiles.leftProfileNick}]`); */
  }

  public setFirstTabSkin(): void {
    const { leftProfileSkinUrl } = GameSettings.all.profiles;
    
    Ogar.firstTab.player.skin = leftProfileSkinUrl;
    Ogar.firstTab.emitter.sendPlayerSkin();

    SkinsLoader.load(leftProfileSkinUrl);

    /* this.logger.info(`First tab skin changed: [${leftProfileSkinUrl}]`); */
  }

  public setSecondTabNick(): void {
    const { rightProfileNick } = GameSettings.all.profiles;
    
    Ogar.secondTab.player.nick = rightProfileNick;
    Ogar.secondTab.emitter.sendPlayerNick();

    /* this.logger.info(`Second tab nick changed: [${rightProfileNick}]`); */
  }

  public setSecondTabSkin(): void {
    const { rightProfileSkinUrl } = GameSettings.all.profiles;

    Ogar.secondTab.player.skin = rightProfileSkinUrl;
    Ogar.secondTab.emitter.sendPlayerSkin();

    SkinsLoader.load(rightProfileSkinUrl);

    this.logger.info(`Second tab skin changed: [${rightProfileSkinUrl}]`);
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
    
    this.logger.info('Spectate mode changed to TOP 1');
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
    this.logger.info('Spectate mode changed to CENTER');
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

    this.logger.info('Spectate mode changed to TARGET');
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

    this.logger.info('Spectate mode changed to FREE');
  }





  /*************** Socket controller ***************/

  // used to reconnect frist tab
  public setFirstTabEnabled(enabled: boolean): void {
    if (enabled) {
      this.stage.world.controller.connectFirstPlayerTab().then((mapOffsets) => {
        
      });
    } else {
      this.stage.world.controller.disconnectFirstTab();
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
    FacebookLogin.checkSdkLoaded();
    FacebookLogin.prepareToken(this.stage.world.controller);
  }

  public logOutWithFb(): void {
    FacebookLogin.logOut();
  }

  public logInWithGoogle(): void {
    GoogleLogin.checkSdkLoaded();
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

      init(): void
    }
  }
}