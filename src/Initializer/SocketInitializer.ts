// import Stage from "../Stage/Stage";
// import UICommunicationService from '../communication/FrontAPI';
// import Logger from "../utils/Logger";

// export default new class SocketInitializer {
//   private stage: Stage = null;
//   private times: number = 1;
//   private timesDone: number = 0;
//   private logger: Logger = new Logger('SocketInitializer');

//   constructor() { }

//   public setStage(stage: Stage) {
//     this.stage = stage;

//     return this;
//   }

//   public try(times?: number) {
//     if (times !== undefined) {
//       this.times = times;
//     }
    
//     return this;
//   }

//   private reconnect(reason?: string): void {
//     if (this.timesDone >= this.times) {
      

//       UICommunicationService.setServerStatus('Down');
//       UICommunicationService.setServerVersion('Unavailable');
//     } else {
//       this.start();
//       this.logger.error(`Could not connect to server. Reason: ${reason} (attempt ${this.timesDone} of ${this.times})`);
//     }
//   }

//   public start(token?: string): void {
//     this.stage.connect(token, null, true).then((tokens) => {
//       setTimeout(() => UICommunicationService.setGameLoaderShown(false), 1333);

//       UICommunicationService.setToken(tokens.split('%')[0]);
//       UICommunicationService.setServerToken(tokens.split('%')[1]);
//     }).catch((reason) => {
//       this.timesDone++;
//       this.reconnect(reason);
//     });
//   }
// }