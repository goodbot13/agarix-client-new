import Socket from "../Socket";
import { CaptchaVersion, setVidgetVisibility } from "./Captcha";

export default class CaptchaHandlerV3 {
  private v3_id: number = null;
  private readonly V3_KEY: string = '6LcEt74UAAAAAIc_T6dWpsRufGCvvau5Fd7_G1tY';

  public handle(socket?: Socket): Promise<string> {
    if (this.v3_id !== null) {
      window.grecaptcha.reset(this.v3_id);
    } else {
      this.v3_id = window.grecaptcha.render('ReCaptchaV3', {
        sitekey: this.V3_KEY,
        badge: 'inline',
        size: 'invisible'
      });
    }

    return new Promise((resolve) => {
      window.grecaptcha.execute(this.v3_id, { action: 'play' }).then((token: string) => { 
        if (socket) {
          socket.emitter.sendCaptcha(token, CaptchaVersion.V3);
        }

        setVidgetVisibility(false, document.querySelector('#ReCaptchaV3'));
        resolve(token);
      });
    });
  }
}