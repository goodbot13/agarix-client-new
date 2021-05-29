import { shiftKey, shiftMessage } from '../../utils/helpers';
import Receiver from './Receiver';
import Emitter from './Emitter';
import World from '../../render/World';
import UICommunicationService from '../../communication/FrontAPI';
import WorldState from '../../states/WorldState';
import PlayerState from '../../states/PlayerState';
import FacebookLogin from '../Login/FacebookLogin';
import GoogleLogin from '../Login/GoogleLogin';
import { 
  ADD_OWN_CELL, 
  COMPRESSED_MESSAGE, 
  FLUSH, 
  GENERATE_KEYS,
  GHOST_CELLS, 
  LEADERBOARD, 
  LEADERBOARD2, 
  OUTDATED_CLIENT_ERROR, 
  PING_PONG, 
  RECAPTCHA_V2, 
  SERVER_TIME, 
  SERVER_DEATH, 
  SOCKET_CONNECTING, 
  SOCKET_OPENED, 
  SPECTATE_MODE_IS_FULL, 
  VIEWPORT_UPDATE, 
  RECAPTCHA_V3,
  TOKEN_ACCEPTED,
  MOBILE_DATA
} from './Opcodes';
import Master from '../../Master';
import Logger from '../../utils/Logger';
import Settings from '../../Settings/Settings';
import CallbacksHandler from './CallbacksHandler';
import { ChatAuthor } from '../../communication/Chat';
import Captcha from './Captcha/Captcha';
import { SOCKET_CONNECTION_REJECT } from './types';

export default class Socket {
  public readonly socketData: ISocketData;
  public protocolKey: number;
  public clientKey: number;
  public mapOffsetFixed: boolean;
  public isPlaying: boolean;
  public spectateAtX: number;
  public spectateAtY: number;
  public serverTime: number;
  public serverTimeDiff: number;
  public socket: WebSocket;
  public readonly tabType: TabType;
  public mapOffsets: IMapOffsets;
  public shiftOffsets: IMapOffsetsShift;
  public reachedSpectatingPosition: boolean;
  public readonly emitter: Emitter;
  public onServerDeath: any;
  public offsetsPositionMultiplier: IMapOffsetsPositionMultiplier;
  public playerSpawned: boolean;
  public onFullMapViewEnabled: any;
  public onPlayerSpawn: any;
  public world: World;

  private readonly receiver: Receiver;
  private readonly disconnectHandler: CallbacksHandler;
  private sendMousePositionInterval: NodeJS.Timeout;
  private socketInitCallback: any;
  private logger: Logger;
  private loginTimeoutId: NodeJS.Timeout;

  public connectionOpened: boolean;

  constructor(socketData: ISocketData, tabType: TabType, world: World) {
    this.socketData = socketData;
    this.tabType = tabType;
    this.protocolKey = null;
    this.clientKey = null;
    this.mapOffsetFixed = false;
    this.mapOffsets = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    this.offsetsPositionMultiplier = { x: 1, y: 1 };
    this.playerSpawned = false;
    this.shiftOffsets = { x: 0, y: 0 };
    this.world = world;
    this.receiver = new Receiver(this);
    this.disconnectHandler = new CallbacksHandler();
    this.emitter = new Emitter(this);
    this.logger = new Logger('AgarSocket');
  }

  public init(): Promise<IMapOffsets | void> {
    switch (this.tabType) {
      case 'FIRST_TAB': 
        PlayerState.first.connecting = true;
        break;

      case 'SECOND_TAB': 
        PlayerState.second.connecting = true;
        break;
    }

    return new Promise((resolve: () => void, reject: (reason: string) => void) => {
      this.socket = new WebSocket(this.socketData.address);
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = () => this.receiver.handleHandshake();
      this.socket.onmessage = (msg) => this.handleMessage(msg.data);
      this.socket.onclose = () => this.disconnect();
      this.socket.onerror = () => this.disconnect();
      
      this.socketInitCallback = resolve;

      setTimeout(() => {
        if (!this.connectionOpened) {
          this.disconnectHandler.execute();
          reject(SOCKET_CONNECTION_REJECT.NO_RESPONSE_FROM_SERVER);
        }
      }, 500);
    }); 
  }

