import { Container, utils } from "pixi.js";
import Cell from '../objects/Cell/index';
import { Location } from "../objects/types";
import Ogar from "../Ogar";
import World from "../render/World";
import GameSettings from "../Settings/Settings";
import { transformMinimapLocation } from "../utils/helpers";

export default class TeamPlayers extends Container {
  private buffer: Map<number, Cell>;

  constructor(private world: World) {
    super();

    this.zIndex = 0;

    this.buffer = new Map();
  }

  public changeCellShadowTexture(): void {
    this.buffer.forEach((cell) => (cell as Cell).changeShadowTexture())
  }

  public reset(): void {
    this.buffer.forEach((obj) => obj.destroy({ children: true }));
    this.buffer.clear();

    while (this.children.length > 0) {
      this.removeChildAt(0);
    }
  }

  public renderTick(): void {
    const { playerSize } = GameSettings.all.settings.theming.minimap;

    Ogar.firstTab.team.forEach((player) => {
      if (this.buffer.has(player.id)) {

        const cell = this.buffer.get(player.id);

        const location = transformMinimapLocation({ 
            x: player.position.x, 
            y: player.position.y, 
            r: 0 
          }, 
          this.world.view.firstTab.getShiftedMapOffsets(),
          true
        );

        cell.update({ x: location.x, y: location.y, r: playerSize / 2 });

        if (!player.alive) {
          cell.destroy({ children: true });
          this.removeChild(cell);
          this.buffer.delete(player.id);
        } else {
          cell.animate();
        }

      } else {

        if (!player.alive) {
          return;
        }

         const location = transformMinimapLocation({ 
            x: player.position.x, 
            y: player.position.y, 
            r: 0 
          }, 
          this.world.view.firstTab.getShiftedMapOffsets(),
          true
        );
        
        const cell = new Cell('FIRST_TAB', location, { red: 0, green: 0, blue: 0 }, player.nick, '', this.world);

        cell.setIsMinimapCell();
        cell.isTeam = true;
        cell.update({ x: location.x, y: location.y, r: playerSize / 2 });
        cell.cell.tint = utils.string2hex(player.color.cell);

        this.buffer.set(player.id, cell);
        this.addChild(cell);

      }
    });

    this.buffer.forEach((cell, key) => {
      if (!Ogar.firstTab.team.has(key)) {
        cell.destroy({ children: true });
        this.removeChild(cell);
        this.buffer.delete(key);
      }
    });
  }
}