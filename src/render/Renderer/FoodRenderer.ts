import Food from '../../objects/Food';
import GameSettings from '../../Settings/Settings';
import World from '../World';

export default class FoodRenderer {
  
  constructor(private world: World) { }

  public render(food: Food): void {

    if (GameSettings.all.settings.game.performance.culling) {
      if (this.world.view.shouldObjectBeCulled(food.x, food.y, food.width / 2)) {
        food.culled = true;
        food.renderable = false;
        return;
      } else {
        food.culled = false;
        food.renderable = true;
      }
    }

    if (GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map') {
      food.subtype === 'SPEC_TABS' ? food.show() : food.hide();
      return;
    }

    const { firstTabEnabled, secondTabEnabled, topOneTabEnabled } = GameSettings.all.settings.theming.food;
    const { firstTab, secondTab, topOneTab } = this.world.view;
    const { x, y, subtype } = food;
    let visible = false;

    // always render first tab
    if (subtype === 'FIRST_TAB' && firstTabEnabled) {

      // if first tabs food has collision with second tab, instantly animate it
      const secondTabHas = secondTab.hasInViewBounds(x, y) && secondTabEnabled;
      secondTabHas && food.show(true);

      // if second tabs food has collision with top one tab, instantly animate it
      const topOneTabHas = topOneTab.hasInViewBounds(x, y) && topOneTabEnabled;
      topOneTabHas && food.show(true);

      visible = true;

    }

    // check second tab for collision with first tab
    if (subtype === 'SECOND_TAB' && secondTabEnabled) {
      const firstTabHas = firstTab.hasInViewBounds(x, y) && firstTabEnabled;
      visible = !firstTabHas;
    }

    // check top one tab for collision with first and second tab
    if (subtype === 'TOP_ONE_TAB' && topOneTabEnabled) {
      const firstTabHas = firstTab.hasInViewBounds(x, y) && firstTabEnabled;
      const secondTabHas = secondTab.hasInViewBounds(x, y) && secondTabEnabled;

      // visible if none of tabs has
      visible = !firstTabHas && !secondTabHas;
    }

    visible ? food.show() : food.hide();
  }
}