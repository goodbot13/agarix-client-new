import { IGameServer } from '../Master/Regions';
import { ILeaderboardPlayer } from '../tabs/Socket/Receiver';
import Versions from '../versions';

export default new class UICommunicationService {
  sendChatMessage(text: string) {
    /* setTimeout(() => window.addChatMessage && window.addChatMessage({ nick: '', type: 'SERVER_MESSAGE', text })); */
  }

  setGameVersion() {
    const interval = setInterval(() => {
      if (window.FrontAPI?.setGameLoaderStatus) {
        window.FrontAPI?.setGameLoaderStatus(Versions.GAME);
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
    /* setTimeout(() => window.setFacebookLogged && window.setFacebookLogged(value), 500); */
  }

  setGoogleLogged(value: boolean) {
    /* setTimeout(() => window.setGoogleLogged && window.setGoogleLogged(value), 500); */
  }

  setRegions(regions: Array<IGameServer>) {
    window.FrontAPI?.setRegions(regions);
  }

  setIsPlayerPlaying(value: boolean) {
    /* setTimeout(() => window.setIsPlayerPlaying && window.setIsPlayerPlaying(value)); */
  }

  updateTopTeam(players: Array<ITopTeamPlayer>) {
    window.FrontAPI?.updateTopTeam(players);
  }
}

declare global {
  interface Window {
    FrontAPI: {
      setGameLoaderStatus: (version: string) => void,
      setGameLoaderShown: (shown: boolean) => void,
      updateStats: (fps: number, loss: number) => void,
      updateLeaderboard: (leaderboard: Array<ILeaderboardPlayer>) => void,
      updateTopTeam: (players: Array<ITopTeamPlayer>) => void,
      setRegions: (regions: Array<IGameServer>) => void,
    }
  }
}

export interface ITopTeamPlayer {
  mass: number,
  nick: string,
  isAlive: boolean
}