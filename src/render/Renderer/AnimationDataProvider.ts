import GameSettings from '../../Settings/Settings';
import * as PIXI from 'pixi.js';

export const getAnimationSpeed = (): number => {
  return (GameSettings.all.settings.game.gameplay.animationSpeed / 1000) * PIXI.Ticker.shared.deltaTime;
}

export const getFadeSpeed = (): number => {
  const { fadeSpeed } = GameSettings.all.settings.game.cells;

  if (fadeSpeed === 0) {
    return 0;
  }

  return ((250 - fadeSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
}

export const getSoakSpeed = (): number => {
  const { soakSpeed } = GameSettings.all.settings.game.cells;

  if (soakSpeed === 0) {
    return 0;
  }

  return ((250 - soakSpeed) / 1000) * PIXI.Ticker.shared.deltaTime;
}