import Logger from "../utils/Logger";

export default class MasterCache {
  private clientVersionInt: number = -1;
  private clientVersionString: string = '';
  private supportProtocolVersion: string = '';
  private protocolVersion: number = -1;
  private latestId: number = -1;

  private readonly logger: Logger;
  private readonly STORAGE_NAME: string = 'AGARIX:MASTER_CACHE';
  private readonly CACHE_LIFETIME: number = 60 * 60 * 48 * 1000; // 48 hours

  constructor() {
    this.logger = new Logger('MasterCache');

    const storage = JSON.parse(localStorage.getItem(this.STORAGE_NAME)) as IMasterSaveData; 

    if (storage) {
      const difference = Date.now() - storage.savedTime;

      if (difference > this.CACHE_LIFETIME) {
        return;
      }

      this.clientVersionInt = storage.clientVersionInt;
      this.clientVersionString = storage.clientVersionString;
      this.supportProtocolVersion = storage.supportProtocolVersion;
      this.protocolVersion = storage.protocolVersion;
      this.latestId = storage.latestId;
    }
  }

  public get(): IMasterCacheData | null {
    if (this.clientVersionInt === -1) {
      return null;
    } else {
      return {
        clientVersionInt: this.clientVersionInt,
        clientVersionString: this.clientVersionString,
        supportProtocolVersion: this.supportProtocolVersion,
        protocolVersion: this.protocolVersion,
        latestId: this.latestId
      }
    }
  }

  public set(data: IMasterCacheData): void {
    this.clientVersionInt = data.clientVersionInt;
    this.clientVersionString = data.clientVersionString;
    this.supportProtocolVersion = data.supportProtocolVersion;
    this.protocolVersion = data.protocolVersion;
    this.latestId = data.latestId;

    const saveData: IMasterSaveData = {
      ...data,
      savedTime: Date.now()
    }

    localStorage.setItem(this.STORAGE_NAME, JSON.stringify(saveData));
  }
}

interface IMasterCacheData {
  clientVersionInt: number,
  clientVersionString: string,
  supportProtocolVersion: string,
  protocolVersion: number,
  latestId: number
}

interface IMasterSaveData extends IMasterCacheData {
  savedTime: number
}