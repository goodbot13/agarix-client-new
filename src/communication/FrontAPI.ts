import { IGameServer } from '../Master/Regions';
import { IGhostCell, ILeaderboardPlayer } from '../tabs/Socket/Receiver';
import { LOADER_TEXT } from '../Versions';

export default new class UICommunicationService {
  sendChatMessage(nick: string, message: string, type: TChatMessageType): void {
    window.FrontAPI?.addChatMessage(nick, message, type, Date.now());
  }

  sendChatGameMessage(message: string, author: string = ''): void {
    window.FrontAPI?.addChatMessage(author, message, 'GAME', Date.now());
  }

  setGameVersion(): void {
    const interval = setInterval(() => {
      if (window.FrontAPI?.setGameLoaderStatus) {
        window.FrontAPI?.setGameLoaderStatus(LOADER_TEXT);
        clearInterval(interval);
      }
    }, 100);
  }

  setGameLoaderShown(shown: boolean): void {
    window.FrontAPI?.setGameLoaderShown(shown);
  }

  updateStats(fps: number, loss: number): void {
    window.FrontAPI?.updateStats(fps, loss);
  }

  updateLeaderboard(leaderboard: Array<ILeaderboardPlayer>): void {
    window.FrontAPI?.updateLeaderboard(leaderboard);
  }

  updateGhostCells(ghostCells: Array<IGhostCell>): void {
    window.FrontAPI?.updateGhostCells(ghostCells);
  }

  setFacebookLogged(value: boolean): void {
    window.FrontAPI?.setFacebookLoggedIn(value);
  }

  setGoogleLogged(value: boolean): void {
    window.FrontAPI?.setGoogleLoggedIn(value);
  }

  setRegions(regions: Array<IGameServer>): void {
    window.FrontAPI?.setRegions(regions);
  }

  setIsPlayerPlaying(value: boolean): void {
    window.FrontAPI?.setIsPlayerPlaying(value);
  }

  updateTopTeam(players: Array<ITopTeamPlayer>): void {
    window.FrontAPI?.updateTopTeam(players);
  }

  setEllapsedFrametime(ms: number): void {
    window.FrontAPI?.setEllapsedFrametime(ms);
  }

  setToken(value: string): void {
    window.FrontAPI?.setToken(value);
  }

  setServerToken(value: string): void {
    window.FrontAPI?.setServerToken(value);
  }

  setSocketConnecting(value: boolean): void {
    window.FrontAPI?.setSocketConnecting(value);
  }

  setFirstTabStatus(status: TStatsTabStatus): void {
    window.FrontAPI?.setFirstTabStatus(status);
  }

  setSecondTabStatus(status: TStatsTabStatus): void {
    window.FrontAPI?.setSecondTabStatus(status);
  }

  setSpectatorTabStatus(status: TStatsTabStatus): void {
    window.FrontAPI?.setSpectatorTabStatus(status);
  }

  setMyMass(value: number): void {
    window.FrontAPI?.setMyMass(value);
  }
}

declare global {
  interface Window {
    FrontAPI: {
      setGameLoaderStatus: (version: string) => void,
      setGameLoaderShown: (shown: boolean) => void,
      setGameLoaded: (value: boolean) => void,
      updateStats: (fps: number, loss: number) => void,
      updateLeaderboard: (leaderboard: Array<ILeaderboardPlayer>) => void,
      updateGhostCells: (ghostCells: Array<IGhostCell>) => void,
      updateTopTeam: (players: Array<ITopTeamPlayer>) => void,
      setRegions: (regions: Array<IGameServer>) => void,
      setEllapsedFrametime: (ms: number) => void,
      setIsPlayerPlaying: (value: boolean) => void,
      setGoogleLoggedIn: (value: boolean) => void,
      setFacebookLoggedIn: (value: boolean) => void,
      addChatMessage: (nick: string, message: string, type: TChatMessageType, key: number) => void,
      setToken: (value: string) => void,
      setServerToken: (value: string) => void,
      setSocketConnecting: (value: boolean) => void,
      setFirstTabStatus: (value: TStatsTabStatus) => void,
      setSecondTabStatus: (value: TStatsTabStatus) => void,
      setSpectatorTabStatus: (value: TStatsTabStatus) => void,
      setMyMass: (value: number) => void
    }
  }
}

export interface ITopTeamPlayer {
  mass: number,
  nick: string,
  isAlive: boolean
}

export type TChatMessageType = 'GAME' | 'PLAYER' | 'COMMAND';
export type IChatMessage = {
  nick: string,
  message: string,
  type: TChatMessageType,
  key: number
}
export type TStatsTabStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';