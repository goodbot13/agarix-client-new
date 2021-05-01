import Cell from '../../objects/Cell/index';
import RemoveAnimation from '../../objects/RemoveAnimation';
import Virus from '../../objects/Virus/Virus';
import World from '../World';
import GameSettings from '../../Settings/Settings';
import PlayerState from '../../states/PlayerState';
import SettingsState from '../../states/SettingsState';
import SpawnAnimation from '../../objects/SpawnAnimation';

export default class CellsRenderer {

  constructor(private world: World) { }

  private checkCellRender(cell: Cell | Virus, visible: boolean): Array<boolean> {
    const { firstTab, secondTab } = this.world.view;
    const { type, x, y } = cell;
    let isPlayerCell = false;

    if (PlayerState.first.playing && firstTab.hasInViewBounds(x, y)) {
      visible = false;
    } 
    
    if (PlayerState.second.playing && secondTab.hasInViewBounds(x, y)) {
      visible = false;
    }

    if (PlayerState.first.playing && type === 'CELL' && this.world.playerCells.isFirstTab(cell as Cell)) {
      visible = false;
      isPlayerCell = true;
    }
    
    if (PlayerState.second.playing && type === 'CELL' && this.world.playerCells.isSecondTab(cell as Cell)) {
      visible = false;
      isPlayerCell = true;
    }

    return [visible, isPlayerCell];
  }

  public render(cell: Cell | Virus | RemoveAnimation): void {
    if (GameSettings.all.settings.game.performance.culling) {
      if (this.world.view.shouldObjectBeCulled(cell.x, cell.y, cell.width / 2)) {

        if (cell.type === 'CELL') {
          (cell as Cell).culled = true;
          (cell as Cell).renderable = (cell as Cell).visible = false;

          return;
        } else if (cell.type === 'VIRUS') {
          (cell as Virus).renderable = (cell as Cell).visible = false;

          return;
        } else if (cell.type === 'REMOVE_ANIMATION' || cell.type === 'SPAWN_ANIMATION') {
          (cell as RemoveAnimation | SpawnAnimation).renderable = false;
          (cell as RemoveAnimation | SpawnAnimation).visible = false;

          return;
        }
        
      } else {
        (cell as Cell).culled = false;
        (cell as Cell).renderable = (cell as Cell).visible = true;
      }
    }
    // if cell subtype is TOP_ONE_TAB or SPEC_TABS and it is a player cell
    // its visibility should be immediately set to false 
    // (we dont have to wait until its opacity slowly goes down - it will make it look ugly)

    const fullMapViewEnabled = GameSettings.all.settings.game.gameplay.spectatorMode === 'Full map';
    const topOneViewEnabled = GameSettings.all.settings.game.gameplay.spectatorMode === 'Top one';

    const { subtype, type, x, y } = cell;
    const { firstTab, secondTab, topOneTab } = this.world.view;

    // only triggers if top one view is enabled or full map view is enabled
    if (subtype === 'TOP_ONE_TAB') {
      if (type === 'VIRUS' || type === 'REMOVE_ANIMATION') {
        cell.setIsVisible(!fullMapViewEnabled);
        cell.visible = !fullMapViewEnabled;
      } else {
        const [visible, isPlayerCell] = this.checkCellRender(cell as Cell | Virus, true);
        cell.visible = isPlayerCell ? false : true;
        cell.setIsVisible(visible);
      }
    }

    // only triggers if full map view is enabled
    if (subtype === 'SPEC_TABS') {
      if (type === 'CELL') {
        const [visible, isPlayerCell] = this.checkCellRender(cell as Cell | Virus, true);
        cell.visible = isPlayerCell ? false : true;  
        cell.setIsVisible(visible);

        if (visible) {
          if (topOneTab.hasInViewBounds(x, y)) {
            cell.setIsVisible(false);
          } else {
            cell.setIsVisible(true);
          }
        }
      }
    }

    // only triggers if first tab or second tab is connected
    if (subtype === 'FIRST_TAB' || subtype === 'SECOND_TAB') {
      let visible = true;

      // first tab
      if (subtype === 'FIRST_TAB' && type === 'CELL') {
        if (this.world.playerCells.isSecondTab(cell as Cell)) {
          visible = false;
        }/*  else if (!PlayerState.first.playing) {
          visible = false;
        } */
      }

      // second tab
      if (subtype === 'SECOND_TAB' && type === 'CELL') {
        if (this.world.playerCells.isFirstTab(cell as Cell)) {
          visible = false;
        } /* else if (!PlayerState.second.playing) {
          visible = false;
        } */
      }

      if (type === 'VIRUS') {
        if (fullMapViewEnabled) {
          visible = false;
        } else if (GameSettings.all.settings.game.multibox.enabled) {
          if (PlayerState.first.playing && PlayerState.second.playing) {
            if (subtype === 'SECOND_TAB') {
              visible = !firstTab.hasInViewBounds(x, y);
            }

            if (topOneViewEnabled && visible) {
              visible = !topOneTab.hasInViewBounds(x, y);
            }
          } else {
            if (subtype === 'FIRST_TAB') {
              visible = PlayerState.first.playing;
            }
  
            if (subtype === 'SECOND_TAB') {
              visible = PlayerState.second.playing;
            }
          }
        } else if (topOneViewEnabled) {
          visible = !topOneTab.hasInViewBounds(x, y);
        } else {
          visible = true;
        }
      }

      if (type === 'REMOVE_ANIMATION' && fullMapViewEnabled) {
        visible = false;
      }

      cell.visible = visible; 
      cell.setIsVisible(visible);
    }

    if (fullMapViewEnabled && !SettingsState.fullMapViewRender) {
      let visible = cell.isVisible;

      if (type === 'VIRUS' && subtype === 'SPEC_TABS') {
        visible = true;
      } else if (type === 'REMOVE_ANIMATION' && subtype === 'SPEC_TABS') {
        visible = GameSettings.all.settings.game.effects.cellRemoveAnimationForHiddenSpectator;
      } else if (subtype === 'TOP_ONE_TAB' || subtype === 'SPEC_TABS') {
        if (type === 'CELL') {
          visible = false;
        }
      } else if (type === 'SPAWN_ANIMATION') {
        visible = true;
      }

      if (!GameSettings.all.settings.game.multibox.enabled) {
        if (subtype === 'FIRST_TAB') {
          visible = true;
        }
      } 

      if (subtype === 'FIRST_TAB' && type === 'VIRUS') {
        visible = false;
        cell.visible = false;
      }

      if (type === 'VIRUS' || type === 'CELL') {
        cell.setIsVisible(visible);
      } else {
        cell.visible = visible;
      }
    }
  }
}