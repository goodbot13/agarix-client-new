import { shiftKey, shiftMessage } from '../../utils/GameSocketHelper';
import Receiver from './Receiver';
import Emitter from './Emitter';
import Opcodes from './Opcodes';
import World from '../../render/World';
import Captcha from '../Captcha';
import UICommunicationService from '../../communication/FrontAPI';

export default class Socket {
  public readonly socketData: ISocketData;
  public protocolKey: number;
  public specialKey: number;
  public clientKey: number;
  public mapOffsetFixed: boolean;
  public isPlaying: boolean;
  public isFocused: boolean;
  public spectateAtX: number;
  public spectateAtY: number;
  public connectionOpened: boolean;
  public connectionOpenedTime: number;
  public serverTime: number;
  public serverTimeDiff: number;
  public socket: WebSocket;
  public readonly tabType: TabType;
  public mainTabOffsets: IMapOffsets;
  public mapOffsets: IMapOffsets;
  public shiftOffsets: IMapOffsetsShift;
  public reachedSpectatingPosition: boolean;
  public readonly emitter: Emitter;

  private readonly receiver: Receiver;
  private sendMousePositionInterval: NodeJS.Timeout;
  private socketInitCallback: any;
  private onDisconnect: any;
  public loggedIn: boolean;
  public onServerDeath: any;

  public playerSpawned: boolean;
  public onFullMapViewEnabled: any;
  public onPlayerSpawn: any;
  public index: number;

  public world: World;
  public captcha: Captcha;
  public id: number;

  constructor(socketData: ISocketData, tabType: TabType, world: World, captcha: Captcha, mainTabOffsets?: IMapOffsets) {
    this.socketData = socketData;
    this.tabType = tabType;
    this.mainTabOffsets = mainTabOffsets;
    this.protocolKey = null;
    this.specialKey = null;
    this.clientKey = null;
    this.mapOffsetFixed = false;
    this.loggedIn = false;
    this.mapOffsets = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    this.playerSpawned = false;
    this.isFocused = false;
    this.shiftOffsets = { x: 0, y: 0 };
    this.world = world;
    this.captcha = captcha;
    this.receiver = new Receiver(this);
    this.emitter = new Emitter(this);
  }

  public disconnect(): void {
    this.world.clearCellsByType(this.tabType);
    this.stopSendingPosition();

    typeof this.onDisconnect === 'function' && this.onDisconnect();

    switch (this.tabType) {
      case 'FIRST_TAB':
        this.world.view.firstTab.isPlaying = false;
        this.world.hotkeys.firstTabSpawning = false;
        this.world.view.firstTab.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        break;

      case 'SECOND_TAB':
        this.world.view.secondTab.isPlaying = false;
        this.world.hotkeys.secondTabSpawning = false;
        this.world.view.secondTab.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        break;

      case 'TOP_ONE_TAB':
        this.world.view.topOneTab.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        this.world.view.topOneTab.viewport = { x: 0, y: 0, scale: 1 };
    }
  }

  public subscribeOnDisconnect(callback): void {
    this.onDisconnect = callback;
  }

  public init(): Promise<IMapOffsets | void> {
    return new Promise((resolve: () => void) => {
      this.socket = new WebSocket(this.socketData.address);
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = () => this.receiver.handleHandshake();
      this.socket.onmessage = (msg) => this.handleMessage(msg.data);
      this.socket.onclose = () => this.disconnect();
      this.socket.onerror = () => this.disconnect();
      
      this.socketInitCallback = resolve;
    }); 
  }
  
  public destroy(): void {
    this.socket.close();
  }

  public calcOffsetShift(): void {
    this.shiftOffsets.x = (this.mainTabOffsets.minX - this.mapOffsets.minX);
    this.shiftOffsets.y = (this.mainTabOffsets.minY - this.mapOffsets.minY);
  }

  public sendLogin(token: string, type: 2 | 4 = 2) {
    this.emitter.sendLogin(token, type);
  }

  private hasReachedSpectatingPosition(viewport: IViewport): boolean {
    const reachedX = Math.abs(viewport.x - (this.mapOffsets.minX + this.spectateAtX)) < 100;
    const reachedY = Math.abs(viewport.y - (this.mapOffsets.minY + this.spectateAtY)) < 100;

    return reachedX && reachedY;
  }

