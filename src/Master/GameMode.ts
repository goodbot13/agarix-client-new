export default class GameMode {
  private mode: TGameMode = ':party';

  public set(mode: TGameMode): void {
    this.mode = mode;
  }

  public get(): TGameMode {
    return this.mode;
  }
}

export type TGameMode = ':party' | ':ffa' | ':battleroyale' | ':teams' | ':experimental';