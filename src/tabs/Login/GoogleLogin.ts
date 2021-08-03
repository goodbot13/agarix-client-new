import UICommunicationService from "../../communication/FrontAPI";
import Controller from "../Contollers/TabsController";
import Socket from "../Socket/Socket";
import Logger from "../../utils/Logger";
import PlayerState from "../../states/PlayerState";
import { ChatAuthor } from "../../communication/Chat";

export default new class GoogleLogin {
	public loggedIn: boolean = false;
  public token: string = null;
  public GOOGLE_CLIENT_ID: string = '';

  private storage_key = 'GOOGLE_TOKEN'
  private SDKLoaded: boolean = false;
  private googleAuth: any;
  private logger: Logger;
  private initTries: number = 0;
  private MAX_INIT_TRIES: number = 5;
  private INIT_TIMEOUT: number = 1000;

	constructor() {
		this.token = null;
    this.checkLogin();
    this.checkSdkLoaded();
    this.logger = new Logger('GoogleLogin');
  }
  
  private checkLogin() {
    const data = this.getTokenData();

    if (data) {
      const { token, expiry } = data;

      if (expiry > Date.now()) {

        const expiresIn = ~~((expiry - Date.now()) / 1000 / 60);

        this.token = token;
        this.loggedIn = true;
        
        UICommunicationService.setGoogleLogged(true);
        UICommunicationService.sendChatGameMessage(`Logged in. Re-login required in ${expiresIn} minutes.`, ChatAuthor.Google);
      } else {
        UICommunicationService.setGoogleLogged(false);
        UICommunicationService.sendChatGameMessage('Token expired. Please, log in again.', ChatAuthor.Google);
        this.logOut();
      }
    } else {
      UICommunicationService.setGoogleLogged(false);
      this.logOut();
    }
	}

  public checkSdkLoaded(): void {
    if (this.SDKLoaded) {
      return;
    }

    if (this.GOOGLE_CLIENT_ID && window.gapi) {
      this.googleAuth = window.gapi.auth2.init({
        client_id: this.GOOGLE_CLIENT_ID,
        cookie_policy: "single_host_origin",
        scope: "https://www.googleapis.com/auth/plus.login email",
        app_package_name: "com.miniclip.agar.io",
      });

      this.SDKLoaded = true;
      this.logger.info('SDK succesfully initialized');
    } else {
      if (this.initTries > this.MAX_INIT_TRIES) {
        UICommunicationService.sendChatGameMessage(`Login error: SKD hasn't been loaded yet.`, ChatAuthor.Google);
        UICommunicationService.setFacebookLogged(false);
        this.SDKLoaded = false;
      } else {
        this.initTries++;
        setTimeout(() => this.checkSdkLoaded(), this.INIT_TIMEOUT);
      }
    }
  }

	public logOut() {
		this.token = null;
		this.loggedIn = false;
    localStorage.removeItem(this.storage_key);

    UICommunicationService.setGoogleLogged(false);
  }
  
  private setToken(token: string, expiry: number): void {
    localStorage.setItem(this.storage_key, JSON.stringify({ token, expiry }));
  }

  private getTokenData(): any {
    return JSON.parse(localStorage.getItem(this.storage_key));
  }
  
  public logIn(socket: Socket): void {
    if (this.loggedIn && this.token && socket) {
      const { leftProfileLoginType, rightProfileLoginType } = (window as any).GameSettings.all.profiles;

      if (PlayerState.first.loggedIn && socket.tabType === 'FIRST_TAB') {
        return;
      }

      if (PlayerState.second.loggedIn && socket.tabType === 'SECOND_TAB') {
        return;
      }

      switch (socket.tabType) {
        case 'FIRST_TAB':
          if (leftProfileLoginType === 'GOOGLE') {
            socket.emitter.sendLogin(this.token, 4);
            PlayerState.first.loggedIn = true;
            this.logger.info('Logged in' + ' [' + socket.tabType + ']');
          }
          
          break;
        
        case 'SECOND_TAB':
          if (rightProfileLoginType === 'GOOGLE') {
            socket.emitter.sendLogin(this.token, 4);
            PlayerState.first.loggedIn = true;
            this.logger.info('Logged in' + ' [' + socket.tabType + ']');
          }
          break;
      }
    }
  }

  private forceSendLogin(controller: Controller): void {
    this.logIn(controller.firstTabSocket);
    this.logIn(controller.secondTabSocket);
  }

  public prepareToken(controller: Controller): void {
    if (!this.SDKLoaded) {
      return;
    }

    this.googleAuth.signIn().then((instance: any) => {
      const data = instance.getAuthResponse(true);
      const token = data.id_token;
    
      if (token) {
        this.token = token;
        this.loggedIn = true;
        this.setToken(token, data.expires_at);
        
        UICommunicationService.sendChatGameMessage('Token received successfully.', ChatAuthor.Google);
        UICommunicationService.setGoogleLogged(true);

        this.forceSendLogin(controller);
      } else {
        UICommunicationService.sendChatGameMessage('Could not receive token.', ChatAuthor.Google);
        UICommunicationService.setFacebookLogged(false);
      }
    })
  }
}

declare global {
  interface Window {
    gapi: any
  }
}