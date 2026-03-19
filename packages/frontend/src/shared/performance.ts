/**
 * Performance monitoring utilities
 * Provides performance tracking and metrics collection
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

/**
 * Performance monitoring class for tracking application performance
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance measurement
   */
  start(name: string): void {
    if (typeof performance === 'undefined') return;
    
    performance.mark(`${name}-start`);
  }

  /**
   * End performance measurement and store metrics
   */
  end(name: string): PerformanceMetrics | null {
    if (typeof performance === 'undefined') return null;

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measures = performance.getEntriesByName(name, 'measure');
      const measure = measures[measures.length - 1];

      if (!measure) {
        return null;
      }

      const metric: PerformanceMetrics = {
        name,
        duration: measure.duration,
        startTime: measure.startTime,
        endTime: measure.startTime + measure.duration,
      };

      this.metrics.set(name, metric);
      return metric;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get specific performance metric
   */
  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Log slow operations (over 1 second)
   */
  logSlowOperations(): void {
    const slowMetrics = Array.from(this.metrics.values()).filter(metric => metric.duration > 1000);
    
    if (slowMetrics.length > 0) {
      console.group('⚠️ Slow operations detected:');
      slowMetrics.forEach(metric => {
        console.warn(`${metric.name}: ${metric.duration.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  }
}

/**
 * Convenience functions for performance monitoring
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Measure function execution time
 */
export function measure<T>(name: string, fn: () => T): T {
  performanceMonitor.start(name);
  try {
    const result = fn();
    performanceMonitor.end(name);
    return result;
  } catch (error) {
    performanceMonitor.end(name);
    throw error;
  }
}

/**
 * Async function execution time measurement
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  performanceMonitor.start(name);
  try {
    const result = await fn();
    performanceMonitor.end(name);
    return result;
  } catch (error) {
    performanceMonitor.end(name);
    throw error;
  }
}

/**
 * Performance observer for automatic monitoring
 */
export class AutoPerformanceObserver {
  private observer: PerformanceObserver | null = null;

  start(): void {
    if (typeof window.PerformanceObserver === 'undefined') return;

    this.observer = new window.PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.duration > 1000) {
          console.warn(`Slow operation detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
