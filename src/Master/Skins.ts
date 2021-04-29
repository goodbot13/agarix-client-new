export default class AgarSkinsList {
  private list: Map<string, ISkin>;
  private reservedSkinsByName: Set<string>;

  constructor() {
    this.list = new Map();
    this.reservedSkinsByName = new Set();
  }

  public has(name: string = ''): boolean {
    return this.list.has(name.toLowerCase());
  }

  public get(name: string = ''): ISkin {
    return this.list.get(name.toLowerCase());
  }

  public skinsByNameHas(name: string): boolean {
    return this.reservedSkinsByName.has(name.toLowerCase());
  }

  public parse(data: any, CFG_URL: string, latestId: number): void {
    const gameConfig = JSON.parse(data).gameConfig;

    const GES = gameConfig['Gameplay - Equippable Skins'];
    const GFS = gameConfig['Gameplay - Free Skins'];
    const VPSP = gameConfig['Visual - Prod. Spine Animations'];

    this.list.clear();
    this.reservedSkinsByName.clear();

    for (const skin of GES) {
      const url = `${CFG_URL}/${latestId}/${(skin as ISkin).image}`;
      const name = (skin as ISkin).productId.slice(5);

      skin.url = url;

      this.list.set(name, skin);
    }

    for (const skin of VPSP) {
      const url = `${CFG_URL}/${latestId}/${(skin as ISkin).spineFileName}.png`;
      const name = (skin as ISkin).productId.slice(5);

      skin.url = url;

      this.list.set(name, skin);
    }

    for (const skin of GFS) {
      const url = `${CFG_URL}/${latestId}/${(skin as ISkin).image}`;
      const name = (skin as ISkin).id.toLowerCase();

      skin.url = url;

      this.list.set(name, skin);
      this.reservedSkinsByName.add(name);
    }
  }
}

interface ISkin {
  cellColor: string;
  gameplayId: number;
  image: string;
  productId: string;
  skinType: string;
  url: string;
  id: string;
  spineFileName: string;
}
