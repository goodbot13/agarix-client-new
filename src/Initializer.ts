// @ts-nocheck
import Game from './index';
import TestCase from './TestCase';
import UICommunicationService from './communication/FrontAPI';

class Initializer {
  private game: Game;

  async start() {
    console.clear();

    if (window.location.hostname.includes('localhost')) {
      this.game = new Game();
      await this.game.init();
      
      this.game.world.view.mouse.zoomValue = 0.1;// @ts-ignore
      window.Game = this.game;
      const testCase = new TestCase(this.game);
      
      setTimeout(() => this.game.unblurGameScene(true), 100);
    } else {
      UICommunicationService.setGameVersion();
      this.game = new Game();
      await this.game.master.init();

      await this.game.init();
      
      window.Game = this.game;
    }
    
  }
}

const initializer = new Initializer();
initializer.start();