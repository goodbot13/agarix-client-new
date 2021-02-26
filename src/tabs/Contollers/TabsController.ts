import Socket, { ISocketData, TabType, IMapOffsets } from '../Socket/Socket';
import GameSettings from '../../Settings/Settings';
import World from '../../render/World';
import UICommunicationService from '../../communication/FrontAPI';
import FullmapController from './FullmapController';
import Logger from '../../utils/Logger';
import PlayerState from '../../states/PlayerState';
import Master from '../../Master';
import Ogar from '../../Ogar';

class Controller {
  private topOneTabSocket: Socket;
  public fullmapController: FullmapController;
  public firstTabSocket: Socket;
  public secondTabSocket: Socket;
  public topOneViewEnabled: boolean = false;
  public socketData: ISocketData;
  public currentFocusedTab: TabType = 'FIRST_TAB';
  public world: World;

  private logger: Logger;

  constructor(world: World) {
    this.topOneViewEnabled = false;
    this.world = world;
    this.fullmapController = new FullmapController(this);

    this.logger = new Logger('TabsController');
  }

  public spectateFree(): void {
    this.firstTabSocket.emitter.sendSpectate();
    setTimeout(() => this.firstTabSocket.emitter.sendFreeSpectate(), 120);
    PlayerState.first.focused = true;
  }

  public stopFreeSpectate(): void {
    this.firstTabSocket.emitter.sendFreeSpectate();
    PlayerState.first.focused = false;
  }

  public setFirstTabActive(): void {
    this.currentFocusedTab = 'FIRST_TAB';
    PlayerState.second.focused = false;
    PlayerState.first.focused = true;
    this.world.setMultiboxTabRingsActive('FIRST_TAB');
  }

  public setSecondTabActive(): void {
    this.currentFocusedTab = 'SECOND_TAB';
    PlayerState.second.focused = true;
    PlayerState.first.focused = false;
    this.world.setMultiboxTabRingsActive('SECOND_TAB');
  }

  public spawnFirstTab(): Promise<boolean> {
    this.firstTabSocket.emitter.handleSpawnV3(GameSettings.all.profiles.leftProfileNick);
    Ogar.firstTab.spawn();

    return new Promise((resolve) => this.firstTabSocket.onPlayerSpawn = resolve);
  }

  public spawnSecondTab(): Promise<boolean> {
    this.secondTabSocket.emitter.handleSpawnV3(GameSettings.all.profiles.rightProfileNick);
    Ogar.secondTab.spawn();

    return new Promise((resolve) => this.secondTabSocket.onPlayerSpawn = resolve);
  }

  public disconnectFirstTab(): void {
    this.firstTabSocket && this.firstTabSocket.destroy();
  }

  public disconnectSecondTab(): void {
    this.secondTabSocket && this.secondTabSocket.destroy();
  }

  public disconnectTopOneTab(): void {
    this.topOneTabSocket && this.topOneTabSocket.destroy();
    this.topOneViewEnabled = false;
  }

  public disconnectFullMapView(): void {
    this.fullmapController.disconnectAll();

    if (GameSettings.all.settings.game.gameplay.spectatorMode !== 'Top one') {
      this.disconnectTopOneTab();
    }
  }

  public disconnectAll(): void {
    this.disconnectFirstTab();
    this.disconnectSecondTab();
    this.disconnectTopOneTab();
    this.disconnectFullMapView();
  }

  public init(socketData?: ISocketData): Promise<IMapOffsets> {
    this.disconnectAll();

    if (socketData) {
      this.socketData = socketData;

      const reg = socketData.https.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1];

      Ogar.connected && Ogar.firstTab.join(reg, socketData.token);
      Ogar.connected && Ogar.secondTab.join(reg, socketData.token);
    }

    return new Promise((resolve: any) => {
      setTimeout(() => {
        this.connectFirstPlayerTab().then(mapOffsets => {

          if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map') {
            setTimeout(() => this.enableFullMapView(), 250);
          } else if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one') {
            setTimeout(() => this.connectTopOneTab(), 250);
          }
  
          if (GameSettings.all.settings.game.multibox.enabled) {
            setTimeout(() => this.connectSecondPlayerTab(), 375);
          }
  
          resolve(mapOffsets);
        });
      }, 125);
    });
  }

  public connectFirstPlayerTab(): Promise<IMapOffsets> {
    return new Promise((resolve) => {
      this.disconnectFirstTab();
      this.firstTabSocket = new Socket(this.socketData, 'FIRST_TAB', this.world);
      this.firstTabSocket.init().then(() => resolve(this.firstTabSocket.mapOffsets));
    });
  }

  public connectSecondPlayerTab() {
    return new Promise((resolve: any, reject: any) => {
      
      if (!this.firstTabSocket) {
        this.logger.error('First player tab is not connected yet');
        UICommunicationService.sendChatGameMessage('Could not connect second player tab. Main tab is not connected yet.');
        reject();
        return;
      }

      if (Master.gameMode.get() !== ':party') {
        UICommunicationService.sendChatGameMessage('Multibox is not available now.');
        reject();
        return;
      }

      this.disconnectSecondTab();
      this.secondTabSocket = new Socket(this.socketData, 'SECOND_TAB', this.world);
      this.secondTabSocket.init().then(() => resolve());
    })
  }

  public connectTopOneTab() {
    return new Promise((resolve: any, reject: any) => {

      if (Master.gameMode.get() !== ':party') {
        UICommunicationService.sendChatGameMessage('Top one spectator is not available now.');
        reject();
        return;
      }
  
      if (!this.firstTabSocket) {
        this.logger.error('First player tab is not connected yet');
        UICommunicationService.sendChatGameMessage('Could not connect top 1 tab. Main tab is not connected yet.');
        reject();
        return;
      }
  
      if (this.topOneViewEnabled) {
        this.logger.error('Top one (spectator) tab is already enabled');
        reject();
        return;
      }

      this.disconnectTopOneTab();
      this.topOneTabSocket = new Socket(this.socketData, 'TOP_ONE_TAB', this.world);
      this.topOneTabSocket.init().then(() => {
        UICommunicationService.sendChatGameMessage('Top one view establised.');
        this.logger.info('Top one view establised');

        this.topOneTabSocket.spectate();
        this.topOneViewEnabled = true;
        resolve();
      });
    });
  }

  public enableFullMapView(): void {
    if (Master.gameMode.get() !== ':party') {
      UICommunicationService.sendChatGameMessage('Full map view is not available now');
    } else {
      if (this.firstTabSocket) {
        this.disconnectFullMapView();
        this.fullmapController.enable();
      } else {
        this.logger.error('First player tab is not connected yet');
      }
    }
  }
}

export default Controller;