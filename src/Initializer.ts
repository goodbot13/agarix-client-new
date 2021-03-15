import Stage from './Stage/Stage';
import TestCase from './TestCase';
import UICommunicationService from './communication/FrontAPI';
import Master from './Master';
import GameSettings from './Settings/Settings';

const initialize = async () => {
  console.clear();

  let stage: Stage = new Stage();

  window.Game = stage;
  window.Master = Master;

  if (window.location.hostname.includes('localhost')) {
    await stage.init();
    stage.world.view.mouse.zoomValue = 0.1;
    const testCase = new TestCase(stage);
    setTimeout(() => stage.unblurGameScene(true), 100);
  } else {
    UICommunicationService.setGameVersion();
    await Master.init();
    await stage.init();
  }
}

initialize();

declare global {
  interface Window {
    Game: Stage,
    Master: typeof Master
  }
}