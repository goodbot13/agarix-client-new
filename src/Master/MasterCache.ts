export default class MasterCache {
  private clientVersionInt: number = -1;
  private clientVersionString: string = '';
  private supportProtocolVersion: string = '';
  private protocolVersion: number = 0;

  private readonly STORAGE_NAME: string = 'AGARIX:MASTER_CACHE';
  private readonly CACHE_LIFETIME: number = 60 * 60 * 48 * 1000; // 48 hours

  constructor() {
    const storage = JSON.parse(localStorage.getItem(this.STORAGE_NAME)) as IMasterSaveData; 

    if (storage) {
      if (Date.now() - storage.savedTime > this.CACHE_LIFETIME) {
          return;
      }

      this.clientVersionInt = storage.clientVersionInt;
      this.clientVersionString = storage.clientVersionString;
      this.supportProtocolVersion = storage.supportProtocolVersion;
      this.protocolVersion = storage.protocolVersion;
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
        protocolVersion: this.protocolVersion
      }
    }
  }

  public set(data: IMasterCacheData): void {
    this.clientVersionInt = data.clientVersionInt;
    this.clientVersionString = data.clientVersionString;
    this.supportProtocolVersion = data.supportProtocolVersion;
    this.protocolVersion = data.protocolVersion;

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
  protocolVersion: number
}

interface IMasterSaveData extends IMasterCacheData {
  savedTime: number
}