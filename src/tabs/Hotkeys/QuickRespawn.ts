import Controller from "../Contollers/TabsController";
import UICommunicationService from "../../communication/FrontAPI";
import { ChatAuthor } from "../../communication/Chat";
import GameSettings from '../../Settings/Settings';

const timeout = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}

export default class QuickRespawn {
  constructor(private controller: Controller) { }

  public async handle() {
    const { autoRespawnOnFail } = GameSettings.all.settings.game.gameplay;

    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      await this.controller.connectFirstPlayerTab();

      await timeout(100);
      
      try {
        await this.controller.spawnFirstTab();
      } catch {
        UICommunicationService.sendChatGameMessage(`Could not spawn (main)`, ChatAuthor.QuickRespawn);

        if (autoRespawnOnFail) {
          this.handle();
        }
      }

      this.controller.setFirstTabActive();
    } else {
      await this.controller.connectSecondPlayerTab();
      
      await timeout(100);
      
      try {
        await this.controller.spawnSecondTab();
      } catch {
        UICommunicationService.sendChatGameMessage(`Could not spawn (multi)`, ChatAuthor.QuickRespawn);
        
        if (autoRespawnOnFail) {
          this.handle();
        }
      }

      this.controller.setSecondTabActive();
    }
  }
}