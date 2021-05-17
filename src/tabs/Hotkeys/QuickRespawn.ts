import Controller from "../Contollers/TabsController";
import UICommunicationService from "../../communication/FrontAPI";
import { ChatAuthor } from "../../communication/Chat";

const timeout = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}

export default class QuickRespawn {
  private firstTabTries: number = 0;
  private secondTabTries: number = 0;
  constructor(private controller: Controller) { }

  public async handle() {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {
      await this.controller.connectFirstPlayerTab();

      await timeout(100);
      
      try {
        await this.controller.spawnFirstTab();
        this.firstTabTries = 0;
      } catch {
        UICommunicationService.sendChatGameMessage(`Could not spawn (main attempt #${this.firstTabTries})`, ChatAuthor.QuickRespawn);
        this.firstTabTries++;
        this.handle();
      }

      this.controller.setFirstTabActive();
    } else {
      await this.controller.connectSecondPlayerTab();
      
      await timeout(100);
      
      try {
        await this.controller.spawnSecondTab();
        this.secondTabTries = 0;
      } catch {
        this.secondTabTries++;
        UICommunicationService.sendChatGameMessage(`Could not spawn (multi attempt #${this.secondTabTries})`, ChatAuthor.QuickRespawn);
        this.handle();
      }

      this.controller.setSecondTabActive();
    }
  }
}