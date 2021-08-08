import Stage from '../Stage/Stage';
import TestCase from '../TestCase';
import UICommunicationService from '../communication/FrontAPI';
import Master from '../Master';

const stage = new Stage();

export const initializeGame = async () => {
  window.Game = stage;

  if (window.location.hostname.includes('localhost')) {
    await stage.init();

    stage.world.view.mouse.zoomValue = 0.1;

    const testCase = new TestCase(stage);

    setTimeout(() => stage.unblurGameScene(true), 100);
  } else {
    UICommunicationService.setGameVersion();

    await stage.init();
    
    setTimeout(() => UICommunicationService.setGameLoaderShown(false), 0);

    await stage.master.init();
  }
}

window.GameAPI.init = () => initializeGame();

if (window.location.hostname.includes('localhost')) {
  initializeGame();
}

declare global {
  interface Window {
    Game: Stage,
    Master: typeof Master
  }
}