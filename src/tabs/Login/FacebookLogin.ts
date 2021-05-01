import UICommunicationService from '../../communication/FrontAPI';
import Socket from '../Socket/Socket';
import GameSettings from '../../Settings/Settings';
import PlayerState from '../../states/PlayerState';
import Logger from '../../utils/Logger';
import Controller from '../Contollers/TabsController';

export default new class FacebookLogin {
  public loggedIn: boolean = false;
  public token: string = '';
  public FB_APP_ID: number = 0;

  private expirationDate: number = 0;
  private SDKLoaded: boolean = false;
  private logger: Logger;

  constructor() {
    window.fbAsyncInit = () => this.initLoginSystem();
    this.logger = new Logger('FacebookLogin');

    setTimeout(() => {
      if (!this.SDKLoaded) {
        this.logger.info('Forced SDK load');
        this.initLoginSystem();
      }
    }, 2000);
  }

  private async initLoginSystem(): Promise<any> {
    if (this.initSDK()) {
      const response = await this.getLoginStatus();

      if (response.status === 'connected') {
        this.logger.info('User is already logged in, handling successfull login..');
        this.handleSuccessfulLogin(response.authResponse.accessToken, response.authResponse.expiresIn);
      } 
    }
  }

  private initSDK(): boolean {
    if (!window.FB) {
      this.logger.error(`SDK hasn't beed loaded yet (INIT_BEFORE_LOAD_ERROR)`);
      this.SDKLoaded = false;
      return false;
    }

    window.FB.init({
      appId: this.FB_APP_ID,
      cookie: true,
      xfbml: true,
      version: "v2.8",
    });

    this.logger.info('SDK successfully initialized');
    this.SDKLoaded = true;

    return true;
  }

  private async getLoginStatus(): Promise<Facebook.ILoginStatusResponse> {
    return new Promise((resolve, reject) => {
      window.FB.getLoginStatus((response) => {
        resolve(response);
      });
    })
  }

  private handleSuccessfulLogin(token: string, expiresIn: number): void {
    this.token = token;
    this.loggedIn = true;
    this.expirationDate = Date.now() + (1000 * expiresIn);

    const expires = ~~((this.expirationDate - Date.now()) / 1000 / 60); 

    UICommunicationService.setFacebookLogged(true);
    UICommunicationService.sendChatGameMessage(`Facebook logged in. Re-login required in ${expires} minutes.`);

    this.logger.info('Login handler received data of successful login');
  }

  public prepareToken(controller: Controller): void {
    if (!this.SDKLoaded) {
      return;
    }

    window.FB.login((response: Facebook.ILoginStatusResponse) => {
      if (response.status === 'connected') {
        this.handleSuccessfulLogin(response.authResponse.accessToken, response.authResponse.expiresIn);

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

    this.logger.info('Log out');

    UICommunicationService.setFacebookLogged(false);
  }

  public forceSendLogin(controller: Controller): void {
    this.logIn(controller.firstTabSocket);
    this.logIn(controller.secondTabSocket);
  }

  public logIn(socket: Socket): void {
    if (!this.loggedIn || !this.token || !socket) {
      this.logger.info(`Could not log in. loggedIn: ${this.loggedIn}, token: ${this.token}`);
      return;
    }

    const { leftProfileLoginType, rightProfileLoginType } = GameSettings.all.profiles;

    if (PlayerState.first.loggedIn && socket.tabType === 'FIRST_TAB') {
      return;
    }

    if (PlayerState.second.loggedIn && socket.tabType === 'SECOND_TAB') {
      return;
    }

    const shouldLogInWithFirstTab = socket.tabType === 'FIRST_TAB' && leftProfileLoginType === 'FACEBOOK';
    const shouldLogInWithSecondTab = socket.tabType === 'SECOND_TAB' && rightProfileLoginType === 'FACEBOOK';

    if (shouldLogInWithFirstTab) {
      socket.emitter.sendLogin(this.token, 2);
      PlayerState.first.loggedIn = true;
      this.logger.info('Logged in' + ' [' + socket.tabType + ']');
    } else if (shouldLogInWithSecondTab) {
      socket.emitter.sendLogin(this.token, 2);
      PlayerState.second.loggedIn = true;
      this.logger.info('Logged in' + ' [' + socket.tabType + ']');
    }
  }
}

namespace Facebook {
  export interface ILoginStatusResponse {
    status: 'connected' | 'not_authorized' | 'unknown',
    authResponse: {
      accessToken: string,
      expiresIn: number,
      signedRequest: string,
      userID: string
    }
  }

  export interface SDK {
    init(args: Object): void,
    getLoginStatus(
      cb: (args: ILoginStatusResponse) => void
    ): void,
    login: any,
  }
}

declare global {
  interface Window {
    FB: Facebook.SDK,
    fbAsyncInit: (cb: () => void) => void
  }
}