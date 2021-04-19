import { RGB } from '../../objects/types';

export interface IState {
  settings: {
    game: {
      cells: IGameCellsState,
      effects: IGameEffectsState,
      gameplay: IGameGameplayState,
      minimap: IGameMinimapState,
      multibox: IGameMultiboxState,
      performance: IGamePerformanceState,
    },
    theming: {
      cells: IThemingCellsState,
      food: IThemingFoodState,
      map: IThemingMapState,
      minimap: IThemingMinimapState,
      multibox: IThemingMultiboxState,
      viruses: IThemingVirusesState
    }
  }, 
  game: IGameState,
  profiles: IProfilesState & IProfilesStorageState
}

export type SkinsType = 'Disabled' | 'Custom' | 'Vanilla' | 'All';
export type RingsType = 'Disabled' | '2CL' | 'Acimazis' | 'Yue';
export type ShadowType = 'Disabled' | 'Only me' | 'All';

export type CellRemoveAnimationType = 'Disabled' | 'Default' | '2CL' | 'Yue' | 'Acimazis';
export type SpawnAnimationType = 'Disabled' | 'Default' | '2CL' | 'Yue' | 'Acimazis';

export type CameraStyleType = 'Default' | 'Smooth';
export type SpectatorModeType = 'Disabled' | 'Top one' | 'Full map';
export type ViewportType = 'Disabled' | 'Main tab' | 'Second tab' | 'Top one tab' | 'All';

export type RenderModeType = 'Default (CPU)' | 'GPU (Pixi)';
export type GlowFilterShaderType = 'Canvas' | 'GPU-1' | 'GPU-2';
export type FpsLockType = '30' | '60' | '120'| '144' | '240' | 'Screen-hz';

export type MapBorderType = 'Disabled' | 'Common' | 'Common (anim)' | 'RGB' | 'RGB (anim)';
export type MapLiveEffectStrengthType = 'Disabled' | '1' | '2' | '3' | '4' | '5';

export type MultiboxRingStyleType = 'Author' | 'Line';

export type VirusMassType = 'Disabled' | 'Full mass' | 'Shots amount' | 'Fill circle';

export type GameModeTypes = ':party' | ':ffa' | ':battleroyale' | ':teams' | ':experimental';
export type GameServerLocationTypes = 'South America' | 'China' | 'Europe' | 'East Asia' | 'Russia' | 'Oceania' | 'Turkey' | 'North America';
export type GameSelectedGameTokenTypes = 'PARTY' | 'SERVER';

export interface IGameCellsState {
  mass: boolean,
  nicks: boolean,
  myMass: boolean,
  myNick: boolean,
  autoHideMassAndNicks: boolean,
  shortMass: boolean,
  massUpdateDelay: number,
  skinsType: SkinsType,
  ringsType: RingsType,
  ringsSpinning: boolean,
  soakSpeed: number,
  fadeSpeed: number,
  oneColored: boolean,
  shadow: ShadowType
}

export interface IGameEffectsState {
  cellRemoveAnimation: CellRemoveAnimationType,
  cellRemoveAnimationForHiddenSpectator: boolean,
  spawnAnimation: SpawnAnimationType,
  wtfRgbMode: boolean
}

export interface IGameGameplayState {
  animationSpeed: number,
  zoomSpeed: number,
  cameraSpeed: number,
  cameraStyle: CameraStyleType,
  spectatorMode: SpectatorModeType,
  viewport: ViewportType,
}

export interface IGameMinimapState {
  enabled: boolean,
  viewport: ViewportType,
  ghostCells: boolean,
  realPlayersCells: boolean,
  mass: boolean,
  nicks: boolean,
  playerPosition: boolean
}

export interface IGameMultiboxState {
  enabled: boolean,
  ring: boolean,
  changeRingColor: boolean,
  changeCellColor: boolean,
  hideOwnSkins: boolean,
  staticColor: boolean
}

export interface IGamePerformanceState {
  renderMode: RenderModeType,
  antialiasing: boolean,
  culling: boolean,
  foodPerformanceMode: boolean,
  glowFilterShaderType: GlowFilterShaderType,
  fpsLockType: FpsLockType
}

export interface IThemingCellsState {
  oneColoredColor: RGB,
  oneColoredStatsColor: RGB,
  shadowColor: RGB,
  myShadowColor: RGB,
  shadowDistance: number,
  myShadowDistance: number,
  shadowStrength: number,
  myShadowStrength: number,
  transparency: number,
  colorLighten: number,
  adaptiveShadow: boolean
}

export interface IThemingFoodState {
  enabled: boolean,
  firstTabEnabled: boolean,
  secondTabEnabled: boolean,
  topOneTabEnabled: boolean,
  size: number,
  color: RGB,
  glow: boolean,
  glowColor: RGB,
  glowDistance: number,
  glowStrength: number,
  crisp: boolean,
}

export interface IThemingMapState {
  borderType: MapBorderType,
  borderRoundness: number,
  borderWidth: number,
  borderColor: RGB,
  borderGlow: boolean,
  borderGlowColor: RGB,
  borderGlowDistance: number,
  borderGlowStrength: number,
  backgroundTint: RGB,
  backgroundImage: boolean,
  backgroundImageUrl: string,
  backgroundImageLiveEffectStrength: MapLiveEffectStrengthType,
  globalBackgroundImage: boolean,
  globalBackgroundImageUrl: string,
  globalBackgroundImageTint: RGB,
  globalBackgroundImageLiveEffectStrength: MapLiveEffectStrengthType
}

export interface IThemingMinimapState {
  backgroundColor: RGB,
  size: number,
  myViewportColor: RGB,
  topOneViewportColor: RGB,
  playerSize: number,
  playerColor: RGB,
  ghostCellsColor: RGB
}

export interface IThemingMultiboxState {
  ringStyle: MultiboxRingStyleType,
  linedRingSize: number,
  initialRingColor: RGB,
  focusedRingColor: RGB,
  initialStaticCellColor: RGB,
  focusedStaticCellColor: RGB
}

export interface IThemingVirusesState {
  color: RGB,
  borderWidth: number,
  borderColor: RGB,
  glow: boolean,
  glowColor: RGB,
  glowDistance: number,
  glowStrength: number,
  transparency: number,
  massType: VirusMassType,
  fillCircleColor: RGB,
}

export interface IGameServer {
  location: GameServerLocationTypes,
  playersAmount: number,
}

export interface IGameState {
  servers: Array<IGameServer>,
  currentServerIndex: number,
  mode: GameModeTypes,
  tag: string,
  token: string,
  gameServerToken: string,
  selectedGameTokenType: GameSelectedGameTokenTypes
}

export interface IProfilesState {
  leftProfileNick: string,
  leftProfileSkinUrl: string,
  rightProfileNick: string,
  rightProfileSkinUrl: string,
  tag: string,
  
}

export interface IProfile {
  nick: string,
  skinUrl: string,
  tag: string
}

export type TLoginType = 'FACEBOOK' | 'GOOGLE';

export interface IProfilesStorageState {
  leftProfiles: Array<IProfile>,
  rightProfiles: Array<IProfile>,
  leftSelectedIndex: number,
  rightSelectedIndex: number,
  leftProfileLoginType: TLoginType,
  rightProfileLoginType: TLoginType
}