import * as PIXI from 'pixi.js';

export const getAnimationSpeed = (): number => {
  return ((window as any).GameSettings.all.settings.game.gameplay.animationSpeed / 1000) * PIXI.Ticker.shared.deltaTime;
}

export const getFadeSpeed = (): number => {
  const { fadeSpeed } = (window as any).GameSettings.all.settings.game.cells;

  if (fadeSpeed === 0) {
    return 0;
  }

  return ((250 - fadeSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
}

export const getSoakSpeed = (): number => {
  const { soakSpeed } = (window as any).GameSettings.all.settings.game.cells;

  if (soakSpeed === 0) {
    return 0;
  }

  return ((250 - soakSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
}

// the next two methods are usable for private servers where are a lot of ejected sprites
// the more containerSize is, the faster animations is

export const getFadeSpeedForEjected = (containerSize: number): number => {
  const { fadeSpeed } = (window as any).GameSettings.all.settings.game.cells;
  let speedIncreaseMultiplier = 1;

  if (fadeSpeed === 0) {
    return 0;
  }

  // speed up animation if container contains a lot of sprites to remove faster and decrease lag spikes
  if (containerSize > 256) {
    speedIncreaseMultiplier = containerSize / 128;
  }

  return (((250 - fadeSpeed) / 1000) * speedIncreaseMultiplier) * PIXI.Ticker.shared.deltaTime;
}

export const getSoakSpeedForEjected = (containerSize: number): number => {
  const { soakSpeed } = (window as any).GameSettings.all.settings.game.cells;
  let speedIncreaseMultiplier = 1;

  if (soakSpeed === 0) {
    return 0;
  }
  
  // speed up animation if container contains a lot of sprites to remove faster and decrease lag spikes
  if (containerSize > 256) {
    speedIncreaseMultiplier = containerSize / 128;
  }

  return (((250 - soakSpeed) / 1000) * speedIncreaseMultiplier) * PIXI.Ticker.shared.deltaTime;
}