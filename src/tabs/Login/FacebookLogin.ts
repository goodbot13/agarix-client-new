import UICommunicationService from '../../communication/FrontAPI';
import Socket from '../Socket/Socket';
import GameSettings from '../../Settings/Settings';
import PlayerState from '../../states/PlayerState';
import Logger from '../../utils/Logger';
import Controller from '../Contollers/TabsController';
import Player from '../../Ogar/Player';

export default new class FacebookLogin {
  public loggedIn: boolean = false;
  public token: string = '';
  public FB_APP_ID: number = 0;

  private SDKLoaded: boolean = false;
  private storage_key: string = 'FACEBOOK_TOKEN';
  private logger: Logger;

  constructor() {
    this.checkStorageToken();
    this.logger = new Logger('FacebookLogin');
  }

  public checkSdkLoaded(): void {
    if (this.SDKLoaded) {
      return;
    }

    if (window.FB) {
      window.FB.init({
        appId: this.FB_APP_ID,
        cookie: true,
        xfbml: true,
        status: true,
        version: "v2.0",
      });

      this.SDKLoaded = true;  
    } else {
      this.SDKLoaded = false;
      UICommunicationService.setFacebookLogged(false);
    }
  }
  
  private checkStorageToken(): void {
    const tokenData: any = JSON.parse(localStorage.getItem(this.storage_key));

    if (tokenData && tokenData.expiry > Date.now()) {
      this.token = tokenData.token;
      this.loggedIn = true;

      UICommunicationService.setFacebookLogged(true);
    }
  }

  public prepareToken(controller: Controller): void {
    if (!this.SDKLoaded) {
      return;
    }

    window.FB.login((response: Facebook.Response) => {
      if (response.authResponse) {
        this.token = response.authResponse.accessToken;
  
        localStorage.setItem(this.storage_key, JSON.stringify({
          token: this.token,
          expiry: Date.now() + 1000 * response.authResponse.expiresIn
        }));
        
        this.loggedIn = true;
        UICommunicationService.sendChatGameMessage('Facebook token received successfully.');
        UICommunicationService.setFacebookLogged(true);

       this.forceSendLogin(controller);
      } else {
        UICommunicationService.sendChatGameMessage('Facebook login error.');
        UICommunicationService.setFacebookLogged(false);
      }
    }, {
      scope: "public_profile, email",
    });
  }

  public logOut(): void {
    this.token = null;
    this.loggedIn = false;
    localStorage.removeItem(this.storage_key);
    UICommunicationService.setFacebookLogged(false);
  }

  public forceSendLogin(controller: Controller): void {
    this.logIn(controller.firstTabSocket);
    this.logIn(controller.secondTabSocket);
  }

  public logIn(socket: Socket): void {
    if (this.loggedIn && this.token && socket) {
      const { leftProfileLoginType, rightProfileLoginType } = GameSettings.all.profiles;

      if (PlayerState.first.loggedIn && socket.tabType === 'FIRST_TAB') {
        return;
      }

      if (PlayerState.second.loggedIn && socket.tabType === 'SECOND_TAB') {
        return;
      }

      switch (socket.tabType) {
        case 'FIRST_TAB':
          if (leftProfileLoginType === 'FACEBOOK') {
            socket.emitter.sendLogin(this.token, 2);
            PlayerState.first.loggedIn = true;
            this.logger.info('Logged in' + ' [' + socket.tabType + ']');
          }
          
          break;
        
        case 'SECOND_TAB':
          if (rightProfileLoginType === 'FACEBOOK') {
            socket.emitter.sendLogin(this.token, 2);
            PlayerState.first.loggedIn = true;
            this.logger.info('Logged in' + ' [' + socket.tabType + ']');
          }
          break;
      }
    }
  }
}

namespace Facebook {
  interface AuthResponse {
    accessToken: string;
		userID: string;
		expiresIn: number;
		signedRequest: string;
		graphDomain: string;
		data_access_expiration_time: number;
  }

  export interface Response {
    authResponse: AuthResponse;
		status: string;
  }

  export interface SDK {
    init(args: Object): void,
    login: any
  }
}

declare global {
  interface Window {
    FB: Facebook.SDK
  }
}