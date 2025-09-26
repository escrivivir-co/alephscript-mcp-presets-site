/**
 * Statistics Dashboard Client-Side Functionality
 * Handles data visualization, real-time updates, and interactive analytics
 */

class StatsDashboard {
  constructor() {
    this.currentTimeRange = '7d';
    this.charts = {};
    this.refreshInterval = null;
    this.refreshRate = 30000; // 30 seconds
    this.isLoading = false;
    
    this.init();
  }

  /**
   * Initialize the statistics dashboard
   */
  init() {
    this.bindEvents();
    this.setupCharts();
    this.loadInitialData();
    this.startAutoRefresh();
    this.setupRealTimeUpdates();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    // Time range selector
    const timeRangeSelector = document.getElementById('time-range-selector');
    if (timeRangeSelector) {
      timeRangeSelector.addEventListener('change', this.handleTimeRangeChange.bind(this));
    }

    // Button actions
    document.addEventListener('click', this.handleClick.bind(this));

    // Window resize for chart responsiveness
    window.addEventListener('resize', this.handleResize.bind(this));

    // Visibility change to pause/resume updates
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handle click events with delegation
   */
  handleClick(event) {
    const action = event.target.dataset.action;
    if (!action) return;

    event.preventDefault();

    switch (action) {
      case 'change-time-range':
        // Handled by change event
        break;
      case 'refresh-stats':
        this.refreshData();
        break;
      case 'export-report':
        this.exportReport();
        break;
      case 'view-logs':
        this.viewSystemLogs();
        break;
      case 'retry-stats':
        this.loadInitialData();
        break;
      case 'toggle-chart-fullscreen':
        this.toggleChartFullscreen(event.target.dataset.chartId);
        break;
      case 'download-chart':
        this.downloadChart(event.target.dataset.chartId);
        break;
    }
  }

  /**
   * Handle time range changes
   */
  handleTimeRangeChange(event) {
    const newTimeRange = event.target.value;
    if (newTimeRange !== this.currentTimeRange) {
      this.currentTimeRange = newTimeRange;
      this.refreshData();
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.resizeCharts();
    }, 250);
  }

