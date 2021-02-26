import { IGameServer } from '../Master/Regions';
import { ILeaderboardPlayer } from '../tabs/Socket/Receiver';
import { LAODER_TEXT } from '../Versions';

export default new class UICommunicationService {
  sendChatMessage(nick: string, message: string, type: TChatMessageType) {
    window.FrontAPI?.addChatMessage(nick, message, type, Date.now());
  }

  sendChatGameMessage(message: string) {
    window.FrontAPI?.addChatMessage('', message, 'GAME', Date.now());
  }

  setGameVersion() {
    const interval = setInterval(() => {
      if (window.FrontAPI?.setGameLoaderStatus) {
        window.FrontAPI?.setGameLoaderStatus(LAODER_TEXT);
        clearInterval(interval);
      }
    }, 100);
  }

  setGameLoaderShown(shown: boolean) {
    window.FrontAPI?.setGameLoaderShown(shown);
  }

  updateStats(fps: number, loss: number) {
    window.FrontAPI?.updateStats(fps, loss);
  }

  updateLeaderboard(leaderboard: Array<ILeaderboardPlayer>) {
    window.FrontAPI?.updateLeaderboard(leaderboard);
  }

  setFacebookLogged(value: boolean) {
    window.FrontAPI?.setFacebookLoggedIn(value);
  }

  setGoogleLogged(value: boolean) {
    window.FrontAPI?.setGoogleLoggedIn(value);
  }

  setRegions(regions: Array<IGameServer>) {
    window.FrontAPI?.setRegions(regions);
  }

  setIsPlayerPlaying(value: boolean) {
    window.FrontAPI?.setIsPlayerPlaying(value);
  }

  updateTopTeam(players: Array<ITopTeamPlayer>) {
    window.FrontAPI?.updateTopTeam(players);
  }

  setEllapsedFrametime(ms: number) {
    window.FrontAPI?.setEllapsedFrametime(ms);
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
      updateTopTeam: (players: Array<ITopTeamPlayer>) => void,
      setRegions: (regions: Array<IGameServer>) => void,
      setEllapsedFrametime: (ms: number) => void,
      setIsPlayerPlaying: (value: boolean) => void,
      setGoogleLoggedIn: (value: boolean) => void,
      setFacebookLoggedIn: (value: boolean) => void,
      addChatMessage: (nick: string, message: string, type: TChatMessageType, key: number) => void
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