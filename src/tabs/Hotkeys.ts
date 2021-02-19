import Globals from "../Globals";
import Ogar from "../Ogar";
import GameSettings from "../Settings/Settings";
import UICommunicationService from "../communication/FrontAPI";
import View from "../View";
import Controller from "./Contollers/TabsController";
import Emitter from "./Socket/Emitter";

class Hotkeys {
  private macroFeedInterval: any;
  private controller: Controller;
  private view: View;
  private ogar: Ogar;

  public firstTabSpawning: boolean = false;
  public secondTabSpawning: boolean = false;
  
  constructor(controller: Controller, view: View, ogar: Ogar) {
    this.controller = controller;
    this.view = view;
    this.ogar = ogar;
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

        // feed once without delay
        firstTabSocket.emitter.sendMousePosition();
        firstTabSocket.emitter.sendFeed();

        this.macroFeedInterval = setInterval(() => {
          firstTabSocket.emitter.sendMousePosition();
          firstTabSocket.emitter.sendFeed();
        }, 80);

      } else {

        // feed once without delay
        secondTabSocket.emitter.sendMousePosition();
        secondTabSocket.emitter.sendFeed();

        this.macroFeedInterval = setInterval(() => {
          secondTabSocket.emitter.sendMousePosition();
          secondTabSocket.emitter.sendFeed();
        }, 80);

      } 

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
      UICommunicationService.sendChatMessage('Could not disconnect main player tab.');
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
    const { firstTab, secondTab } = this.view;

    if (firstTab.isPlaying && currentFocusedTab === 'FIRST_TAB') {
      if (firstTabSocket.isPaused()) {
        firstTabSocket.resumeCell();
      } else {
        firstTabSocket.stopCell();
      }
    }

    if (secondTab.isPlaying && currentFocusedTab === 'SECOND_TAB') {
      if (secondTabSocket.isPaused()) {
        secondTabSocket.resumeCell();
      } else {
        secondTabSocket.stopCell();
      }
    }
  }

  public toggleCellHelpers(): void {
    
  }

  public toggleCellsSkins(): void {
    /* Settings.cells.allowSkins = !Settings.cells.allowSkins; */
  }

  public toggleMyCellStats(): void {
    /* Settings.cells.showMassMyCell = !Settings.cells.showMassMyCell;
    Settings.cells.showNickMyCell = !Settings.cells.showNickMyCell; */
  }

  public toggleCellRings(): void {
    /* Settings.cells.ringsEnabled = !Settings.cells.ringsEnabled; */
  }

  public switchTabs(): void {
    if (GameSettings.all.settings.game.multibox.enabled) {

      if (this.view.firstTab.isPlaying && this.view.secondTab.isPlaying) {

        // fix for inactive tab feeding
        clearInterval(this.macroFeedInterval);

        if (this.controller.currentFocusedTab === 'FIRST_TAB') {
          this.controller.setSecondTabActive();
        } else {
          this.controller.setFirstTabActive();
        }

        return;
      }

      if (this.view.firstTab.isPlaying) {

        if (!this.secondTabSpawning) {

          this.secondTabSpawning = true;

          UICommunicationService.sendChatMessage('Attempting to spawn second tab.');

          this.controller.spawnSecondTab().then(() => {
            this.controller.setSecondTabActive();
            this.secondTabSpawning = false;
          }).catch(() => {
            UICommunicationService.sendChatMessage('Second tab spawn failed.');
            this.secondTabSpawning = false;
          });

        }

        return;
      } 

      if (this.view.secondTab.isPlaying) {

        if (!this.firstTabSpawning) {

          this.firstTabSpawning = true;

          UICommunicationService.sendChatMessage('Attempting to spawn first tab.');
        
          this.controller.spawnFirstTab().then(() => {
            this.controller.setFirstTabActive();
            this.firstTabSpawning = false;
          }).catch(() => {
            UICommunicationService.sendChatMessage('First tab spawn failed.');
            this.firstTabSpawning = false;
          });

        }

        return;
      }
    }
  }

  public toggleFoodRender(): void {
    /* Settings.food.enabled = !Settings.food.enabled; */
  }

  public toggleFullmapViewRender(): void {
    Globals.fullMapViewRender = !Globals.fullMapViewRender;
  }

  public sendCommand(text: string): void { 
    this.ogar.firstTab.sendChatCommander(text);
  }
}

export default Hotkeys;