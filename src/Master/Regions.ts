import UICommunicationService from "../communication/FrontAPI";

export default class Regions {
  private selected: number = 0;
  private data: Array<IGameServer> = [];
  public updatingInterval: any = null;

  private getName(region: string): GameServerLocationTypes {
    switch (region) {
      case "EU-London": return "Europe";
      case "US-Atlanta": return "North America";
      case "RU-Russia": return "Russia";
      case "BR-Brazil": return "South America";
      case "TK-Turkey": return "Turkey";
      case "JP-Tokyo": return "East Asia";
      case "CN-China": return "China";
      case "SG-Singapore": return "Oceania";
    }
  }

  private unname(name: GameServerLocationTypes): string {
    switch (name) {
      case "Europe": return "EU-London";
      case "North America": return "US-Atlanta";
      case "Russia": return "RU-Russia";
      case "South America": return "BR-Brazil";
      case "Turkey": return "TK-Turkey";
      case "East Asia": return "JP-Tokyo";
      case "China": return "CN-China";
      case "Oceania": return "SG-Singapore";
    }
  }

  public setFetched(regions: any): void {
    this.data.length = 0;

    for (const region in regions) {
      const displayedRegionName = this.getName(region);
      const { numPlayers } = regions[region];

      this.data.push({ 
        location: displayedRegionName,
        playersAmount: numPlayers
      });
    }

    UICommunicationService.setRegions(this.data);
  }

  public setCurrent(index: number): void {
    this.selected = index;
  }

  public getCurrent(): string {
    return this.unname(this.data[this.selected].location);
  }

  public setUpdatingInterval(callback: () => void, time: number): void {
    if (this.updatingInterval) {
      return;
    }

    this.updatingInterval = setInterval(() => callback(), time);
  }

  public clearUpdatingInterval(): void {
    clearInterval(this.updatingInterval);
    this.updatingInterval = null;
  }
}

export type GameServerLocationTypes = 'South America' | 'China' | 'Europe' | 'East Asia' | 'Russia' | 'Oceania' | 'Turkey' | 'North America';

export interface IGameServer {
  location: GameServerLocationTypes,
  playersAmount: number,
}