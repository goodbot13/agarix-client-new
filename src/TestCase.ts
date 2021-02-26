import Stage from ".";
import Cell from "./objects/Cell/index";
import SkinsLoader from "./utils/SkinsLoader";

export default class TestCase {
  private Game: Stage;

  constructor(Game: Stage) {
    this.Game = Game;
    this.emit();
  }

  private async emit() {

    const cell = new Cell('FIRST_TAB', { x: 0, y: 0, r: 1000 }, { red: 0, green: 0, blue: 0}, 'Nyx', '', this.Game.world);
    await SkinsLoader.load('https://i.imgur.com/YHUY0GK.png');

    this.Game.foodVirusCellContainer.alpha = 1;
    cell.setIsVisible(true);
    cell.setPlayerCell('Nyx', SkinsLoader.getTextureByUrl('https://i.imgur.com/YHUY0GK.png'))
    this.Game.world.cells.addChild(cell);
    (window as any).xxx = cell;

    this.Game.app.ticker.add(() => {
      cell.animate();
    });
  }
}