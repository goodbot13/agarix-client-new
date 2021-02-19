import SkinsLoader from "../utils/SkinsLoader";
import Socket from "./Socket";

class Ogar {
  public firstTab: Socket;
  public secondTab: Socket;
  public connected: boolean = false;

  constructor(skinsLoader: SkinsLoader) {
    this.firstTab = new Socket(skinsLoader, false);
    this.secondTab = new Socket(skinsLoader, true);
  }
}

export default Ogar;