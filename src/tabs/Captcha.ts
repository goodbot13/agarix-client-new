import UICommunicationService from "../communication/FrontAPI";
import Socket from "./Socket/Socket";

export default new class Captcha {
  private readonly V2_KEY: string = '6LfjUBcUAAAAAF6y2yIZHgHIOO5Y3cU5osS2gbMl';
  private readonly V3_KEY: string = '6LcEt74UAAAAAIc_T6dWpsRufGCvvau5Fd7_G1tY';
  private v2_id: number = null;
  private v3_id: number = null;

  constructor() {
    if (!window.grecaptcha) {
      UICommunicationService.sendChatGameMessage('ReCaptcha load failed');
    }
  }

  private setVidgetVisibility(value: boolean, element: HTMLDivElement): void {
    if (!element) {
      return;
    }

    if (value) {
      element.style.position = 'absolute';
      element.style.top = '0px';
      element.style.left = '0px';
      element.style.right = '0px';
      element.style.bottom = '0px';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.background = 'rgba(20, 20, 20, .8)';
      element.style.zIndex = '100';
    } else {
      element.style.display = 'none';
    }
  }

  public handleV2(socket: Socket): void {
    this.setVidgetVisibility(true, document.querySelector('#ReCaptchaV2'));

    if (this.v2_id !== null) {
      window.grecaptcha.reset(this.v2_id);
    } else {
      this.v2_id = window.grecaptcha.render('ReCaptchaV2', {
        sitekey: this.V2_KEY,
        theme: "dark",
        callback: (token: string) => {

          socket.emitter.sendCaptcha(token, 2);

          this.setVidgetVisibility(false, document.querySelector('#ReCaptchaV2'));
          window.grecaptcha.reset(this.v2_id);

        }
      });
    }
  }

  public handleV3(socket?: Socket): Promise<string> {
    /* const showVidgetTimeout = setTimeout(() => this.setVidgetVisibility(true, document.querySelector('#ReCaptchaV3')), 2200); */
    
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
      window.grecaptcha.execute(this.v3_id, { action: 'play' })
        .then((token: string) => { 
          if (socket) {
            socket.emitter.sendCaptcha(token, 3);
          }
          
          resolve(token);
          /* clearTimeout(showVidgetTimeout); */
          this.setVidgetVisibility(false, document.querySelector('#ReCaptchaV3'));
        });
    });
  }
}

interface IGrecaptcha {
  reset(id?: number): void,
  execute(key: any, props: Object): Promise<string>,
  render(DOMElementId: string | number, params: Object): number;
}

declare global {
  interface Window {
    grecaptcha: IGrecaptcha
  }
}
