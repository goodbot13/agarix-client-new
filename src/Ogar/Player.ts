interface Position {
  x: number;
  y: number;
}

interface Color {
  cell: string;
  custom: string;
}

export default class Player {
  public id: number = 0;
  public nick: string = '';
  public skin: string = '';
  public mass: number = 0;
  public position: Position = { x: 0, y: 0 };
  public animatedPosition: Position = { x: 0, y: 0 };
  public tag: string = '';
  public alive: boolean = false;
  public updateTime: number = 0;
  public color: Color = { cell: '#000000', custom: '#3633a5' };
  public partyToken: string = '';
  public serverToken: string = '';

  constructor(id: number = 0) {
    this.id = id;
  }
}
