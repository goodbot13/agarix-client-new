import Stage from "../Stage/Stage";
import Logger from "../utils/Logger";
import { TGameMode } from '../Master/GameMode';
import WorldState from "../states/WorldState";
import FacebookLogin from "../tabs/Login/FacebookLogin";
import GoogleLogin from "../tabs/Login/GoogleLogin";
import { wsToToken } from "../utils/helpers";

export default class GameAPI {

  private logger: Logger;

  constructor(private stage: Stage) {
    this.logger = new Logger('GameAPI');
  }





  /*************** Master ***************/

  public setMode(mode: TGameMode): void {
    this.stage.master.gameMode.set(mode);
    this.logger.info(`Game mode changed to [${mode}]`);
  }

  public setRegion(index: number): void {
    this.stage.master.regions.setCurrent(index);
    this.logger.info(`Game region changed to [name: ${this.stage.master.regions.getCurrent()}, index: ${index}]`);
  }





  /*************** Ogar ***************/

  public async connectOgar(): Promise<boolean> {
    await this.stage.ogar.firstTab.connect();
    await this.stage.ogar.secondTab.connect();
    
    if (!this.stage.ogar.connected) {
      this.stage.ogar.connected = true;

      this.stage.ogar.firstTab.player.nick = this.stage.settings.all.profiles.leftProfileNick;
      this.stage.ogar.firstTab.player.skin = this.stage.settings.all.profiles.leftProfileSkinUrl;
      
      this.stage.ogar.secondTab.player.nick = this.stage.settings.all.profiles.rightProfileNick;
      this.stage.ogar.secondTab.player.skin = this.stage.settings.all.profiles.rightProfileSkinUrl;
    
      let token = '';

      if (this.stage.world.master.gameMode.get() === ':private') {
        token = wsToToken(this.stage.world.controller.socketData.address);
      } else {
        token = this.stage.world.controller.socketData.https.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1];
      }

      if (WorldState.gameJoined) {
        this.stage.ogar.firstTab.join(token);

        this.stage.ogar.secondTab.join(token);
      }
      
      return true;
    }
  }

  public disconnectOgar(): void {
    if (this.stage.ogar.connected) {
      this.stage.ogar.firstTab.disconnect();
      this.stage.ogar.secondTab.disconnect();
      this.stage.ogar.connected = false;
    }
  }

  public setTag(): void {
    this.stage.ogar.firstTab.player.tag = this.stage.settings.all.profiles.tag;
    this.stage.ogar.firstTab.emitter.sendPlayerTag();

    if (this.stage.ogar.secondTab) {
      this.stage.ogar.secondTab.player.tag = this.stage.settings.all.profiles.tag;
      this.stage.ogar.secondTab.emitter.sendPlayerTag();
    }
  }

  public setFirstTabNick(): void {
    this.stage.ogar.firstTab.player.nick = this.stage.settings.all.profiles.leftProfileNick;
    this.stage.ogar.firstTab.emitter.sendPlayerNick();
  }

  public setFirstTabSkin(): void {
    const { leftProfileSkinUrl } = this.stage.settings.all.profiles;
    
    this.stage.ogar.firstTab.player.skin = leftProfileSkinUrl;
    this.stage.ogar.firstTab.emitter.sendPlayerSkin();

    this.stage.world.skinsLoader.getCustomSkin(leftProfileSkinUrl, () => {});
  }

  public setSecondTabNick(): void {
    const { rightProfileNick } = this.stage.settings.all.profiles;
    
    this.stage.ogar.secondTab.player.nick = rightProfileNick;
    this.stage.ogar.secondTab.emitter.sendPlayerNick();
  }

  public setSecondTabSkin(): void {
    const { rightProfileSkinUrl } = this.stage.settings.all.profiles;

    this.stage.ogar.secondTab.player.skin = rightProfileSkinUrl;
    this.stage.ogar.secondTab.emitter.sendPlayerSkin();

    this.stage.world.skinsLoader.getCustomSkin(rightProfileSkinUrl, () => {});
  }

  public sendMessage(message: string): void {
    this.stage.ogar.firstTab.sendChat(message);
  }

  public sendCommand(message: string): void {
    this.stage.ogar.firstTab.sendChatCommander(message);
  }





  /*************** View ***************/
  
  public spectateTopOne(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    WorldState.spectator.free && this.stage.world.controller.stopFreeSpectate();

    const { spectatorMode } = this.stage.settings.all.settings.game.gameplay;
    const gameMode = this.stage.master.gameMode.get();

    if (gameMode === ':party') {
      if (!this.stage.world.controller.topOneViewEnabled) {
        this.stage.world.controller.connectTopOneTab().then(() => {
          this.stage.world.view.spectateTopOne(false);
        });
      } else {
        this.stage.world.view.spectateTopOne(false);
      }
    } else {
      this.stage.world.controller.firstTabSocket.emitter.sendSpectate();
      this.stage.world.view.spectateTopOne(true);
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
    const { spectatorMode } = this.stage.settings.all.settings.game.gameplay;

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

      if (this.stage.settings.all.settings.game.minimap.realPlayersCells && this.stage.settings.all.settings.game.gameplay.spectatorMode !== 'Top one') {
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
      sendCommand(message: string): void,

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