  private handleMessage(arrayBuffer: ArrayBuffer): void {
    let view = new DataView(arrayBuffer);

    if (this.protocolKey) {
      view = shiftMessage(view, this.specialKey, false);
    }

    this.receiver.reader.setView(view);
    const opcode = this.receiver.reader.getUint8();

    switch (opcode) {

      case 161: break;
      case 5: break;

      case Opcodes.VIEWPORT_UPDATE: 
        const viewport = this.receiver.handleViewportUpdate();

        switch (this.tabType) {
          case 'FIRST_TAB': 
            this.world.view.firstTab.viewportUpdate(viewport);
            break;

          case 'SECOND_TAB':
            this.world.view.secondTab.viewportUpdate(viewport);
            break;

          case 'TOP_ONE_TAB': 
            this.world.view.topOneTab.viewportUpdate(viewport);
            break;

          case 'SPEC_TABS':

            if (!this.reachedSpectatingPosition) {

              if (this.hasReachedSpectatingPosition(viewport)) {
                this.reachedSpectatingPosition = true;

                clearInterval(this.sendMousePositionInterval);

                if (typeof this.onFullMapViewEnabled === 'function') {
                  this.onFullMapViewEnabled();
                }
              }

            }

        }

      case Opcodes.FLUSH: 
        /* console.log('flush', new Date().toLocaleTimeString()); */
        break;

      case Opcodes.ADD_OWN_CELL: 
        this.receiver.handleAddOwnCell();
        break;
      
      case Opcodes.LEADERBOARD:
      case Opcodes.LEADERBOARD2: 
        if (this.tabType === 'FIRST_TAB') {
          opcode === 54 && this.receiver.reader.shiftOffset(2);
          UICommunicationService.updateLeaderboard(this.receiver.handleLeaderboardUpdate());
        }
        break;     

      case Opcodes.GHOST_CELLS: 
        if (this.tabType === 'FIRST_TAB') {
          this.world.minimap.updateGhostCells(this.receiver.handleGhostCells());
        }
        break;

      case Opcodes.RECAPTCHA_V2: 
        this.receiver.handleRecaptchaV2();
        break;

      case Opcodes.SERVER_DEATH:
        if (typeof this.onServerDeath === 'function' && this.tabType === 'FIRST_TAB') {
          this.onServerDeath();
        }

        this.disconnect();
        
        break;

      case Opcodes.FREE_COINS: 
        break;

      case Opcodes.PING_PONG: 
        this.receiver.handlePingUpdate();
        break;

      case Opcodes.OUTDATED_CLIENT_ERROR:
        if (this.tabType === 'FIRST_TAB') {
          UICommunicationService.sendChatMessage('Client is outdated. An update is required.');
        }
        break;

      case Opcodes.SPECTATE_MODE_IS_FULL:
        UICommunicationService.sendChatMessage('Spectate error: slots are full.');
        break;

      case Opcodes.GENERATE_KEYS: 
        this.receiver.generateKeys();
        break;

      case Opcodes.SEND_LOGIN:
        this.world.controller.login.onLoginRequest(this);
        break;

      case Opcodes.COMPRESSED_MESSAGE: 
        this.receiver.handleCompressedMessage();
        break;
    }
  }

  public sendMessage(message: DataView): void {
    if (this.socket.readyState === Opcodes.SOCKET_OPENED) {
      message = shiftMessage(message, this.clientKey, false);
      this.clientKey = shiftKey(this.clientKey);
      this.socket.send(message.buffer);
    } else {
      if (this.socket.readyState !== Opcodes.SOCKET_CONNECTING) {
        this.destroy();
      }
    }
  }

  public send(view: DataView): void {
    this.socket.send(view.buffer);
  }

  public setMapOffset(offsets: IMapOffsets): void {
    const { minX, minY, maxX, maxY } = offsets;

    if (this.mapOffsetFixed) {
      return;
    }

    this.mapOffsetFixed = true;
    this.mapOffsets = { minX, minY, maxX, maxY };

    if (this.tabType === 'TOP_ONE_TAB' || this.tabType === 'SPEC_TABS' || this.tabType === 'SECOND_TAB') {
      this.calcOffsetShift();
    }

    const viewport: IViewport = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      scale: 1 
    }

    if (this.tabType === 'FIRST_TAB') {
      this.world.view.firstTab.viewportUpdate(viewport);
      this.world.view.firstTab.setMapOffsets(this.mapOffsets);
    }

    if (this.tabType === 'SECOND_TAB') {
      this.world.view.secondTab.viewportUpdate(viewport);
      this.world.view.secondTab.setMapOffsets(this.mapOffsets, this.shiftOffsets);
    }

    if (this.tabType === 'TOP_ONE_TAB') {
      this.world.view.topOneTab.viewportUpdate(viewport);
      this.world.view.topOneTab.setMapOffsets(this.mapOffsets, this.shiftOffsets);
    }

    this.startSendingPosition();
    this.socketInitCallback(this.mapOffsets);
  }

  public startSendingPosition(): void {
    this.sendMousePositionInterval = setInterval(() => this.emitter.sendMousePosition(), 40);
  }

  public stopSendingPosition(): void {
    clearInterval(this.sendMousePositionInterval);
    this.sendMousePositionInterval = null;
  }

  public stopCell(): void {
    if (this.tabType === 'TOP_ONE_TAB' || this.tabType === 'SPEC_TABS') {
      return;
    }

    this.stopSendingPosition();
  
    switch (this.tabType) {
      case 'FIRST_TAB':
        const { firstTab } = this.world.view;
        setTimeout(() => this.emitter.sendMousePosition(true, firstTab.viewport.x, firstTab.viewport.y), 40);
        break;

      case 'SECOND_TAB':
        const { secondTab } = this.world.view;
        setTimeout(() => this.emitter.sendMousePosition(true, secondTab.viewport.x, secondTab.viewport.y), 40);
        break;
    }
  }

  public resumeCell(): void {
    if (this.tabType === 'TOP_ONE_TAB' || this.tabType === 'SPEC_TABS') {
      return;
    }

    this.startSendingPosition();
  }

  
  public isPaused(): boolean {
    return this.sendMousePositionInterval === null;
  }

  public spectate(x?: number, y?: number): void {
    if (this.tabType === 'SPEC_TABS') {
      this.spectateAtX = x;
      this.spectateAtY = y;
      this.emitter.sendSpectate();
      this.emitter.sendFreeSpectate();
    } else {
      this.emitter.sendSpectate();
    }
  }
}

export interface ISocketData {
  address: string,
  protocolVersion: number,
  clientVersionInt: number,
  clientVersionString: string,
  token: string,
  serverToken: string,
  https: string
}

export interface IMapOffsets {
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
}

export interface IMapOffsetsShift {
  x: number,
  y: number
}

export interface IViewport {
  x: number,
  y: number,
  scale: number
}

export type TabType = 'FIRST_TAB' | 'SECOND_TAB' | 'SPEC_TABS' | 'TOP_ONE_TAB';