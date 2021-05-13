import Stage from './Stage/Stage';
import TestCase from './TestCase';
import UICommunicationService from './communication/FrontAPI';
import Master from './Master';

console.clear();

const stage = new Stage();

const tryConnect = () => {
  let tries = 0;

  stage.connect().then(() => {
    setTimeout(() => UICommunicationService.setGameLoaderShown(false), 500);
  }).catch(() => {
    console.log('Error');
    UICommunicationService.setServerStatus('Down');
  });
}

export const initializeGame = async () => {
  window.Game = stage;
  window.Master = Master;

  if (window.location.hostname.includes('localhost')) {
    await stage.init();
    stage.world.view.mouse.zoomValue = 0.1;
    const testCase = new TestCase(stage);
    console.log(testCase);
    setTimeout(() => stage.unblurGameScene(true), 100);
  } else {
    UICommunicationService.setGameVersion();
    await Master.init();
    await stage.init();
    tryConnect();
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