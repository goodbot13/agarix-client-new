import Master from "../Master";
import Settings from "../Settings/Settings";
import Socket from "./Socket";

export default class Ogar {
  public firstTab: Socket;
  public secondTab: Socket;
  public connected = false;

  constructor(public settings: Settings, public master: Master) {
    this.firstTab = new Socket(false, settings, master);
    this.secondTab = new Socket(true, settings, master);
  }

  public join(serverToken: string, partyToken: string = '') {
    this.firstTab.isConnected() && this.firstTab.join(serverToken, partyToken);
    this.secondTab.isConnected() && this.secondTab.join(serverToken, partyToken);
  }
}