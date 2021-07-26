import Controller from "../Contollers/TabsController";
import UICommunicationService from "../../communication/FrontAPI";
import { ChatAuthor } from "../../communication/Chat";
import GameSettings from '../../Settings/Settings';
import Logger from "../../utils/Logger";
import { SOCKET_CONNECTION_REJECT } from "../Socket/types";
import { TabType } from "../Socket/Socket";

const timeout = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}

export default class QuickRespawn {
  private logger: Logger = new Logger('QuickRespawn');

  constructor(private controller: Controller) { }

  private spawn(tabType: TabType): void {
    const { autoRespawnOnFail } = GameSettings.all.settings.game.gameplay;

    switch (tabType) {
      case 'FIRST_TAB':
        try {
          this.controller.spawnFirstTab();
          this.controller.setFirstTabActive();
        } catch (reason) {
          UICommunicationService.sendChatGameMessage(`Could not spawn (main)`, ChatAuthor.QuickRespawn);

          if (autoRespawnOnFail) {
            this.handle();
          }
        }

        break;

      case 'SECOND_TAB':
        try {
          this.controller.spawnSecondTab();
          this.controller.setSecondTabActive();
        } catch (reason) {
          UICommunicationService.sendChatGameMessage(`Could not spawn (multi)`, ChatAuthor.QuickRespawn);

          if (autoRespawnOnFail) {
            this.handle();
          }
        }

        break;
    }
  }

  public async handle() {
    if (this.controller.currentFocusedTab === 'FIRST_TAB') {

      try {
        await this.controller.connectFirstPlayerTab();
      } catch (reason) {
        if (reason === SOCKET_CONNECTION_REJECT.NO_RESPONSE_FROM_SERVER) {
          this.logger.error(`Could not connect to server. Reason: ${reason}`);

          return false;
        }
      }

      await timeout(100);

      this.spawn('FIRST_TAB');

    } else {

      try {
        await this.controller.connectSecondPlayerTab();
      } catch (reason) {
        if (reason === SOCKET_CONNECTION_REJECT.NO_RESPONSE_FROM_SERVER) {
          this.logger.error(`Could not connect to server. Reason: ${reason}`);
          return false;
        }
      }

      await timeout(100);

      this.spawn('SECOND_TAB');

    }
  }
}