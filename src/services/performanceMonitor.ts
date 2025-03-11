import { EventEmitter } from 'events';
import os from 'os';

interface Metric {
  timestamp: number;
  value: number;
}

interface MetricStats {
  min: number;
  max: number;
  avg: number;
  p95: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  heapUsage: number;
  requestRate: number;
  responseTime: number;
  errorRate: number;
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, Metric[]>;
  private interval: NodeJS.Timer | null;
  private windowSize: number;
  private sampleInterval: number;

  constructor(windowSize = 3600000, sampleInterval = 5000) { // 1 hour window, 5s samples
    super();
    this.metrics = new Map();
    this.interval = null;
    this.windowSize = windowSize;
    this.sampleInterval = sampleInterval;
  }

  start(): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.collectMetrics();
    }, this.sampleInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    const now = Date.now();

    // System metrics
    const cpuUsage = await this.getCPUUsage();
    const memUsage = this.getMemoryUsage();
    const heapUsage = this.getHeapUsage();

    // Store metrics
    this.recordMetric('cpu', cpuUsage);
    this.recordMetric('memory', memUsage);
    this.recordMetric('heap', heapUsage);

    // Clean up old metrics
    this.cleanupOldMetrics(now);

    // Emit current metrics
    this.emit('metrics', {
      cpuUsage,
      memoryUsage: memUsage,
      heapUsage,
      timestamp: now
    });
  }

  private async getCPUUsage(): Promise<number> {
    const cpus = os.cpus();
    const totalCPU = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      return acc + (1 - cpu.times.idle / total);
    }, 0);
    return (totalCPU / cpus.length) * 100;
  }

  private getMemoryUsage(): number {
    const used = os.totalmem() - os.freemem();
    return (used / os.totalmem()) * 100;
  }

  private getHeapUsage(): number {
    const heap = process.memoryUsage();
    return (heap.heapUsed / heap.heapTotal) * 100;
  }

  recordMetric(name: string, value: number): void {
    const metrics = this.metrics.get(name) || [];
    metrics.push({
      timestamp: Date.now(),
      value
    });
    this.metrics.set(name, metrics);
  }

  private cleanupOldMetrics(now: number): void {
    for (const [name, metrics] of this.metrics.entries()) {
      const validMetrics = metrics.filter(
        m => now - m.timestamp <= this.windowSize
      );
      this.metrics.set(name, validMetrics);
    }
  }

  getMetricStats(name: string): MetricStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p95: values[Math.floor(values.length * 0.95)]
    };
  }

  getAllMetrics(): Record<string, MetricStats | null> {
    const result: Record<string, MetricStats | null> = {};
    for (const name of this.metrics.keys()) {
      result[name] = this.getMetricStats(name);
    }
    return result;
  }

  onAlert(callback: (metrics: SystemMetrics) => void): void {
    this.on('metrics', callback);
  }

  setAlertThreshold(
    metricName: string,
    threshold: number,
    callback: (value: number) => void
  ): void {
    this.on('metrics', (metrics: SystemMetrics) => {
      const value = (metrics as any)[metricName];
      if (value > threshold) {
        callback(value);
      }
    });
  }
} 