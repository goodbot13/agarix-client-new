import Socket from './Socket';

export default new (class Ogar {
  public firstTab: Socket;
  public secondTab: Socket;
  public connected = false;

  constructor() {
    this.firstTab = new Socket(false);
    this.secondTab = new Socket(true);

    (window as any).Ogar = this;
  }

  public join(serverToken: string, partyToken: string = '') {
    this.firstTab.isConnected() && this.firstTab.join(serverToken, partyToken);
    this.secondTab.isConnected() && this.secondTab.join(serverToken, partyToken);
  }
})();