  public disconnect(): void {
    switch (this.tabType) {
      case 'FIRST_TAB':
        PlayerState.first.playing = false;
        PlayerState.first.spawning = false;
        PlayerState.first.loggedIn = false;
        PlayerState.first.connected = false;
        PlayerState.first.connecting = false;
        this.world.view.firstTab.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        break;

      case 'SECOND_TAB':
        PlayerState.second.playing = false;
        PlayerState.second.spawning = false;
        PlayerState.second.loggedIn = false;
        PlayerState.second.connected = false;
        PlayerState.second.connecting = false;
        this.world.view.secondTab.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        break;

      case 'TOP_ONE_TAB':
        this.world.view.topOneTab.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        this.world.view.topOneTab.viewport = { x: 0, y: 0, scale: 1 };
    }

    this.world.clearCellsByType(this.tabType);
    this.stopSendingPosition();

    if (this.connectionOpened) {
      this.disconnectHandler.execute();
    }

    clearTimeout(this.loginTimeoutId);

    this.connectionOpened = false;
  }

  public onDisconnect(callback: () => void): void {
    this.disconnectHandler.pushCallback(callback);
  }
  
  public destroy(): void {
    this.socket.close();
  }

  private hasReachedSpectatingPosition(viewport: IViewport): boolean {
    const reachedX = Math.abs(viewport.x - (this.mapOffsets.minX + this.spectateAtX)) < 100;
    const reachedY = Math.abs(viewport.y - (this.mapOffsets.minY + this.spectateAtY)) < 100;

    return reachedX && reachedY;
  }

