import Logger from "../../../utils/Logger";
import Socket from "../Socket";
import { CaptchaVersion, setVidgetVisibility } from "./Captcha";

export default class CpatchaHandlerV2 {
  private readonly V2_KEY: string = '6LfjUBcUAAAAAF6y2yIZHgHIOO5Y3cU5osS2gbMl';
  private v2_id: number = null;
  private logger: Logger = new Logger('CaptchaV2Handler');

  public handle(socket: Socket): void {
    setVidgetVisibility(true, document.querySelector('#ReCaptchaV2'));

    if (this.v2_id !== null) {
      window.grecaptcha.reset(this.v2_id);
    } else {
      this.v2_id = window.grecaptcha.render('ReCaptchaV2', {
        theme: "dark",
        sitekey: this.V2_KEY,
        callback: (token: string) => this.handler(token, socket),
        'expired-callback': () => this.expireHandler()
      });
    }
  }

  private handler(token: string, socket: Socket) {
    socket.emitter.sendCaptcha(token, CaptchaVersion.V2);
    setVidgetVisibility(false, document.querySelector('#ReCaptchaV2'));
  }

  private expireHandler() {
    this.logger.warning('Expired');
  }
}