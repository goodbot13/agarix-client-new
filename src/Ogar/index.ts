import Socket from "./Socket";

export default new class Ogar {
  public firstTab: Socket;
  public secondTab: Socket;
  public connected = false;

  constructor() {
    this.firstTab = new Socket(false);
    this.secondTab = new Socket(true);
  }
}