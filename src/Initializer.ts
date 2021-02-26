import Game from './index';
import TestCase from './TestCase';
import UICommunicationService from './communication/FrontAPI';
import Master from './Master';

class Initializer {
  private game: Game;

  async start() {
    console.clear();

    if (window.location.hostname.includes('localhost')) {
      this.game = new Game();
      await this.game.init();
      this.game.world.view.mouse.zoomValue = 0.1;
      const testCase = new TestCase(this.game);
      setTimeout(() => this.game.unblurGameScene(true), 100);
    } else {
      UICommunicationService.setGameVersion();
      this.game = new Game();
      await Master.init();
      await this.game.init();
    }

    (window as any).Game = this.game;
  }
}

const initializer = new Initializer();
initializer.start();