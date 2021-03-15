export default class Logger {

  constructor(private name: string) { }

  private message(msg: string, color: string): void {
    console.log(`%c[${new Date().toLocaleTimeString()}] ` + `%c[${this.name}]: ` + `%c${msg}.`, 'color: #00c4ff', 'color: #63dbff', `color:${color}`);
  }

  public info(message: string): void {
    this.message(message, '#d9d9d9');
  }

  public warning(message: string): void {
    this.message(message, '#ffdb63');
  }

  public error(message: string): void {
    this.message(message, '#ff6363');
  }
}