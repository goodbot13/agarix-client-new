import World from '../../render/World';
import GameSettings from '../../Settings/Settings';
import UICommunicationService from '../../communication/FrontAPI';
import Socket from '../Socket/Socket';

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

export class FacebookLogin {
  public loggedIn: boolean = false;
  public token: string = '';
  private SDKLoaded: boolean;
  private storage_key: string = 'FACEBOOK_TOKEN';

  constructor(private world: World) {
    this.checkStorageToken();

    if (window.FB) {
      window.FB.init({
        appId: this.world.scene.master.envConfig.FB_APP_ID,
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

  public prepareToken(): void {
    window.FB.login((response: Facebook.Response) => {
      if (response.authResponse) {
        this.token = response.authResponse.accessToken;
  
        localStorage.setItem(this.storage_key, JSON.stringify({
          token: this.token,
          expiry: Date.now() + 1000 * response.authResponse.expiresIn
        }));
        
        this.loggedIn = true;
        UICommunicationService.sendChatMessage('Facebook token received successfully.');
        UICommunicationService.setFacebookLogged(true);

       this.forceSendLogin();
      } else {
        UICommunicationService.sendChatMessage('Facebook login error.');
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

  public forceSendLogin(): void {
    /* if (Settings.auth.firstTab === 'FACEBOOK') {
      if (this.world.controller.firstTabSocket && this.world.controller.firstTabSocket.connectionOpened) {
        this.logIn(this.world.controller.firstTabSocket);
      }
    } else if (Settings.auth.secondTab === 'FACEBOOK') {
      if (this.world.controller.secondTabSocket && this.world.controller.secondTabSocket.connectionOpened) {
        this.logIn(this.world.controller.secondTabSocket);
      }
    } */
  }

  public logIn(socket: Socket): void {
    if (this.SDKLoaded && this.loggedIn && this.token) {
      if (socket.loggedIn) {
        console.log('[Login]: already logged in [Facebook]', '[' + socket.tabType + ']', 'server rejoin required.');
        return;
      }

      socket.emitter.sendLogin(this.token, 2);
      socket.loggedIn = true;
      console.log('[Login]: logged in [Facebook]', '[' + socket.tabType + '].');
    }
  }
}