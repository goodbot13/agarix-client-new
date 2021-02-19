import Stage from "..";
import Globals from "../Globals";
import Settings from "../Settings";
import Logger from "../utils/Logger";
import UICommunicationService from "./FrontAPI";
import { TGameMode } from '../Master/GameMode';

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
    this.logger.info(`Game mode changed to [name: ${this.stage.master.regions.getCurrent()}, index: ${index}]`);
  }





  /*************** Ogar ***************/

  public async connectOgar(): Promise<boolean> {
    if (Settings.deltaServerAdjust) {
      this.stage.world.ogar.firstTab.deltaOverOgar();
    }

    await this.stage.world.ogar.firstTab.connect();
    
    if (!this.stage.world.ogar.connected) {
      this.stage.world.ogar.firstTab.player.nick = Settings.tabs.first.nick;
      this.stage.world.ogar.firstTab.player.skin = Settings.tabs.first.skinUrl;
      this.stage.world.ogar.firstTab.player.tag = Settings.tag;
      this.stage.world.ogar.connected = true;

      if (Settings.deltaServerAdjust) {
        UICommunicationService.sendChatMessage('Delta server connection established.');
        this.logger.info('Delta server connection established');
      } else {
        UICommunicationService.sendChatMessage('Ogar server connection established.');
        this.logger.info('Ogar server connection established');
      }
    
      if (Globals.gameJoined) {
        this.stage.world.ogar.firstTab.join(
          this.stage.world.controller.socketData.https.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1],
          this.stage.world.controller.socketData.token
        );
      }
      
      return true;
    }
  }

  public disconnectOgar(): void {
    if (this.stage.world.ogar.connected) {
      this.stage.world.ogar.firstTab.disconnect();
      this.stage.world.ogar.connected = false;
      this.logger.info('Ogar/Delta server disconnected');
    }
  }

  public setTag(tag: string): void {
    Settings.tag = tag;
    this.stage.world.ogar.firstTab.emitter.sendPlayerTag();
    this.logger.info(`Tag changed: [${tag}]`);
  }

  public setFirstTabNick(nick: string): void {
    Settings.tabs.first.nick = nick;
    this.stage.world.ogar.firstTab.player.nick = nick;
    this.stage.world.ogar.firstTab.emitter.sendPlayerNick();
    this.logger.info(`First tab nick changed: [${nick}]`);
  }

  public setFirstTabSkin(skin: string): void {
    Settings.tabs.first.skinUrl = skin;
    this.stage.world.ogar.firstTab.player.skin = skin;
    this.stage.skinsLoader.load(skin);
    this.logger.info(`First tab skin changed: [${skin}]`);
  }

  public setSecondTabNick(nick: string): void {
    Settings.tabs.second.nick = nick;
    this.stage.world.ogar.secondTab.player.nick = nick;
    this.stage.world.ogar.secondTab.emitter.sendPlayerNick();
    this.logger.info(`Second tab nick changed: [${nick}]`);
  }

  public setSecondTabSkin(skin: string): void {
    Settings.tabs.second.skinUrl = skin;
    this.stage.world.ogar.secondTab.player.skin = skin;
    this.stage.skinsLoader.load(skin);
    this.logger.info(`Second tab skin changed: [${skin}]`);
  }

  public sendMessage(message: string): void {
    this.stage.world.ogar.firstTab.sendChat(message);
    this.logger.info(`Sent chat message: [${message}]`);
  }





  /*************** View ***************/
  
  public spectateTopOne(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    if (this.stage.world.view.freeSpectating) {
      this.stage.world.controller.stopFreeSpectate();
    }

    if (!this.stage.world.view.topOneSpectating) {
      this.stage.world.controller.firstTabSocket.emitter.sendSpectate();
    }

    this.stage.world.view.spectateTopOne();
    this.logger.info('Spectate mode changed to TOP 1');
  }

  public spectateCenter(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    if (this.stage.world.view.freeSpectating) {
      this.stage.world.controller.stopFreeSpectate();
    }

    this.stage.world.view.center();
    this.logger.info('Spectate mode changed to CENTER');
  }

  public spectateTarget(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    if (this.stage.world.view.freeSpectating) {
      this.stage.world.controller.stopFreeSpectate();
    }

    this.logger.info('Spectate mode changed to TARGET');
    // TODO
  }

  public spectateFree(): void {
    if (!this.stage.world.controller.firstTabSocket) {
      return;
    }

    this.stage.world.controller.spectateFree();
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
    setTimeout(() => {
      if (enabled) {

        UICommunicationService.sendChatMessage('Full map view enabled.');

        this.stage.world.controller.enableFullMapView();

      } else {

        UICommunicationService.sendChatMessage('Full map view disabled.');

        this.stage.world.controller.disconnectFullMapView();

        if (Settings.minimap.drawRealPlayers && !Settings.topOneViewEnabled) {
          this.stage.world.minimap.reset();
        }

      }
    }, 250);
  }

  public setTopOneView(enabled: boolean, reset?: boolean): void {
    setTimeout(() => {
      if (enabled) {

        if (Settings.fullMapViewEnabled && !reset) {
          return;
        }

        UICommunicationService.sendChatMessage('Top one view enabled.');

        this.stage.world.controller.connectTopOneTab();

      } else {

        if (!Settings.fullMapViewEnabled || reset) {
          this.stage.world.controller.disconnectTopOneTab();

          UICommunicationService.sendChatMessage('Top one view disabled.');

          if (Settings.minimap.drawRealPlayers) {
            this.stage.world.minimap.reset();
          }
        }

      }
    }, 333);
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

  public join(token?: string): Promise<string> {
    return this.stage.connect(token);
  }

  public setSceneBlurred(blurred: boolean, zoom?: boolean) {
    if (blurred) {
      this.stage.blurGameScene();
    } else {
      this.stage.unblurGameScene(zoom);
    }
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
      setSecondTabSkin(skin: string): void,
      setSecondTabNick(nick: string): void,
      setFirstTabSkin(skin: string): void,
      setFirstTabNick(nick: string): void,
      setTag(tag: string): void,
      disconnectOgar(): void,
      connectOgar(): Promise<boolean>,
      setRegion(index: number): void,
      setMode(mode: TGameMode): void,
    }
  }
}