import Globals from "../Globals";
import GameSettings from "../Settings/Settings";
import UICommunicationService from "../communication/FrontAPI";
import Controller from "./Contollers/TabsController";
import Emitter from "./Socket/Emitter";
import PlayerState from "../states/PlayerState";
import Ogar from "../Ogar";

class Hotkeys implements IGameAPIHotkeys {
  private macroFeedInterval: any;
  private controller: Controller;
  
  constructor(controller: Controller) {
    this.controller = controller;
    (window as any).GameAPI.hotkeys = this;
  }

  private splitTimes(times: number, emitter: Emitter) {
    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        emitter.sendMousePosition(true);
        emitter.sendSplit();
      }, i * 41);
    }
  }

  public feed(): void {
    const { firstTabSocket, currentFocusedTab } = this.controller;

    if (currentFocusedTab === 'FIRST_TAB') {
      firstTabSocket.emitter.sendMousePosition();
      firstTabSocket.emitter.sendFeed();
    } else {
      firstTabSocket.emitter.sendMousePosition();
      firstTabSocket.emitter.sendFeed();
    }
  }

  public macroFeed(): void {
    const { firstTabSocket, secondTabSocket, currentFocusedTab } = this.controller;

    if (!this.macroFeedInterval) {
      if (currentFocusedTab === 'FIRST_TAB') {
        firstTabSocket.emitter.sendMousePosition();
        firstTabSocket.emitter.sendFeed();

      } else {
        secondTabSocket.emitter.sendMousePosition();
        secondTabSocket.emitter.sendFeed();
      } 

      this.macroFeedInterval = setInterval(() => {
        if (currentFocusedTab === 'FIRST_TAB') {
          firstTabSocket.emitter.sendMousePosition();
          firstTabSocket.emitter.sendFeed();
        } else {
          secondTabSocket.emitter.sendMousePosition();
          secondTabSocket.emitter.sendFeed();
        }
      }, 80);
    }
  }

  public stopFeed(): void {
    clearTimeout(this.macroFeedInterval);
    this.macroFeedInterval = null;
  }

  public split(): void {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      this.splitTimes(1, this.controller.firstTabSocket.emitter);
    } else {
      this.splitTimes(1, this.controller.secondTabSocket.emitter);
    }
  }

  public doubleSplit(): void {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      this.splitTimes(2, this.controller.firstTabSocket.emitter);
    } else {
      this.splitTimes(2, this.controller.secondTabSocket.emitter);
    }
  }

  public tripleSplit(): void {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      this.splitTimes(3, this.controller.firstTabSocket.emitter);
    } else {
      this.splitTimes(3, this.controller.secondTabSocket.emitter);
    }
  }

  public split16(): void {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      this.splitTimes(4, this.controller.firstTabSocket.emitter);
    } else {
      this.splitTimes(4, this.controller.secondTabSocket.emitter);
    }
  }

  public async quickRespawn(): Promise<any> {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      this.controller.disconnectFirstTab();

      await this.controller.connectFirstPlayerTab();
      await this.controller.spawnFirstTab();
      this.controller.setFirstTabActive();
    } else {
      this.controller.disconnectSecondTab();

      await this.controller.connectSecondPlayerTab();
      await this.controller.spawnSecondTab();
      this.controller.setSecondTabActive();
    }
  }

  // toggle
  public pauseCell(): void {
    const { firstTabSocket, secondTabSocket, currentFocusedTab } = this.controller;

    if (PlayerState.first.playing && currentFocusedTab === 'FIRST_TAB') {
      if (firstTabSocket.isPaused()) {
        firstTabSocket.resumeCell();
      } else {
        firstTabSocket.stopCell();
      }
    }

    if (PlayerState.second.playing && currentFocusedTab === 'SECOND_TAB') {
      if (secondTabSocket.isPaused()) {
        secondTabSocket.resumeCell();
      } else {
        secondTabSocket.stopCell();
      }
    }
  }

  public toggleCellHelpers(): void {
    
  }

  public toggleCellSkins(): void {
    /* Settings.cells.allowSkins = !Settings.cells.allowSkins; */
  }

  public toggleMyCellStats(): void {
    /* Settings.cells.showMassMyCell = !Settings.cells.showMassMyCell;
    Settings.cells.showNickMyCell = !Settings.cells.showNickMyCell; */
  }

  public toggleCellRings(): void {
    /* if (GameSettings.all.settings.game.cells.ringsType) */
  }

  public switchTabs(): void {
    if (!GameSettings.all.settings.game.multibox.enabled) {
      return;
    }


    if (PlayerState.first.playing && PlayerState.second.playing) {

      if (this.controller.currentFocusedTab === 'FIRST_TAB') {
        this.controller.setSecondTabActive();

        if (this.macroFeedInterval) {
          this.stopFeed();
          this.macroFeed();
        }
      } else {
        this.controller.setFirstTabActive();

        if (this.macroFeedInterval) {
          this.stopFeed();
          this.macroFeed();
        }
      }

      return;
    }

    if (PlayerState.first.playing) {

      if (!PlayerState.second.spawning) {
        PlayerState.second.spawning = true;
        UICommunicationService.sendChatGameMessage('Attempting to spawn second tab.');
      
        this.controller.spawnSecondTab().then(() => {
          this.controller.setSecondTabActive();
          PlayerState.second.spawning = false;
          PlayerState.second.shouldBeReconnected = false;
        }).catch(() => {
          UICommunicationService.sendChatGameMessage('Second tab spawn failed.');
          PlayerState.second.spawning = false;
          PlayerState.second.shouldBeReconnected = false;
        });
      } else {
        if (PlayerState.second.shouldBeReconnected) {
          UICommunicationService.sendChatGameMessage('Reconnecting second tab.');
          PlayerState.second.shouldBeReconnected = false;

          this.controller.disconnectSecondTab();
          this.controller.connectSecondPlayerTab().then(() => {
            PlayerState.second.spawning = true;
            UICommunicationService.sendChatGameMessage('Attempting to spawn second tab.');

            this.controller.spawnSecondTab().then(() => {
              this.controller.setSecondTabActive();
              PlayerState.second.spawning = false;
            });
          });
        } else {
          UICommunicationService.sendChatGameMessage('Second tab is already attempting to spawn. Press again to reconnect.');
          PlayerState.second.shouldBeReconnected = true;
        }
      }

    } 

    if (PlayerState.second.playing) {

      if (!PlayerState.first.spawning) {
        PlayerState.first.spawning = true;
        UICommunicationService.sendChatGameMessage('Attempting to spawn first tab.');
      
        this.controller.spawnFirstTab().then(() => {
          this.controller.setFirstTabActive();
          PlayerState.first.spawning = false;
          PlayerState.first.shouldBeReconnected = false;
        }).catch(() => {
          UICommunicationService.sendChatGameMessage('First tab spawn failed.');
          PlayerState.first.spawning = false;
          PlayerState.first.shouldBeReconnected = false;
        });
      } else {
        if (PlayerState.first.shouldBeReconnected) {
          UICommunicationService.sendChatGameMessage('Reconnecting first tab.');
          PlayerState.first.shouldBeReconnected = false;

          this.controller.disconnectFirstTab();
          this.controller.connectFirstPlayerTab().then(() => {
            PlayerState.first.spawning = true;
            UICommunicationService.sendChatGameMessage('Attempting to spawn first tab.');

            this.controller.spawnFirstTab().then(() => {
              this.controller.setFirstTabActive();
              PlayerState.first.spawning = false;
            });
          });
        } else {
          UICommunicationService.sendChatGameMessage('First tab is already attempting to spawn. Press again to reconnect.');
          PlayerState.first.shouldBeReconnected = true;
        }
        
      }

      return;
    }
  }

  public toggleFullmapViewRender(): void {
    Globals.fullMapViewRender = !Globals.fullMapViewRender;
  }

  public sendCommand(text: string): void { 
    Ogar.firstTab.sendChatCommander(text);
  }
}

export default Hotkeys;

interface IGameAPIHotkeys {
  sendCommand(text: string): void,
  toggleFullmapViewRender(): void,
  switchTabs(): void,
  toggleCellRings(): void,
  toggleMyCellStats(): void,
  toggleCellSkins(): void,
  toggleCellHelpers(): void,
  pauseCell(): void,
  quickRespawn(): Promise<any>,
  split16(): void,
  tripleSplit(): void,
  doubleSplit(): void,
  split(): void,
  stopFeed(): void,
  macroFeed(): void,
  feed(): void,
}