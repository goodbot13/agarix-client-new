import Socket, { IMapOffsets } from '../Socket/Socket';
import Controller from './TabsController';
import UICommunicationService from '../../communication/FrontAPI';
import { ChatAuthor } from '../../communication/Chat';

export interface ISpectateCoords {
  x: number,
  y: number
}

export default class FullmapController {
  private coordinates: Array<ISpectateCoords> = [];
  private sockets: Array<Socket> = [];
  private establishBegin: number = 0;

  public enabling: boolean = false;

  constructor(private tabsController: Controller) { 
    for (let y = 0, centerYFixed = 1519; y < 5; y++, centerYFixed += 1571 * 2) {
      for (let x = 1; x <= 5; x += 2) {
        this.coordinates.push({ x: 2535 * x, y: centerYFixed });
      }
    }
  }

  public disconnectAll(): void {
    for (let i = 0; i < this.sockets.length; i++) {
      this.sockets[i] && this.sockets[i].destroy();
    }

    this.sockets = [];
    this.enabling = false;
  }

  public disconnectByIndex(index: number): void {
    this.sockets[index] && this.sockets[index].destroy();
  }

  public connectByIndex(index: number): Promise<void | IMapOffsets> {
    return new Promise((resolve: any) => {
      this.sockets[index].init().then(() => {
        this.sockets[index].spectate(this.coordinates[index].x, this.coordinates[index].y);
        resolve();
      });
    }); 
  }

  public enable(i?: number): void {

    if (i === undefined) {
      if (!this.tabsController.topOneViewEnabled) {
        this.tabsController.connectTopOneTab().then(() => {
          this.enable();
          this.enabling = true;
        });

        return;
      } 

      this.establishBegin = Date.now();
      this.enabling = true;

      i = 0;
    }

    const { socketData, world } = this.tabsController;

    this.sockets[i] = new Socket(socketData, 'SPEC_TABS', world);

    this.sockets[i].init().then(() => {
      this.sockets[i].spectate(this.coordinates[i].x, this.coordinates[i].y);

      if (i < 14) {
        this.enable(++i);
      } else {

        this.sockets[i].onFullMapViewEnabled = () => {
          this.enabling = false;

          const time = ~~((Date.now() - this.establishBegin) / 1000);

          const message = `Full map view is established. (${time}s)`;

          UICommunicationService.sendChatGameMessage(message, ChatAuthor.Spectator);

        };
      }
    });

  }
}