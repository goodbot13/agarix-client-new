export default class GameMode {
  private mode: TGameMode = ':party';

  public set(mode: TGameMode): void {
    this.mode = mode;
  }

  public get(): TGameMode {
    return this.mode;
  }

  public getOgar(): TOgarGameMode {
    switch (this.mode) {
      case ':party': return 'PTY';
      case ':ffa': return 'FFA';
      case ':experimental': return 'EXP';
      case ':battleroyale': return 'BTR';
      case ':teams': return 'TMS';
    }
  }
}

export type TOgarGameMode = 'FFA' | 'PTY' | 'EXP' | 'BTR' | 'TMS';
export type TGameMode = ':party' | ':ffa' | ':battleroyale' | ':teams' | ':experimental';