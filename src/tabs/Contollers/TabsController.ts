import Socket, { ISocketData, TabType, IMapOffsets } from '../Socket/Socket';
import GameSettings from '../../Settings/Settings';
import World from '../../render/World';
import Captcha from '../Captcha';
import Login from '../Login';
import UICommunicationService from '../../communication/FrontAPI';
import FullmapController from './FullmapController';

class Controller {
  private topOneTabSocket: Socket;
  public fullmapController: FullmapController;
  public firstTabSocket: Socket;
  public secondTabSocket: Socket;
  public topOneViewEnabled: boolean = false;
  public socketData: ISocketData;
  public currentFocusedTab: TabType = 'FIRST_TAB';
  public world: World;
  public captcha: Captcha;
  public login: Login;

  constructor(world: World) {
    this.topOneViewEnabled = false;
    this.world = world;
    this.captcha = new Captcha();
    this.login = new Login(world);
    this.fullmapController = new FullmapController(this);
  }

  public spectateFree(): void {
    this.firstTabSocket.emitter.sendSpectate();
    setTimeout(() => this.firstTabSocket.emitter.sendFreeSpectate(), 120);
  }

  public stopFreeSpectate(): void {
    this.firstTabSocket.emitter.sendFreeSpectate();
  }

  public setFirstTabActive(): void {
    this.currentFocusedTab = 'FIRST_TAB';
    this.secondTabSocket.isFocused = false;
    this.firstTabSocket.isFocused = true;
    this.world.setMultiboxTabRingsActive('FIRST_TAB');
  }

  public setSecondTabActive(): void {
    this.currentFocusedTab = 'SECOND_TAB';
    this.secondTabSocket.isFocused = true;
    this.firstTabSocket.isFocused = false;
    this.world.setMultiboxTabRingsActive('SECOND_TAB');
  }

  public spawnFirstTab(): Promise<boolean> {
    /* this.firstTabSocket.emitter.handleSpawnV3(Settings.tabs.first.nick); */
    this.world.ogar.firstTab.spawn();

    return new Promise((resolve) => {
      this.firstTabSocket.onPlayerSpawn = resolve;
    });
  }

  public spawnSecondTab(): Promise<boolean> {
    /* this.secondTabSocket.emitter.handleSpawnV3(Settings.tabs.second.nick); */
    this.world.ogar.secondTab.spawn();

    return new Promise((resolve) => {
      this.secondTabSocket.onPlayerSpawn = resolve;
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

      /* this.world.ogar.connected && this.world.ogar.firstTab.join(reg, socketData.token);
      this.world.ogar.connected && this.world.ogar.secondTab.join(reg, socketData.token); */
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.connectFirstPlayerTab().then(mapOffsets => {

          if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map') {
            setTimeout(() => this.enableFullMapView(), 500);
          } else if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one') {
            setTimeout(() => this.connectTopOneTab(), 500);
          }
  
          if (GameSettings.all.settings.game.multibox.enabled) {
            setTimeout(() => this.connectSecondPlayerTab(), 750);
          }
  
          resolve(mapOffsets);
        });
      }, 250);
    });
  }

  public connectFirstPlayerTab(): Promise<IMapOffsets> {
    return new Promise((resolve) => {
      this.firstTabSocket = new Socket(this.socketData, 'FIRST_TAB', this.world, this.captcha);
      this.firstTabSocket.isFocused = true;
      this.firstTabSocket.onServerDeath = () => {
        this.world.scene.connect();
        this.world.hotkeys.firstTabSpawning = false;
      };
      this.firstTabSocket.init().then(() => resolve(this.firstTabSocket.mapOffsets));
    });
  }

  public connectSecondPlayerTab() {
    if (!this.firstTabSocket) {
      console.log('[Controller]: first player tab is not connected yet.');
      UICommunicationService.sendChatMessage('Could not connect second player tab. Main tab is not connected yet.');
      return;
    }
    
    return new Promise((resolve: any) => {
      this.secondTabSocket = new Socket(this.socketData, 'SECOND_TAB', this.world, this.captcha, this.firstTabSocket.mapOffsets);
      this.secondTabSocket.init().then(() => resolve());
      this.secondTabSocket.onServerDeath = () => {
        this.world.hotkeys.secondTabSpawning = false;
      }
    });
  }

  public connectTopOneTab() {
    if (this.world.scene.master.gameMode.get() !== ':party') {
      UICommunicationService.sendChatMessage('Top one spectator is not available now.');
      return;
    }

    if (!this.firstTabSocket) {
      console.log('[Controller]: first player tab is not connected yet.');
      UICommunicationService.sendChatMessage('Could not connect top 1 tab. Main tab is not connected yet.');
      return;
    }

    return new Promise((resolve: any) => {
      this.topOneTabSocket = new Socket(this.socketData, 'TOP_ONE_TAB', this.world, this.captcha, this.firstTabSocket.mapOffsets);
      this.topOneTabSocket.init().then(() => {
        
        UICommunicationService.sendChatMessage('Top one view establised.');
        console.log('[Controller]: top one view establised.');

        this.topOneTabSocket.spectate();
        this.topOneViewEnabled = true;
        resolve();
      });
    });
  }

  public enableFullMapView(i?: number): void {
    if (this.world.scene.master.gameMode.get() !== ':party') {
      UICommunicationService.sendChatMessage('Full map view is not available now');
    } else {
      this.fullmapController.enable(i);
    }
  }
}

export default Controller;