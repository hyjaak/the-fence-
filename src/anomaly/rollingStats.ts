export interface RollingStats {
  mean: number;
  std: number;
  count: number;
}

export class RollingStatsCalculator {
  private values: number[] = [];
  private maxWindow: number;

  constructor(maxWindow = 100) {
    this.maxWindow = maxWindow;
  }

  add(value: number): void {
    this.values.push(value);
    if (this.values.length > this.maxWindow) {
      this.values.shift();
    }
  }

  getStats(): RollingStats {
    if (this.values.length === 0) {
      return { mean: 0, std: 0, count: 0 };
    }

    const mean = this.values.reduce((acc, v) => acc + v, 0) / this.values.length;
    
    if (this.values.length === 1) {
      return { mean, std: 0, count: 1 };
    }

    const variance = this.values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / this.values.length;
    const std = Math.sqrt(variance);

    return { mean, std, count: this.values.length };
  }

  reset(): void {
    this.values = [];
  }
}
