import initState, { IState } from "./initState";

export default new class Storage {
  private readonly name: string = 'AGARIX:DATA';

  private swap(str: string): string {
    const left = str.slice(0, str.length / 2);
    const right = str.slice(str.length / 2);

    return right + left;
  }

  public init(): IState {
    const storage = localStorage.getItem(this.name) as string;
    return JSON.parse(atob(this.swap(storage)));
  }
}