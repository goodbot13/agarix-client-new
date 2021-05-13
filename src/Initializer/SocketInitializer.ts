import Stage from "../Stage/Stage";
import UICommunicationService from '../communication/FrontAPI';

export default new class SocketInitializer {
  private stage: Stage = null;
  private times: number = 2;
  private timesDone: number = 0;

  constructor() { }

  public setStage(stage: Stage) {
    this.stage = stage;

    return this;
  }

  public try(times?: number) {
    if (times !== undefined) {
      this.times = times;
    }

    return this;
  }

  public start(): void {
    this.stage.connect().then((tokens) => {
      setTimeout(() => UICommunicationService.setGameLoaderShown(false), 1333);

      UICommunicationService.setToken(tokens.split('%')[0]);
      UICommunicationService.setServerToken(tokens.split('%')[1]);
    }).catch(() => {
      if (this.timesDone >= this.times) {
        setTimeout(() => UICommunicationService.setGameLoaderShown(false), 1333);

        UICommunicationService.setServerStatus('Down');
        UICommunicationService.setServerVersion('Unavailable');
      } else {
        this.timesDone++;
        this.start();
      }
    });
  }
}