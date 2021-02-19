import World from "../../render/World";
import GameSettings from "../../Settings/Settings";
import UICommunicationService from "../../communication/FrontAPI";
import Socket from "../Socket/Socket";

declare global {
  interface Window {
    gapi: any
  }
}

export class GoogleLogin {
	public loggedIn: boolean = false;
  public token: string = null;
  private storage_key = 'GOOGLE_TOKEN'
  private SDKLoaded: boolean = false;
  private googleAuth: any;

	constructor(private world: World) {
		this.token = null;
    this.checkLogin();
    
    if (window.gapi) {
      this.googleAuth = window.gapi.auth2.init({
        client_id: this.world.scene.master.envConfig.GOOGLE_CLIENT_ID,
        cookie_policy: "single_host_origin",
        scope: "https://www.googleapis.com/auth/plus.login email",
        app_package_name: "com.miniclip.agar.io",
      });

      this.SDKLoaded = true;
    } else {
      UICommunicationService.sendChatMessage("Google login error: SKD hasn't been loaded yet.");
      UICommunicationService.setFacebookLogged(false);
    }
  }
  
  private checkLogin() {
    const data = this.getTokenData();

    if (data) {
      const { token, expiry } = data;

      if (expiry > Date.now()) {
        this.token = token;
        this.loggedIn = true;
        
        UICommunicationService.setGoogleLogged(true);
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
  
  public logIn(socket: Socket, afterLogin: boolean = false): void {
    if (this.SDKLoaded && this.loggedIn && this.token) {
      if (socket.loggedIn) {
        console.log('[Login]: already logged in [Google]', '[' + socket.tabType + ']', 'server rejoin required.');
        return;
      }

      socket.emitter.sendLogin(this.token, 4);
      socket.loggedIn = true;
      
      console.log('[Login]: logged in [Google]', '[' + socket.tabType + '].');
    }
  }

  public forceSendLogin(afterLogin: boolean = false): void {
   /*  if (Settings.auth.firstTab === 'GOOGLE') {
      if (this.world.controller.firstTabSocket && this.world.controller.firstTabSocket.connectionOpened) {
        this.logIn(this.world.controller.firstTabSocket, afterLogin);
      }
    } else if (Settings.auth.secondTab === 'GOOGLE') {
      if (this.world.controller.secondTabSocket && this.world.controller.secondTabSocket.connectionOpened) {
        this.logIn(this.world.controller.secondTabSocket);
      }
    } */
  }

  public receiveToken(): void {
    this.googleAuth.signIn().then((instance: any) => {
      const data = instance.getAuthResponse(true);
      const token = data.id_token;
    
      if (token) {
        this.token = token;
        this.loggedIn = true;
        this.setToken(token, data.expires_at);
        
        UICommunicationService.sendChatMessage('Google token received successfully.');
        UICommunicationService.setGoogleLogged(true);

        this.forceSendLogin(true);
      } else {
        UICommunicationService.sendChatMessage('Could not receive Google token.');
        UICommunicationService.setFacebookLogged(false);
      }
    })
  }
}