import { RGB } from '../../objects/types';

const initStorage: IState = {
  settings: {
    game: {
      cells: {
        mass: true,
        nicks: true,
        myMass: true,
        myNick: true,
        autoHideMassAndNicks: true,
        skinsType: 'All',
        ringsType: 'Disabled',
        ringsSpinning: true,
        soakSpeed: '1',
        fadeSpeed: '2',
        oneColored: false,
        shadow: 'All'
      },
      effects: {
        cellRemoveAnimation: 'Default',
        cellRemoveAnimationForHiddenSpectator: false,
        spawnAnimation: 'Acimazis',
        wtfRgbMode: false
      },
      gameplay: {
        animationSpeed: 3,
        zoomSpeed: 5,
        cameraSpeed: 5,
        cameraStyle: 'Default',
        spectatorMode: 'Disabled',
        viewport: 'Disabled'
      },
      minimap: {
        enabled: true,
        viewport: 'Disabled',
        ghostCells: true,
        realPlayersCells: false,
        mass: false,
        nicks: true,
        playerPosition: true
      },
      multibox: {
        enabled: false,
        ring: true,
        changeRingColor: true,
        changeCellColor: false,
        hideOwnSkins: true,
        staticColor: true
      },
      performance: {
        renderMode: 'GPU (Pixi)',
        antialiasing: false,
        foodPerformanceMode: false,
        glowFilterShaderType: 'GPU-1',
        fpsLockType: 'Screen-hz',
        culling: false
      }
    },
    theming: {
      cells: {
        oneColoredColor: { red: 240, green: 240, blue: 240 },
        oneColoredStatsColor: { red: 0, green: 0, blue: 0 },
        shadowColor: { red: 0, green: 0, blue: 0 },
        myShadowColor: { red: 0, green: 0, blue: 0 },
        shadowDistance: 10,
        shadowStrength: 2,
        transparency: 0.98,
        colorLighten: 110
      }, 
      food: {
        size: 16,
        color: { red: 255, green: 255, blue: 255 },
        glow: true,
        glowColor: { red: 0, green: 200, blue: 128 },
        glowDistance: 90,
        glowStrength: 9,
        crisp: true
      },
      map: {
        borderType: 'Common',
        borderRoundness: 60,
        borderWidth: 25,
        borderColor: { red: 0, green: 0, blue: 0 },
        borderGlow: true,
        borderGlowColor: { red: 0, green: 0, blue: 0 },
        borderGlowDistance: 220,
        borderGlowStrength: 11,
        backgroundTint: { red: 0, green: 0, blue: 0 },
        backgroundImage: true,
        backgroundImageUrl: '',
        backgroundImageLiveEffectStrength: '4',
        globalBackgroundImage: true,
        globalBackgroundImageUrl: '',
        globalBackgroundImageTint: { red: 0, green: 0, blue: 0 },
        globalBackgroundImageLiveEffectStrength: '4'
      },
      minimap: {
        backgroundColor: { red: 0, green: 0, blue: 0, alpha: 0.66 },
        size: 250,
        myViewportColor: { red: 0, green: 0, blue: 0, alpha: 0.66 },
        topOneViewportColor: { red: 0, green: 0, blue: 0, alpha: 0.66 },
        playerSize: 10,
        playerColor: { red: 0, green: 0, blue: 0 },
        ghostCellsColor: { red: 0, green: 0, blue: 0 }
      },
      multibox: {
        ringStyle: 'Line',
        linedRingSize: 80,
        initialRingColor: { red: 0, green: 0, blue: 0 },
        focusedRingColor: { red: 0, green: 0, blue: 0 },
        initialStaticCellColor: { red: 0, green: 0, blue: 0 },
        focusedStaticCellColor: { red: 0, green: 0, blue: 0 }
      },
      viruses: {
        color: { red: 0, green: 0, blue: 0 },
        borderWidth: 8,
        borderColor: { red: 0, green: 0, blue: 0 },
        glow: true,
        glowColor: { red: 0, green: 0, blue: 0 },
        glowDistance: 120,
        glowStrength: 8,
        transparency: 1,
        massType: 'Fill circle',
        fillCircleColor: { red: 0, green: 0, blue: 0 },
      }
    },
  },
  game: {
    servers: [
      { location: 'China', playersAmount: 0 },
      { location: 'East Asia', playersAmount: 0 },
      { location: 'Europe', playersAmount: 4891 },
      { location: 'North America', playersAmount: 0 },
      { location: 'Oceania', playersAmount: 0 },
      { location: 'Russia', playersAmount: 0 },
      { location: 'South America', playersAmount: 9724 },
      { location: 'Turkey', playersAmount: 0 }
    ],
    currentServerIndex: 2,
    mode: ':party',
    tag: '',
    token: '',
    gameServerToken: '',
    selectedGameTokenType: "PARTY"
  },
};

export default initStorage;

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
  game: IGameState
}

export type SkinsType = 'Disabled' | 'Custom' | 'Vanilla' | 'All';
export type RingsType = 'Disabled' | '2CL' | 'Acimazis' | 'Yue';
export type SoakSpeedType = 'Disabled' | '1' | '2' | '3' | '4' | '5';
export type FadeSpeedType = 'Disabled' | '1' | '2' | '3' | '4' | '5';
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
  skinsType: SkinsType,
  ringsType: RingsType,
  ringsSpinning: boolean,
  soakSpeed: SoakSpeedType,
  fadeSpeed: FadeSpeedType,
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
  shadowStrength: number,
  transparency: number,
  colorLighten: number
}

export interface IThemingFoodState {
  size: number,
  color: RGB,
  glow: boolean,
  glowColor: RGB,
  glowDistance: number,
  glowStrength: number,
  crisp: boolean
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