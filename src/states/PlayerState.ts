export default new class PlayerState {
  public first: IPlayerState = {
    spawning: false,
    playing: false,
    focused: false,
    loggedIn: false,
    connected: false,
    connecting: false,
    shouldBeReconnected: false,
  }

  public second: IPlayerState = {
    spawning: false,
    playing: false,
    focused: false,
    loggedIn: false,
    connected: false,
    connecting: false,
    shouldBeReconnected: false,
  }
}

interface IPlayerState {
  spawning: boolean,
  playing: boolean,
  focused: boolean,
  loggedIn: boolean,
  connected: boolean,
  connecting: boolean,
  shouldBeReconnected: boolean
}