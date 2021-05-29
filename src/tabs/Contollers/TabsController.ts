import Socket, { ISocketData, TabType, IMapOffsets } from '../Socket/Socket';
import GameSettings from '../../Settings/Settings';
import World from '../../render/World';
import UICommunicationService from '../../communication/FrontAPI';
import FullmapController from './FullmapController';
import Logger from '../../utils/Logger';
import PlayerState from '../../states/PlayerState';
import Ogar from '../../Ogar';
import { ChatAuthor } from '../../communication/Chat';

class Controller {
  private topOneTabSocket: Socket;
  public fullmapController: FullmapController;
  public firstTabSocket: Socket;
  public secondTabSocket: Socket;
  public topOneViewEnabled: boolean = false;
  public socketData: ISocketData;
  public currentFocusedTab: TabType = 'FIRST_TAB';

  private logger: Logger;
  private connectionTimeoutsIds: Array<NodeJS.Timeout> = [];

  constructor(public world: World) {
    this.fullmapController = new FullmapController(this);
    this.logger = new Logger('TabsController');
  }

  public init(socketData?: ISocketData): Promise<IMapOffsets> {
    return new Promise((resolve: any, reject: (reason: string) => void) => {
      this.disconnectAll();

      if (socketData) {
        this.socketData = socketData;
  
        const reg = socketData.https.match(/live-arena-([\w\d]+)\.agar\.io:\d+/)[1];
  
        if (!Ogar.connected) {
          window.GameAPI.connectOgar().then(() => Ogar.join(reg, socketData.token));
        } else {
          Ogar.join(reg, socketData.token);
        }
      }

      let mainId: NodeJS.Timeout;
      let fullMapId: NodeJS.Timeout;
      let topOneId: NodeJS.Timeout;
      let secondPlayerTabId: NodeJS.Timeout;

      mainId = setTimeout(() => {
        this.connectFirstPlayerTab().then(mapOffsets => {

          if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map') {
            fullMapId = setTimeout(() => this.enableFullMapView(), 400);
            this.connectionTimeoutsIds.push(fullMapId);
          } else if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one') {
            topOneId = setTimeout(() => this.connectTopOneTab(), 400);
            this.connectionTimeoutsIds.push(topOneId);
          }
  
          if (GameSettings.all.settings.game.multibox.enabled) {
            secondPlayerTabId = setTimeout(() => this.connectSecondPlayerTab(), 600);
            this.connectionTimeoutsIds.push(secondPlayerTabId);
          }
  
          resolve(mapOffsets);
        }).catch((reason) => reject(reason));
      }, 200);

      this.connectionTimeoutsIds.push(mainId);
    });
  }

  public connectFirstPlayerTab(): Promise<IMapOffsets> {
    return new Promise((resolve: any, reject: (reason: string) => any) => {
      this.disconnectFirstTab();

      UICommunicationService.setFirstTabStatus('CONNECTING');

      this.firstTabSocket = new Socket(this.socketData, 'FIRST_TAB', this.world);

      this.firstTabSocket.init().then(() => {
        UICommunicationService.setFirstTabStatus('CONNECTED');
        UICommunicationService.sendChatGameMessage('Main player tab connected.', ChatAuthor.Game);
        resolve(this.firstTabSocket.mapOffsets);
      }).catch((reason) => reject(reason));

      this.firstTabSocket.onDisconnect(() => {
        UICommunicationService.sendChatGameMessage('Main player tab disconnected.', ChatAuthor.Game);
        UICommunicationService.setFirstTabStatus('DISCONNECTED');
      });
    });
  }

  public connectSecondPlayerTab() {
    return new Promise((resolve: any, reject: any) => {
      if (!this.firstTabSocket) {
        this.logger.error('First player tab is not connected yet');
        UICommunicationService.sendChatGameMessage('Could not connect second player tab: main tab is not connected yet.', ChatAuthor.Game);
        return reject();
      }

      this.disconnectSecondTab();
      
      this.secondTabSocket = new Socket(this.socketData, 'SECOND_TAB', this.world);

      UICommunicationService.setSecondTabStatus('CONNECTING');

      this.secondTabSocket.init().then(() => {
        UICommunicationService.sendChatGameMessage('Second player tab connected.', ChatAuthor.Game);
        UICommunicationService.setSecondTabStatus('CONNECTED');
        resolve();
      });

      this.secondTabSocket.onDisconnect(() => {
        UICommunicationService.sendChatGameMessage('Second player tab disconnected.', ChatAuthor.Game);
        UICommunicationService.setSecondTabStatus('DISCONNECTED');
      })
    })
  }

  public connectTopOneTab() {
    return new Promise((resolve: any, reject: any) => {
      if (!this.firstTabSocket) { 
        this.logger.error('First player tab is not connected yet');
        UICommunicationService.sendChatGameMessage('Could not connect top 1 tab. Main tab is not connected yet.', ChatAuthor.Spectator);
        return reject();
      }
  
      if (this.topOneViewEnabled) {
        this.logger.error('Top one (spectator) tab is already enabled');
        return reject();
      }

      this.disconnectTopOneTab();

      this.topOneTabSocket = new Socket(this.socketData, 'TOP_ONE_TAB', this.world);

      if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one') {
        UICommunicationService.setSpectatorTabStatus('CONNECTING');
      }
      
      this.topOneTabSocket.init().then(() => {
        UICommunicationService.sendChatGameMessage('Top one view establised.', ChatAuthor.Spectator);
        this.topOneTabSocket.spectate();
        this.topOneViewEnabled = true;

        if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one') {
          UICommunicationService.setSpectatorTabStatus('CONNECTED');
        }

        resolve();
      });

      this.topOneTabSocket.onDisconnect(() => {
        if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one') {
          UICommunicationService.setSpectatorTabStatus('DISCONNECTED');
        }
      });
    });
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
    this.disconnectTopOneTab();
  }

  public disconnectAll(): void {
    this.connectionTimeoutsIds.forEach((timeout) => clearTimeout(timeout));
    this.disconnectFirstTab();
    this.disconnectSecondTab();
    this.disconnectTopOneTab();
    this.disconnectFullMapView();
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

  public spectateFree(): void {
    this.firstTabSocket.emitter.sendSpectate();
    setTimeout(() => this.firstTabSocket.emitter.sendFreeSpectate(), 120);
    PlayerState.first.focused = true;
  }

  public stopFreeSpectate(): void {
    this.firstTabSocket.emitter.sendFreeSpectate();
    PlayerState.first.focused = false;
  }

  public spawnFirstTab(): Promise<boolean> {
    this.firstTabSocket.emitter.handleSpawn(GameSettings.all.profiles.leftProfileNick);

    return new Promise((resolve, reject) => {
      this.firstTabSocket.onPlayerSpawn = resolve;
      this.firstTabSocket.onDisconnect(() => reject());
    });
  }

  public spawnSecondTab(): Promise<boolean> {
    this.secondTabSocket.emitter.handleSpawn(GameSettings.all.profiles.rightProfileNick);

    return new Promise((resolve, reject) => {
      this.secondTabSocket.onPlayerSpawn = resolve;
      this.firstTabSocket.onDisconnect(() => reject());
    });
  }

  public enableFullMapView(): void {
    if (this.firstTabSocket) {
      this.disconnectFullMapView();
      this.fullmapController.enable();
    } else {
      this.logger.error('First player tab is not connected yet');
    }
  }
}

export default Controller;