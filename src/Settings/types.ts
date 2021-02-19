import { RGB } from "../objects/types";

export namespace Tabs {
  export interface Tab {
    nick: string,
    skinUrl: string
  }
  
  export interface SettingsTabs {
    first: Tab,
    second: Tab
  }
}

export interface IMinimapSettings {
  render: boolean,
  width: number,
  height: number,
  backgroundColor: RGB,
  backgroundColorAlpha: number,
  drawPlayerViewport: boolean,
  drawTopOneViewport: boolean,
  drawGhostCells: boolean,
  ghostCellsColor: RGB,
  drawPlayerPosition: boolean,
  playerCellColor: RGB,
  playerCellStaticSize: number,
  playerViewportColor: RGB,
  playerViewportAlpha: number,
  topOneViewportColor: RGB,
  topOneViewportAlpha: number,
  drawRealPlayers: boolean,
  drawNicks: boolean,
  drawMass: boolean,
  drawMinSize: number,
  soakPerFrame: number,
  throttleValue: 1 | 2 | 3 | 4 | 5
}

export interface IGlobalsSettings {
  antialias: boolean
  antialiasLevel: 2 | 4 | 8 | 16,
  generateTextureDelay: number,
  devMode: boolean,
  fpsLockEnabled: boolean,
  fpsLockValue: 30 | 60 | 90 | 120 | 150 | 180 | 210 | 240,
  glowFilterType: 'Nyx-1' | 'Nyx-2',
  trimCanvas: boolean,
  preGenerateCellStats: boolean,
  textureLifetime: number,
  textureCheckInterval: number,
  texturesBufferSize: number,
  foodViewportInclude: boolean,
  zoomSpeed: number
}

export interface IVirusSettings {
  size: 512,
  borderWidth: number,
  borderColor: RGB,
  borderColorAlpha: number,
  color: RGB,
  colorAlpha: number,
  glowEnabled: boolean,
  glowColor: RGB,
  glowDistance: number,
  glowStrength: number,
  glowQuality: number,
  spinning: boolean,
}

export interface IFoodSettings {
  radius: number,
  canvasSize: 512 | 1024,
  color: RGB,
  colorAlpha: number,
  glowEnabled: boolean,
  glowColor: RGB,
  glowDistance: number,
  glowStrength: number,
  glowQuality: number,
  enabled: boolean,
  animationSpeed: number,
  performanceMode: boolean,
  topOneTabFood: boolean,
  firstTabFood: boolean,
  secondTabFood: boolean,
  bufferSize: number
}

export interface IMapSettings {
  size: 14142,
  backgroundImageSize: 2048 | 4096,
  bordersEnabled: boolean,
  bordersColor: RGB,
  bordersWidth: number,
  bordersRenderSize: 512 | 1024,
  animatedBorder: boolean,
  glowEnabled: boolean,
  glowDistance: number,
  glowStrength: number,
  glowColor: RGB,
  glowQuality: number,
  rounded: boolean,
  roundedValue: number,
  rgbBorder: boolean,
  backgroundImageEnabled: boolean,
  backgroundImageURL: string,
  secondBackgroundImageURL: string,
  secondBackgroundEnabled: boolean,
  globalBackgroundLiveEffectStrength: number,
  globalBackgroundLiveEffectEnabled: boolean,
  tintColor: RGB,
  liveEffectEnabled: boolean,
  liveEffectStrength: number,
  isLiveEffectStatic: boolean,
  backgroundDisplacementURL: string, 
  mapBackgroundColor: RGB
}

export interface ICellsSettings {
  size: 512 | 1024,
  spriteRender: boolean,
  oneColoredEnabled: boolean,
  oneColoredColor: RGB,
  colorDarken: number, 
  shadowEnabled: boolean,
  shadowColor: RGB,
  shadowDistance: number,
  shadowStrength: number,
  transparency: number,
  removeAnimation: boolean,
  removeAnimationStyle: 'Nyx' | 'Acim' | '2CL' | 'Yue',
  removeAnimationRatio: number, 
  removeAnimationOnSpecTabsHiddenRender: boolean,
  removeAnimationOnlyEaten: boolean,
  removeAnimationMinSize: number,
  removeAnimationDepthOffset: -3 | -2 | -1 | 0 | 1 | 2 | 3,
  ringsEnabled: boolean,
  ringsStyle: 'Acim' | '2CL' | 'Yue', 
  spinningRingsEnabled: boolean,
  animationSpeed: number,
  animationSoakRatio: number,
  autoHideInfo: true,
  autoHideInfoValue: number,
  massVisible: boolean,
  nameVisible: boolean,
  massRefreshRatio: number,
  outOfViewFadeSpeed: number,
  spawnAnimation: boolean,
  spawnAnimationStyle: 'Nyx' | 'Acim' | '2CL' | 'Yue',
  showMassMyCell: boolean,
  showNickMyCell: boolean,
  onlyMyCellRings: boolean,
  myShadowColor: RGB,
  oneColoredStatsColor: RGB,
  allowSkins: boolean,
  vanillaSkins: boolean,
}

export interface ISingleViewBox {
  enabled: boolean,
  tint: RGB,
  alpha: number
}

export interface IViewBox {
  firstTab: ISingleViewBox,
  secondTab: ISingleViewBox,
  topOneTab: ISingleViewBox,
  animationSpeed: number
}

export interface IMultiboxSettings {
  enabled: boolean,
  activeRingColor: RGB,
  ringStyle: 'Line' | 'Custom',
  ringLineWidth: number, 
  acitveCellColor: RGB,
  changeRingColor: boolean,
  changeCellColor: boolean,
  ringFadeSpeed: number,
  cellFadeSpeed: number,
  disabledSkins: boolean,
  cellsStaticColor: RGB,
  cellsStaticColorEnabled: boolean,
}

type TTabLogin = 'GOOGLE' | 'FACEBOOK';
export interface ILoginSettings {
  firstTab: TTabLogin,
  secondTab: TTabLogin
}