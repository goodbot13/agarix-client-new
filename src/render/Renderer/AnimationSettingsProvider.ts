import * as PIXI from 'pixi.js';
import World from '../World';

export default class AnimationSettingsProvider {
  constructor (private world: World) { }
  
  public getAnimationSpeed(): number {
    return (this.world.settings.all.settings.game.gameplay.animationSpeed / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  public getFadeSpeed(): number {
    const { fadeSpeed } = this.world.settings.all.settings.game.cells;
  
    if (fadeSpeed === 0) {
      return 0;
    }
  
    return ((250 - fadeSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  public getSoakSpeed(): number {
    const { soakSpeed } = this.world.settings.all.settings.game.cells;
  
    if (soakSpeed === 0) {
      return 0;
    }
  
    return ((250 - soakSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
  }

  // the next two methods are usable for private servers where are a lot of ejected sprites
  // the more container size is, the faster animations is

  public getFadeSpeedForEjected(): number {
    const { fadeSpeed } = this.world.settings.all.settings.game.cells;
    let speedIncreaseMultiplier = 1;

    if (fadeSpeed === 0) {
      return 0;
    }

    // speed up animation if container contains a lot of sprites to remove faster and decrease lag spikes
    // if (this.world.ejected.children.length > 256) {
    //   speedIncreaseMultiplier = this.world.ejected.children.length / 128;
    // }

    return (((250 - fadeSpeed) / 1000) * speedIncreaseMultiplier) * PIXI.Ticker.shared.deltaTime;
  }

  public getSoakSpeedForEjected(): number {
    const { soakSpeed } = this.world.settings.all.settings.game.cells;
    let speedIncreaseMultiplier = 1;
  
    if (soakSpeed === 0) {
      return 0;
    }
    
    // speed up animation if container contains a lot of sprites to remove faster and decrease lag spikes
    // if (this.world.ejected.children.length > 256) {
    //   speedIncreaseMultiplier = this.world.ejected.children.length / 128;
    // }
  
    return (((250 - soakSpeed) / 1000) * speedIncreaseMultiplier) * PIXI.Ticker.shared.deltaTime;
  }
}