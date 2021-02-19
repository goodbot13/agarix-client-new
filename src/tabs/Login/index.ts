import Master from '../../Master';
import World from '../../render/World';
import GameSettings from '../../Settings/Settings';
import Socket from '../Socket/Socket';
import { FacebookLogin } from './Facebook';
import { GoogleLogin } from './Google';

export default class Login {
  private facebook: FacebookLogin;
  private google: GoogleLogin;

  constructor(world: World) {
    this.facebook = new FacebookLogin(world);
    this.google = new GoogleLogin(world);
  }

  public logInWithFb(): void {
    this.facebook.prepareToken();
  }

  public logInWithGoogle(): void {
    this.google.receiveToken();
  }

  public logOutWithFb(): void {
    this.facebook.logOut();
  }

  public logOutWithGoogle(): void {
    this.google.logOut();
  }

  public onLoginRequest(socket: Socket): void {
    if (socket.tabType === 'FIRST_TAB') {

     /*  if (Settings.auth.firstTab === 'FACEBOOK') {
        this.facebook.logIn(socket);
      } else if (Settings.auth.firstTab === 'GOOGLE') {
        this.google.logIn(socket);
      }

    } else if (socket.tabType === 'SECOND_TAB') {

      if (Settings.auth.secondTab === 'FACEBOOK') {
        this.facebook.logIn(socket);
      } else if (Settings.auth.secondTab === 'GOOGLE') {
        this.google.logIn(socket);
      } */
      
    }
  }
}