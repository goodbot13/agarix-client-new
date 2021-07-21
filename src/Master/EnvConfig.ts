export default class EnvCfg {
  private readonly ENV_URL: string = 'https://agar.io/';
  private readonly MASTER_ENDPOINT_VERSION: string = 'v4';

  public MASTER_URL: string;
  public CFG_URL: string;
  public CFG_VERSION: number;
  public CUSTOM_SKINS_URL: string;
  public FB_APP_ID: number;
  public GOOGLE_CLIENT_ID: string;
  public XSOLLA_ENDPOINT: string;

  public GET_COUNTRY_URL: string;
  public CREATE_TOKEN_URL: string;
  public GET_TOKEN_URL: string;
  public FIND_SERVER_URL: string;
  public REGIONS_INFO_URL: string;
  public LATEST_ID_URL: string;
  public SKINS_URL: string;
 
  private async receiveConfig(): Promise<string> {
		return fetch(this.ENV_URL, {
      method: "GET",
      headers: {
        'Cache-Control': 'no-cache'
      }
    }).then((response) => response.text())
			.then((text) => text.match(new RegExp(/EnvConfig\s+=\s+{([\s\S]+?)}/g))[0]);
  }

  private createUrl(request: string): string {
    return this.MASTER_URL + '/' + this.MASTER_ENDPOINT_VERSION + '/' + request;
  }

  public async init(): Promise<void> {
    const strToEval = await this.receiveConfig();
    
    eval('window.' + strToEval);

    this.MASTER_URL = EnvConfig.master_url;
    this.CFG_URL = EnvConfig.config_url;
    this.CFG_VERSION = Number(EnvConfig.configVersion);
    this.CUSTOM_SKINS_URL = EnvConfig.custom_skins_url;
    this.FB_APP_ID = Number(EnvConfig.fb_app_id);
    this.GOOGLE_CLIENT_ID = EnvConfig.google_client_id;
    this.XSOLLA_ENDPOINT = EnvConfig.xsolla_endpoint;

    this.GET_COUNTRY_URL = this.createUrl('getCountry');
    this.CREATE_TOKEN_URL = this.createUrl('createToken');
    this.GET_TOKEN_URL = this.createUrl('getToken');
    this.FIND_SERVER_URL = this.createUrl('findServer');

    this.REGIONS_INFO_URL = this.MASTER_URL + '/info';
    this.LATEST_ID_URL = this.MASTER_URL + '/getLatestID'; 
  }
}

interface IEnvConfig {
  env_local: string;
  env_production: string;
  fb_app_id: string;
  ga_trackingId: string;
  google_client_id: string;
  gift_object_id: string;
  xsolla_endpoint: string;
  fb_endpoint: string;
  game_url: string;
  master_url: string;
  socketEndpoint: string;
  supersonic_app_key: string;
  tap_research_api_key: string;
  interstitial_url: string;
  config_url: string;
  apiKey: string;
  checksumKey: string;
  analyticsEnv: string;
  NR_licenseKey: string;
  NR_applicationID: string;
  datadog_appid: string;
  datadog_env: string;
  currentEnv: string;
  custom_skins_url: string;
  load_local_configuration: string;
  configID: string;
  configVersion: string;
  bacon_url: string;
  goliathUrl: string;
}

declare var EnvConfig: IEnvConfig;