  private handleMessage(arrayBuffer: ArrayBuffer): void { 
    let view = new DataView(arrayBuffer);

    if (this.protocolKey) {
      view = shiftMessage(view, this.protocolKey ^ this.socketData.clientVersionInt);
    }

    this.receiver.reader.setView(view);
    const opcode = this.receiver.reader.getUint8();

    switch (opcode) {

      case 161: break;
      case 5: break;
      case FLUSH: break;

      case VIEWPORT_UPDATE: 
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
            break;
        }
        break;

      case ADD_OWN_CELL: 
        this.receiver.handleAddOwnCell();
        break;
      
      case LEADERBOARD:
      case LEADERBOARD2: 
        if (this.tabType === 'FIRST_TAB') {
          opcode === 54 && this.receiver.reader.shiftOffset(2);
          UICommunicationService.updateLeaderboard(this.receiver.handleLeaderboardUpdate());
        }
        break;     

      case GHOST_CELLS: 
        if (this.tabType === 'FIRST_TAB') {
          this.world.minimap.updateGhostCells(this.receiver.handleGhostCells());
        }
        break;

      case RECAPTCHA_V2:
        Captcha.V2.handle(this);
        break;

      case RECAPTCHA_V3:
        Captcha.V3.handle(this);
        break;

      case SERVER_DEATH:
        if (typeof this.onServerDeath === 'function') {
          this.onServerDeath();
        }

        this.disconnect();
        
        break;

      case TOKEN_ACCEPTED: 
        break;

/*       case MOBILE_DATA:
        if (this.emit("mobiledata", new Uint8Array(e.buffer.slice(1))), 1 == (a = (i = new L(e, o)).readFlag()) && i.setContentType(), 2 == (a = i.readFlag()) && i.setUncompressedSize(), 1 == (a = i.readFlag())) switch (a = i.readUint32(), i.readFlag(), i.readUint32(), a) {
          case 20:
            Array.from(new Uint8Array(e.buffer)).map((function (e) {
              return String.fromCharCode(e)
            })).join(""), i = e.getUint8(e.byteLength - 1), console.log("Disconnected by server"), this.disconnectMessage(i), this.loggedIn = !1, this.parent.emit("logout", this), this.emit("logout", this);
            break;
          case 62:
            Array.from(new Uint8Array(e.buffer)).map((function (e) {
              return String.fromCharCode(e)
            })).join("")
        } */

      case PING_PONG: 
        this.receiver.handlePingUpdate();
        break;

      case OUTDATED_CLIENT_ERROR:
        if (this.tabType === 'FIRST_TAB') {
          UICommunicationService.sendChatGameMessage('Client is outdated. An update is required.');
        }
        break;

      case SPECTATE_MODE_IS_FULL:
        UICommunicationService.sendChatGameMessage('Spectate error: slots are full.', ChatAuthor.Spectator);
        break;

      case GENERATE_KEYS: 
        this.receiver.generateKeys();
        break;

      case SERVER_TIME:
        this.tryLogin();
        break;

      case COMPRESSED_MESSAGE: 
      
        // no need to decompress, reveice only viewport
        if (this.tabType === 'TOP_ONE_TAB' && Settings.all.settings.game.gameplay.spectatorMode === 'Full map' && this.mapOffsetFixed) {
          return;
        }

        this.receiver.handleCompressedMessage();
        break;

      default:
        this.logger.warning(`Unhandled opcode: ${opcode}`);
        break;
    }
  }

  public tryLogin(): void {
    if (this.tabType === 'FIRST_TAB' || this.tabType === 'SECOND_TAB') {
      FacebookLogin.logIn(this);
      GoogleLogin.logIn(this);
    }
  }

  public sendMessage(message: DataView): void {
    if (this.socket.readyState === SOCKET_OPENED) {
      message = shiftMessage(message, this.clientKey);
      this.clientKey = shiftKey(this.clientKey);
      this.socket.send(message.buffer);
    }
  }

  public send(view: DataView): void {
    this.socket.send(view.buffer);
  }

  public setMapOffset(offsets: IMapOffsets): void {
    if (this.mapOffsetFixed) {
      return;
    }

    this.mapOffsetFixed = true;
    this.mapOffsets = offsets;

    const { minX, minY, maxX, maxY } = offsets;
    const gameMode = Master.gameMode.get();

    if (gameMode === ':ffa') {
      const mapWidth = Math.abs(minX) + Math.abs(maxX);
      const mapHeight = Math.abs(minY) + Math.abs(maxY);

      this.offsetsPositionMultiplier.x = 14142 / mapWidth;
      this.offsetsPositionMultiplier.y = 14142 / mapHeight;
    }
  
    // world is not created. set global offsets 
    if (!WorldState.gameJoined) {
      if (this.tabType === 'FIRST_TAB') {
        WorldState.mapOffsets = offsets;
      }
    } else {
      this.shiftOffsets.x = (WorldState.mapOffsets.minX - this.mapOffsets.minX);
      this.shiftOffsets.y = (WorldState.mapOffsets.minY - this.mapOffsets.minY);
    }

    const viewport: IViewport = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      scale: 1 
    }

    if (this.tabType === 'FIRST_TAB') {
      this.world.view.firstTab.viewportUpdate(viewport);
      this.world.view.firstTab.setMapOffsets(this.mapOffsets, this.shiftOffsets);
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
  token?: string,
  serverToken: string,
  https?: string
}

export interface IMapOffsets {
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
}

export interface IMapOffsetsShift {
  x: number,
  y: number,
}

export interface IMapOffsetsPositionMultiplier {
  x: number,
  y: number
}

export interface IViewport {
  x: number,
  y: number,
  scale: number
}

export type TabType = 'FIRST_TAB' | 'SECOND_TAB' | 'SPEC_TABS' | 'TOP_ONE_TAB';