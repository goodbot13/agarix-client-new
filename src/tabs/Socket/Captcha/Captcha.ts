import UICommunicationService from "../../../communication/FrontAPI";
import CaptchaHandlerV2 from "./CaptchaHandlerV2";
import CaptchaHandlerV3 from "./CaptchaHandlerV3";

export const setVidgetVisibility = (value: boolean, element: HTMLDivElement): void => {
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

export default new class Captcha {
  public V2: CaptchaHandlerV2;
  public V3: CaptchaHandlerV3;

  private initTries: number = 0;
  private MAX_INIT_TRIES: number = 5;
  private INIT_TIMEOUT: number = 1000;

  constructor() {
    this.init();

    this.V2 = new CaptchaHandlerV2();
    this.V3 = new CaptchaHandlerV3();
  }

  private init(): void {
    setTimeout(() => {
      if (!window.grecaptcha) {
        if (this.initTries > this.MAX_INIT_TRIES) {
          UICommunicationService.sendChatGameMessage('ReCaptcha load failed. Please, refresh the page.');
          throw new Error("ReCaptcha load failed.");
        } else {
          this.initTries++;
          this.init();
        }
      }
    }, this.INIT_TIMEOUT);
  }
}

interface IRenderParams {
  sitekey: string,
  theme?: 'dark' | 'light',
  size?: 'compact' | 'normal' | 'invisible',
  badge?: string,
  tabindex?: number,
  callback?: (token: string) => void,
  'expired-callback'?: () => void,
  'error-callback'?: () => void
}

interface IGrecaptcha {
  reset(id?: number): void,
  execute(key: any, props: Object): Promise<string>,
  render(DOMElementId: string | number, params: IRenderParams): number;
}

type TCaptchaVersion = {
  V2: 2,
  V3: 3
}

export const CaptchaVersion: TCaptchaVersion = {
  V2: 2,
  V3: 3
}

declare global {
  interface Window {
    grecaptcha: IGrecaptcha
  }
}