  /**
   * Handle visibility change (tab switching)
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseAutoRefresh();
    } else {
      this.resumeAutoRefresh();
      this.refreshData(); // Refresh when tab becomes visible
    }
  }

  /**
   * Load initial dashboard data
   */
  async loadInitialData() {
    this.setLoadingState(true);

    try {
      const [overviewData, chartData, metricsData, systemData] = await Promise.all([
        this.fetchOverviewData(),
        this.fetchChartData(),
        this.fetchDetailedMetrics(),
        this.fetchSystemHealth()
      ]);

      this.updateOverviewCards(overviewData);
      this.updateCharts(chartData);
      this.updateDetailedMetrics(metricsData);
      this.updateSystemHealth(systemData);

      this.setError(null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.setError(error.message);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Refresh all dashboard data
   */
  async refreshData() {
    if (this.isLoading) return;

    try {
      this.showRefreshIndicator();
      await this.loadInitialData();
      this.showNotification('Dashboard updated', 'success');
    } catch (error) {
      this.showNotification('Failed to refresh data', 'error');
    } finally {
      this.hideRefreshIndicator();
    }
  }

  /**
   * Fetch overview statistics
   */
  async fetchOverviewData() {
    const response = await fetch(`/api/stats/overview?timeRange=${this.currentTimeRange}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch overview data');
    }
    
    return data.data;
  }

  /**
   * Fetch chart data
   */
  async fetchChartData() {
    const response = await fetch(`/api/stats/charts?timeRange=${this.currentTimeRange}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch chart data');
    }
    
    return data.data;
  }

  /**
   * Fetch detailed metrics
   */
  async fetchDetailedMetrics() {
    const response = await fetch(`/api/stats/detailed?timeRange=${this.currentTimeRange}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch detailed metrics');
    }
    
    return data.data;
  }

  /**
   * Fetch system health data
   */
  async fetchSystemHealth() {
    const response = await fetch('/api/stats/system-health');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch system health');
    }
    
    return data.data;
  }

  /**
   * Setup chart instances
   */
  setupCharts() {
    // Only setup charts if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, charts will not be available');
      return;
    }

    // Configure Chart.js defaults
    Chart.defaults.color = getComputedStyle(document.documentElement)
      .getPropertyValue('--text-secondary').trim();
    Chart.defaults.borderColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--border-color').trim();

    // Initialize chart containers
    this.initializeChart('request-volume-chart', 'line');
    this.initializeChart('response-time-chart', 'line');
    this.initializeChart('error-distribution-chart', 'pie');
    this.initializeChart('server-usage-chart', 'bar');
    this.initializeChart('memory-usage-chart', 'line');
    this.initializeChart('feature-usage-chart', 'horizontalBar');
  }

  /**
   * Initialize individual chart
   */
  initializeChart(chartId, type) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;

    // Create canvas element if it doesn't exist
    if (!canvas.querySelector('canvas')) {
      const canvasEl = document.createElement('canvas');
      canvasEl.style.width = '100%';
      canvasEl.style.height = '100%';
      canvas.appendChild(canvasEl);
    }

    const ctx = canvas.querySelector('canvas').getContext('2d');
    
    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          cornerRadius: 6,
          displayColors: true
        }
      },
      scales: type !== 'pie' && type !== 'horizontalBar' ? {
        x: {
          grid: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--border-color').trim()
          }
        },
        y: {
          grid: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--border-color').trim()
          }
        }
      } : {}
    };

    // Create chart instance
    this.charts[chartId] = new Chart(ctx, {
      type: type === 'horizontalBar' ? 'bar' : type,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        ...commonOptions,
        ...(type === 'horizontalBar' ? { indexAxis: 'y' } : {})
      }
    });
  }

  /**
   * Update charts with new data
   */
  updateCharts(chartData) {
    Object.keys(chartData).forEach(chartKey => {
      const chartId = this.getChartId(chartKey);
      const chart = this.charts[chartId];
      
      if (chart && chartData[chartKey]) {
        this.updateChart(chart, chartData[chartKey], chartKey);
      }
    });
  }

  /**
   * Update individual chart
   */
  updateChart(chart, data, type) {
    if (!data || !Array.isArray(data)) return;

    switch (type) {
      case 'requestVolume':
      case 'responseTimes':
      case 'memoryUsage':
        this.updateLineChart(chart, data);
        break;
      case 'errorDistribution':
        this.updatePieChart(chart, data);
        break;
      case 'serverUsage':
      case 'featureUsage':
        this.updateBarChart(chart, data);
        break;
    }

    chart.update('active');
  }

  /**
   * Update line chart data
   */
  updateLineChart(chart, data) {
    chart.data.labels = data.map(item => this.formatTimestamp(item.timestamp));
    chart.data.datasets = [{
      label: 'Value',
      data: data.map(item => item.value),
      borderColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-primary').trim(),
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-light').trim(),
      tension: 0.4,
      fill: true
    }];
  }

  /**
   * Update pie chart data
   */
  updatePieChart(chart, data) {
    chart.data.labels = data.map(item => item.label);
    chart.data.datasets = [{
      data: data.map(item => item.value),
      backgroundColor: this.generateColorPalette(data.length),
      borderWidth: 2,
      borderColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-secondary').trim()
    }];
  }

  /**
   * Update bar chart data
   */
  updateBarChart(chart, data) {
    chart.data.labels = data.map(item => item.label);
    chart.data.datasets = [{
      label: 'Value',
      data: data.map(item => item.value),
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-light').trim(),
      borderColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-primary').trim(),
      borderWidth: 1
    }];
  }

  /**
   * Update overview cards
   */
  updateOverviewCards(data) {
    // Update individual card values
    Object.keys(data).forEach(key => {
      const element = document.querySelector(`[data-metric="${key}"] .card-value`);
      if (element) {
        this.animateValue(element, data[key]);
      }
    });
  }

  /**
   * Update detailed metrics tables
   */
  updateDetailedMetrics(data) {
    // Update tables with new data
    this.updateMetricsTable('top-endpoints', data.topEndpoints || []);
    this.updateMetricsTable('recent-errors', data.recentErrors || []);
    this.updateMetricsTable('server-metrics', data.serverMetrics || []);
    this.updateMetricsTable('user-activity', data.userActivity || []);
  }

  /**
   * Update system health metrics
   */
  updateSystemHealth(data) {
    Object.keys(data).forEach(metric => {
      this.updateHealthMetric(metric, data[metric]);
    });
  }

  /**
   * Update individual health metric
   */
  updateHealthMetric(metricName, metricData) {
    const container = document.querySelector(`[data-health-metric="${metricName}"]`);
    if (!container) return;

    const valueElement = container.querySelector('.metric-value');
    const progressElement = container.querySelector('.progress-fill');
    const statusElement = container.querySelector('.status-indicator');

    if (valueElement) {
      valueElement.textContent = metricData.value || '0';
    }

    if (progressElement && metricData.percentage !== undefined) {
      progressElement.style.width = `${metricData.percentage}%`;
      progressElement.className = `progress-fill ${metricData.status || 'healthy'}`;
    }

    if (statusElement) {
      const statusIcon = metricData.status === 'healthy' ? '🟢' :
                        metricData.status === 'warning' ? '🟡' : '🔴';
      statusElement.textContent = statusIcon;
    }
  }

  /**
   * Resize all charts
   */
  resizeCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.resize();
      }
    });
  }

  /**
   * Toggle chart fullscreen
   */
  toggleChartFullscreen(chartId) {
    const container = document.getElementById(chartId)?.closest('.chart-container');
    if (!container) return;

    if (container.classList.contains('fullscreen')) {
      this.exitFullscreen(container);
    } else {
      this.enterFullscreen(container);
    }
  }

  /**
   * Enter fullscreen mode for chart
   */
  enterFullscreen(container) {
    container.classList.add('fullscreen');
    
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'chart-fullscreen-overlay';
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Resize chart
    setTimeout(() => {
      const chartId = container.querySelector('.chart-canvas').id;
      const chart = this.charts[chartId];
      if (chart) {
        chart.resize();
      }
    }, 100);
    
    // Add escape key listener
    this.fullscreenEscapeListener = (e) => {
      if (e.key === 'Escape') {
        this.exitFullscreen(container);
      }
    };
    document.addEventListener('keydown', this.fullscreenEscapeListener);
  }

  /**
   * Exit fullscreen mode for chart
   */
  exitFullscreen(container) {
    const overlay = document.querySelector('.chart-fullscreen-overlay');
    if (overlay) {
      // Move container back to original position
      const originalParent = overlay.previousElementSibling || 
                           document.querySelector('.charts-grid');
      if (originalParent) {
        originalParent.appendChild(container);
      }
      
      overlay.remove();
    }
    
    container.classList.remove('fullscreen');
    
    // Remove escape key listener
    if (this.fullscreenEscapeListener) {
      document.removeEventListener('keydown', this.fullscreenEscapeListener);
      this.fullscreenEscapeListener = null;
    }
    
    // Resize chart
    setTimeout(() => {
      const chartId = container.querySelector('.chart-canvas').id;
      const chart = this.charts[chartId];
      if (chart) {
        chart.resize();
      }
    }, 100);
  }

  /**
   * Download chart as image
   */
  downloadChart(chartId) {
    const chart = this.charts[chartId];
    if (!chart) return;

    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = `${chartId}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export comprehensive report
   */
  async exportReport() {
    try {
      this.showNotification('Generating report...', 'info');
      
      const response = await fetch(`/api/stats/export?timeRange=${this.currentTimeRange}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zeus-stats-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.showNotification('Report downloaded successfully', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      this.showNotification('Failed to export report', 'error');
    }
  }

  /**
   * View system logs
   */
  viewSystemLogs() {
    window.open('/logs', '_blank');
  }

  /**
   * Start automatic data refresh
   */
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      if (!document.hidden) {
        this.refreshData();
      }
    }, this.refreshRate);
  }

  /**
   * Pause automatic refresh
   */
  pauseAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Resume automatic refresh
   */
  resumeAutoRefresh() {
    if (!this.refreshInterval) {
      this.startAutoRefresh();
    }
  }

  /**
   * Setup real-time updates via WebSocket
   */
  setupRealTimeUpdates() {
    if (typeof io === 'undefined') return;

    const socket = io();
    
    socket.on('stats-update', (data) => {
      this.handleRealTimeUpdate(data);
    });
    
    socket.on('system-alert', (alert) => {
      this.handleSystemAlert(alert);
    });
  }

  /**
   * Handle real-time statistics updates
   */
  handleRealTimeUpdate(data) {
    if (data.type === 'overview') {
      this.updateOverviewCards(data.data);
    } else if (data.type === 'system-health') {
      this.updateSystemHealth(data.data);
    }
  }

  /**
   * Handle system alerts
   */
  handleSystemAlert(alert) {
    const severity = alert.severity || 'info';
    this.showNotification(`System Alert: ${alert.message}`, severity);
    
    if (severity === 'critical') {
      this.highlightCriticalMetrics(alert.metrics);
    }
  }

  /**
   * Utility functions
   */
  
  getChartId(chartKey) {
    const mapping = {
      requestVolume: 'request-volume-chart',
      responseTimes: 'response-time-chart',
      errorDistribution: 'error-distribution-chart',
      serverUsage: 'server-usage-chart',
      memoryUsage: 'memory-usage-chart',
      featureUsage: 'feature-usage-chart'
    };
    return mapping[chartKey] || chartKey;
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  generateColorPalette(count) {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }

  animateValue(element, endValue, duration = 1000) {
    const startValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
    const startTime = performance.now();

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = startValue + (endValue - startValue) * this.easeOutQuart(progress);
      element.textContent = this.formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }

  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toString();
  }

  updateMetricsTable(tableId, data) {
    // Implementation for updating metrics tables
    console.log(`Updating table ${tableId} with data:`, data);
  }

  highlightCriticalMetrics(metrics) {
    // Implementation for highlighting critical metrics
    console.log('Highlighting critical metrics:', metrics);
  }

  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    document.body.classList.toggle('stats-loading', isLoading);
  }

  setError(error) {
    const errorElements = document.querySelectorAll('.stats-error');
    errorElements.forEach(el => {
      el.style.display = error ? 'block' : 'none';
      if (error) {
        const errorText = el.querySelector('p');
        if (errorText) errorText.textContent = error;
      }
    });
  }

  showRefreshIndicator() {
    const refreshBtn = document.querySelector('[data-action="refresh-stats"]');
    if (refreshBtn) {
      refreshBtn.classList.add('refreshing');
      refreshBtn.textContent = '🔄 Refreshing...';
    }
  }

  hideRefreshIndicator() {
    const refreshBtn = document.querySelector('[data-action="refresh-stats"]');
    if (refreshBtn) {
      refreshBtn.classList.remove('refreshing');
      refreshBtn.textContent = '🔄 Refresh';
    }
  }

  showNotification(message, type = 'info') {
    // Implementation would show a notification
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}

// Initialize Statistics Dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.stats-container')) {
    window.statsDashboard = new StatsDashboard();
  }
});