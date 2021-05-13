export default class CallbacksHandler {
  private callbacksArray: Array<() => void> = [];

  public pushCallback(callback: () => void): void {
    this.callbacksArray.push(callback);
  }

  public execute(): void {
    this.callbacksArray.forEach((callback) => callback());
  }

  public clear(): void {
    this.callbacksArray = [];
  }
}