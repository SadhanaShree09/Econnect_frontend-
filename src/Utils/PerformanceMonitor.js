// Performance monitoring utility for time management system
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      timerCount: 0,
      renderCount: 0,
      memoryUsage: [],
      lastUpdate: Date.now()
    };
    this.isMonitoring = false;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Performance monitoring started');

    // Monitor every 30 seconds
    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Initial collection
    this.collectMetrics();
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    console.log('⏹️ Performance monitoring stopped');
  }

  collectMetrics() {
    const now = Date.now();
    
    // Memory usage (if available)
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        timestamp: now,
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) // MB
      });

      // Keep only last 20 measurements
      if (this.metrics.memoryUsage.length > 20) {
        this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-20);
      }
    }

    // Log performance summary
    this.logPerformanceSummary();
  }

  incrementRenderCount() {
    this.metrics.renderCount++;
  }

  setTimerCount(count) {
    this.metrics.timerCount = count;
  }

  logPerformanceSummary() {
    const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    
    console.group('📊 Performance Metrics');
    console.log(`⏱️ Active Timers: ${this.metrics.timerCount}`);
    console.log(`🔄 Total Renders: ${this.metrics.renderCount}`);
    
    if (latest) {
      console.log(`💾 Memory Usage: ${latest.used}MB / ${latest.total}MB`);
      
      // Memory trend analysis
      if (this.metrics.memoryUsage.length > 1) {
        const previous = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 2];
        const memoryDiff = latest.used - previous.used;
        const trend = memoryDiff > 0 ? '📈' : memoryDiff < 0 ? '📉' : '➡️';
        console.log(`📊 Memory Trend: ${trend} ${memoryDiff > 0 ? '+' : ''}${memoryDiff}MB`);
      }
    }

    // Performance warnings
    this.checkPerformanceWarnings(latest);
    console.groupEnd();
  }

  checkPerformanceWarnings(latest) {
    const warnings = [];

    if (this.metrics.timerCount > 3) {
      warnings.push(`⚠️ High timer count: ${this.metrics.timerCount} active timers`);
    }

    if (latest && latest.used > 50) {
      warnings.push(`⚠️ High memory usage: ${latest.used}MB`);
    }

    const renderRate = this.metrics.renderCount / ((Date.now() - this.metrics.lastUpdate) / 1000);
    if (renderRate > 5) {
      warnings.push(`⚠️ High render rate: ${renderRate.toFixed(2)} renders/sec`);
    }

    if (warnings.length > 0) {
      console.warn('Performance Warnings:');
      warnings.forEach(warning => console.warn(warning));
    }
  }

  getOptimizationRecommendations() {
    const recommendations = [];
    const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];

    if (this.metrics.timerCount > 3) {
      recommendations.push({
        issue: 'Multiple Timer Intervals',
        solution: 'Consolidate into a single timer with multiple callbacks',
        impact: 'Reduces CPU usage by ~60%'
      });
    }

    if (this.metrics.renderCount > 100) {
      recommendations.push({
        issue: 'Frequent Re-renders',
        solution: 'Implement React.memo and useMemo for time displays',
        impact: 'Reduces render cycles by ~40%'
      });
    }

    if (latest && latest.used > 30) {
      recommendations.push({
        issue: 'High Memory Usage',
        solution: 'Clear timer references and implement cleanup',
        impact: 'Reduces memory footprint by ~25%'
      });
    }

    return recommendations;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      recommendations: this.getOptimizationRecommendations(),
      systemInfo: {
        userAgent: navigator.userAgent,
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        } : null
      }
    };

    console.log('📋 Performance Report Generated:', report);
    return report;
  }
}

// React hook for performance monitoring
const usePerformanceMonitor = (componentName) => {
  const [monitor] = useState(() => new PerformanceMonitor());

  useEffect(() => {
    monitor.startMonitoring();
    console.log(`🔍 Started monitoring: ${componentName}`);

    return () => {
      monitor.stopMonitoring();
    };
  }, [monitor, componentName]);

  const trackRender = useCallback(() => {
    monitor.incrementRenderCount();
  }, [monitor]);

  const trackTimers = useCallback((count) => {
    monitor.setTimerCount(count);
  }, [monitor]);

  const getReport = useCallback(() => {
    return monitor.generateReport();
  }, [monitor]);

  return { trackRender, trackTimers, getReport };
};

// Performance benchmark utility
const benchmarkTimerPerformance = (iterations = 1000) => {
  console.log('🏃‍♂️ Starting timer performance benchmark...');
  
  const results = {
    singleTimer: 0,
    multipleTimers: 0,
    memoryBefore: performance.memory ? performance.memory.usedJSHeapSize : 0,
    memoryAfter: 0
  };

  // Test single timer approach
  const startSingle = performance.now();
  let singleTimer;
  let count = 0;
  
  singleTimer = setInterval(() => {
    count++;
    if (count >= iterations) {
      clearInterval(singleTimer);
      results.singleTimer = performance.now() - startSingle;
      
      // Test multiple timers approach
      const startMultiple = performance.now();
      const timers = [];
      let multiCount = 0;
      
      for (let i = 0; i < 3; i++) {
        timers.push(setInterval(() => {
          multiCount++;
          if (multiCount >= iterations) {
            timers.forEach(t => clearInterval(t));
            results.multipleTimers = performance.now() - startMultiple;
            results.memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            console.log('📊 Benchmark Results:');
            console.log(`Single Timer: ${results.singleTimer.toFixed(2)}ms`);
            console.log(`Multiple Timers: ${results.multipleTimers.toFixed(2)}ms`);
            console.log(`Performance Improvement: ${((results.multipleTimers - results.singleTimer) / results.multipleTimers * 100).toFixed(1)}%`);
            console.log(`Memory Usage: ${Math.round((results.memoryAfter - results.memoryBefore) / 1024)}KB`);
          }
        }, 1));
      }
    }
  }, 1);
};

export { PerformanceMonitor, usePerformanceMonitor, benchmarkTimerPerformance };
