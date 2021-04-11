class FPSCounter {
  private readonly decimalPlaces = 2;
  private readonly updateEachSecond = 1;
  private readonly decimalPlacesRatio = Math.pow(10, this.decimalPlaces);
  private timeMeasurements = [];
  public fps = 0;

  public tick() {
    this.timeMeasurements.push(performance.now());
    
    const msPassed = this.timeMeasurements[this.timeMeasurements.length - 1] - this.timeMeasurements[0];
    
    if (msPassed >= this.updateEachSecond * 1000) {
      this.fps = Math.round(this.timeMeasurements.length / msPassed * 1000 * this.decimalPlacesRatio) / this.decimalPlacesRatio;
      this.timeMeasurements = [];
    }
  }
}

export default new class GamePerformance {
  private readonly DEFAULT_SERVER_RENDER_TIME: number = 25;
  private loss: number = 0;
  public FPSCounter: FPSCounter;

  constructor() {
    this.FPSCounter = new FPSCounter();
    this.update();
  }

  public updateLoss(): void {
    this.loss++;
  }

  public getLoss(): number {
    let value = (100 - this.loss / this.DEFAULT_SERVER_RENDER_TIME * 100) * 1.5;
    value = value > 100 ? 100 : value;
    
    this.loss = 0;
    return +value.toFixed(0);
  }

  private update(): void {
    setInterval(() => {
      const fps = Math.round(this.FPSCounter.fps);
      const loss = this.getLoss();

      window.FrontAPI?.updateStats(fps > 0 ? fps : 0, loss > 0 ? loss : 0);
    }, 1000);
  }
}