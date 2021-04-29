import Stage from './Stage/Stage';
import Cell from './objects/Cell/index';
import SkinsLoader from './utils/SkinsLoader';
import { Container } from 'pixi.js';
import Virus from './objects/Virus/Virus';

export default class TestCase {
  constructor(public stage: Stage) {
    this.emit();
  }

  private async emit() {
    const virus = new Virus({ x: 0, y: 0, r: 100 }, 'FIRST_TAB');
    this.stage.world.cells.addChild(virus);

    (window as any).virus = virus;
  }
}
