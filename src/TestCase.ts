import Stage from "./Stage/Stage";
import Cell from "./objects/Cell/index";
import SkinsLoader from "./utils/SkinsLoader";
import { Container } from "pixi.js";

export default class TestCase {
  constructor(public stage: Stage) {
    this.emit();
  }

  private async emit() {

  }
}