import Food from '../../objects/Food';
import GameSettings from '../../Settings/Settings';
import World from '../World';
export default class FoodRenderer {
  
  constructor(private world: World) { }

  public render(food: Food): void {

    if (GameSettings.all.settings.game.performance.culling) {
      if (this.world.view.shouldObjectBeCulled(food.x, food.y, food.width)) {
        food.hide();
        return;
      }
    }

    const fullMapViewEnabled = GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map';

    if (fullMapViewEnabled && this.world.scene.master.gameMode.get() === ':party') {
      food.subtype === 'SPEC_TABS' ? food.show() : food.hide();
      return;
    }

    const topOneTabFood = true;
    const firstTabFood = true;
    const secondTabFood = true;

    const { firstTab, secondTab, topOneTab } = this.world.view;
    const { x, y, subtype } = food;
    let visible = false;

    // always render first tab
    if (subtype === 'FIRST_TAB' && firstTabFood) {

      // if first tabs food has collision with second tab, instantly animate it
      const secondTabHas = secondTab.hasInViewBounds(x, y) && secondTabFood;
      secondTabHas && food.show(true);

      // if second tabs food has collision with top one tab, instantly animate it
      const topOneTabHas = topOneTab.hasInViewBounds(x, y) && topOneTabFood;
      topOneTabHas && food.show(true);

      visible = true;

    }

    // check second tab for collision with first tab
    if (subtype === 'SECOND_TAB' && secondTabFood) {
      const firstTabHas = firstTab.hasInViewBounds(x, y) && firstTabFood;
      visible = !firstTabHas;
    }

    // check top one tab for collision with first and second tab
    if (subtype === 'TOP_ONE_TAB' && topOneTabFood) {
      const firstTabHas = firstTab.hasInViewBounds(x, y) && firstTabFood;
      const secondTabHas = secondTab.hasInViewBounds(x, y) && secondTabFood;

      // visible if none of tabs has
      visible = !firstTabHas && !secondTabHas;
    }

    visible ? food.show() : food.hide();
  }
}