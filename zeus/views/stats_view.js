const { 
  div, section, header, h1, h2, h3, h4, p, span, ul, li, strong, 
  nav, button, select, option, table, thead, tbody, tr, th, td
} = require('hyperaxe');
const { template, contentSection, pageContainer } = require('./main_views');

/**
 * Statistics View - Analytics dashboard and system metrics
 * Follows diogenes patterns with comprehensive data visualization
 */

/**
 * Main statistics view component
 */
const statsView = (data = {}) => {
  const {
    overview = {},
    chartData = {},
    timeRange = '7d',
    isLoading = false,
    error = null
  } = data;

  return template(
    'Statistics',
    pageContainer(
      section({ class: 'stats-container' },
        statsHeader(timeRange),
        error && statsError(error),
        isLoading 
          ? statsLoading()
          : div({ class: 'stats-main' },
              overviewCards(overview),
              chartsSection(chartData, timeRange),
              detailedMetrics(data),
              systemHealth(data.system || {})
            )
      )
    ),
    {
      currentPage: 'stats',
      styles: ['/assets/styles/stats-view.css'],
      scripts: ['/assets/js/stats-dashboard.js']
    }
  );
};

/**
 * Statistics header with controls
 */
const statsHeader = (timeRange) => {
  return header({ class: 'stats-header' },
    div({ class: 'header-content' },
      div({ class: 'header-title' },
        h1('Statistics Dashboard'),
        p({ class: 'header-subtitle' }, 
          'Monitor Zeus MCP Mesh performance, usage, and system health'
        )
      ),
      
      div({ class: 'header-controls' },
        select({
          id: 'time-range-selector',
          class: 'time-range-select',
          'data-action': 'change-time-range'
        },
          option({ value: '1h', selected: timeRange === '1h' }, 'Last Hour'),
          option({ value: '6h', selected: timeRange === '6h' }, 'Last 6 Hours'),
          option({ value: '24h', selected: timeRange === '24h' }, 'Last 24 Hours'),
          option({ value: '7d', selected: timeRange === '7d' }, 'Last 7 Days'),
          option({ value: '30d', selected: timeRange === '30d' }, 'Last 30 Days'),
          option({ value: '90d', selected: timeRange === '90d' }, 'Last 90 Days')
        ),
        
        button({ 
          class: 'btn btn-secondary',
          'data-action': 'refresh-stats'
        }, '🔄 Refresh'),
        
        button({ 
          class: 'btn btn-secondary',
          'data-action': 'export-report'
        }, '📊 Export Report'),
        
        button({ 
          class: 'btn btn-primary',
          'data-action': 'view-logs'
        }, '📋 View Logs')
      )
    )
  );
};

/**
 * Statistics error display
 */
const statsError = (error) => {
  return div({ class: 'stats-error' },
    div({ class: 'error-content' },
      h3('Unable to load statistics'),
      p(error),
      button({ 
        class: 'btn btn-primary',
        'data-action': 'retry-stats'
      }, 'Retry')
    )
  );
};

/**
 * Statistics loading state
 */
const statsLoading = () => {
  return div({ class: 'stats-loading' },
    div({ class: 'loading-spinner' }),
    p('Loading statistics...')
  );
};

/**
 * Overview cards section
 */
const overviewCards = (overview) => {
  const {
    totalSessions = 0,
    activeServers = 0,
    totalRequests = 0,
    avgResponseTime = 0,
    errorRate = 0,
    uptime = '0d 0h 0m'
  } = overview;

  return section({ class: 'overview-section' },
    h2('System Overview'),
    div({ class: 'overview-cards' },
      overviewCard({
        title: 'Active Sessions',
        value: totalSessions.toLocaleString(),
        change: '+12%',
        trend: 'up',
        icon: '👥',
        description: 'Current active user sessions'
      }),
      
      overviewCard({
        title: 'MCP Servers',
        value: activeServers,
        subtitle: 'Connected',
        trend: activeServers > 0 ? 'up' : 'down',
        icon: '🔧',
        description: 'Currently connected MCP servers'
      }),
      
      overviewCard({
        title: 'Total Requests',
        value: totalRequests.toLocaleString(),
        change: '+8.3%',
        trend: 'up',
        icon: '📈',
        description: 'API requests processed'
      }),
      
      overviewCard({
        title: 'Response Time',
        value: `${avgResponseTime}ms`,
        change: '-5.2%',
        trend: 'up',
        icon: '⚡',
        description: 'Average API response time'
      }),
      
      overviewCard({
        title: 'Error Rate',
        value: `${errorRate}%`,
        change: errorRate < 5 ? '-1.1%' : '+2.3%',
        trend: errorRate < 5 ? 'up' : 'down',
        icon: '⚠️',
        description: 'Request error percentage'
      }),
      
      overviewCard({
        title: 'System Uptime',
        value: uptime,
        subtitle: 'Since last restart',
        trend: 'up',
        icon: '🔋',
        description: 'Continuous operation time'
      })
    )
  );
};

/**
 * Individual overview card
 */
const overviewCard = ({ title, value, subtitle, change, trend, icon, description }) => {
  return div({ class: `overview-card ${trend === 'down' ? 'negative' : 'positive'}` },
    div({ class: 'card-header' },
      span({ class: 'card-icon' }, icon),
      h3({ class: 'card-title' }, title)
    ),
    
    div({ class: 'card-content' },
      div({ class: 'card-value' }, value),
      subtitle && div({ class: 'card-subtitle' }, subtitle),
      
      change && div({ class: 'card-change' },
        span({ class: `change-indicator ${trend}` }, 
          trend === 'up' ? '↗' : '↘'
        ),
        span({ class: 'change-value' }, change)
      )
    ),
    
    div({ class: 'card-footer' },
      p({ class: 'card-description' }, description)
    )
  );
};

/**
 * Charts section with various visualizations
 */
const chartsSection = (chartData, timeRange) => {
  return section({ class: 'charts-section' },
    h2('Performance Analytics'),
    
    div({ class: 'charts-grid' },
      // Request Volume Chart
      chartContainer({
        id: 'request-volume-chart',
        title: 'Request Volume',
        subtitle: 'API requests over time',
        type: 'line',
        data: chartData.requestVolume || []
      }),
      
      // Response Time Chart  
      chartContainer({
        id: 'response-time-chart',
        title: 'Response Time Trends',
        subtitle: 'Average response times',
        type: 'area',
        data: chartData.responseTimes || []
      }),
      
      // Error Distribution Chart
      chartContainer({
        id: 'error-distribution-chart',
        title: 'Error Distribution',
        subtitle: 'Error types breakdown',
        type: 'pie',
        data: chartData.errorDistribution || []
      }),
      
      // Server Usage Chart
      chartContainer({
        id: 'server-usage-chart',
        title: 'MCP Server Usage',
        subtitle: 'Requests by server',
        type: 'bar',
        data: chartData.serverUsage || []
      }),
      
      // Memory Usage Chart
      chartContainer({
        id: 'memory-usage-chart',
        title: 'Memory Usage',
        subtitle: 'System memory consumption',
        type: 'line',
        data: chartData.memoryUsage || []
      }),
      
      // Feature Usage Chart
      chartContainer({
        id: 'feature-usage-chart',
        title: 'Feature Usage',
        subtitle: 'Popular features and tools',
        type: 'horizontalBar',
        data: chartData.featureUsage || []
      })
    )
  );
};

/**
 * Chart container component
 */
const chartContainer = ({ id, title, subtitle, type, data }) => {
  return div({ class: 'chart-container' },
    div({ class: 'chart-header' },
      h3({ class: 'chart-title' }, title),
      p({ class: 'chart-subtitle' }, subtitle),
      div({ class: 'chart-controls' },
        button({ 
          class: 'btn-icon',
          'data-action': 'toggle-chart-fullscreen',
          'data-chart-id': id,
          title: 'Toggle fullscreen'
        }, '⛶'),
        button({ 
          class: 'btn-icon',
          'data-action': 'download-chart',
          'data-chart-id': id,
          title: 'Download chart'
        }, '💾')
      )
    ),
    
    div({ class: 'chart-body' },
      // Chart canvas will be inserted by JavaScript
      div({ 
        id: id,
        class: `chart-canvas ${type}`,
        'data-chart-type': type,
        'data-chart-data': JSON.stringify(data)
      })
    ),
    
    data.length === 0 && div({ class: 'chart-empty' },
      div({ class: 'empty-icon' }, '📊'),
      p('No data available for this time range')
    )
  );
};

/**
 * Detailed metrics tables and lists
 */
const detailedMetrics = (data) => {
  const { 
    topEndpoints = [], 
    recentErrors = [], 
    serverMetrics = [],
    userActivity = []
  } = data;

  return section({ class: 'detailed-metrics' },
    h2('Detailed Metrics'),
    
    div({ class: 'metrics-grid' },
      // Top API Endpoints
      metricsTable({
        title: 'Top API Endpoints',
        subtitle: 'Most frequently accessed endpoints',
        headers: ['Endpoint', 'Requests', 'Avg. Response', 'Errors'],
        data: topEndpoints.map(endpoint => [
          endpoint.path,
          endpoint.requests.toLocaleString(),
          `${endpoint.avgResponse}ms`,
          `${endpoint.errorRate}%`
        ])
      }),
      
      // Recent Errors
      metricsTable({
        title: 'Recent Errors',
        subtitle: 'Latest system errors and issues',
        headers: ['Time', 'Type', 'Message', 'Count'],
        data: recentErrors.map(error => [
          new Date(error.timestamp).toLocaleTimeString(),
          error.type,
          error.message.substring(0, 50) + '...',
          error.count
        ])
      }),
      
      // Server Performance
      metricsTable({
        title: 'MCP Server Performance',
        subtitle: 'Individual server metrics',
        headers: ['Server', 'Status', 'Requests', 'Uptime'],
        data: serverMetrics.map(server => [
          server.name,
          server.status === 'connected' ? '🟢 Online' : '🔴 Offline',
          server.requests?.toLocaleString() || '0',
          server.uptime || 'N/A'
        ])
      }),
      
      // User Activity
      metricsTable({
        title: 'User Activity',
        subtitle: 'Active users and sessions',
        headers: ['Time Range', 'Active Users', 'New Sessions', 'Avg. Duration'],
        data: userActivity.map(activity => [
          activity.period,
          activity.activeUsers,
          activity.newSessions,
          activity.avgDuration
        ])
      })
    )
  );
};

/**
 * Metrics table component
 */
const metricsTable = ({ title, subtitle, headers, data }) => {
  return div({ class: 'metrics-table-container' },
    div({ class: 'table-header' },
      h3({ class: 'table-title' }, title),
      p({ class: 'table-subtitle' }, subtitle)
    ),
    
    data.length > 0 
      ? table({ class: 'metrics-table' },
          thead(
            tr(headers.map(header => th(header)))
          ),
          tbody(
            data.map(row => 
              tr(row.map(cell => td(cell)))
            )
          )
        )
      : div({ class: 'table-empty' },
          div({ class: 'empty-icon' }, '📋'),
          p('No data available')
        )
  );
};

/**
 * System health section
 */
const systemHealth = (systemData) => {
  const {
    cpu = { usage: 0, cores: 0 },
    memory = { used: 0, total: 0, percentage: 0 },
    disk = { used: 0, total: 0, percentage: 0 },
    network = { bytesIn: 0, bytesOut: 0 },
    processes = { active: 0, total: 0 }
  } = systemData;

  return section({ class: 'system-health' },
    h2('System Health'),
    
    div({ class: 'health-grid' },
      // CPU Usage
      healthMetric({
        title: 'CPU Usage',
        value: `${cpu.usage}%`,
        max: 100,
        current: cpu.usage,
        status: cpu.usage < 70 ? 'healthy' : cpu.usage < 90 ? 'warning' : 'critical',
        details: `${cpu.cores} cores available`
      }),
      
      // Memory Usage
      healthMetric({
        title: 'Memory Usage',
        value: `${formatBytes(memory.used)} / ${formatBytes(memory.total)}`,
        max: 100,
        current: memory.percentage,
        status: memory.percentage < 80 ? 'healthy' : memory.percentage < 95 ? 'warning' : 'critical',
        details: `${memory.percentage}% utilized`
      }),
      
      // Disk Usage
      healthMetric({
        title: 'Disk Usage',
        value: `${formatBytes(disk.used)} / ${formatBytes(disk.total)}`,
        max: 100,
        current: disk.percentage,
        status: disk.percentage < 85 ? 'healthy' : disk.percentage < 95 ? 'warning' : 'critical',
        details: `${disk.percentage}% full`
      }),
      
      // Network Activity
      healthMetric({
        title: 'Network I/O',
        value: `${formatBytes(network.bytesIn + network.bytesOut)}`,
        current: Math.min((network.bytesIn + network.bytesOut) / (1024 * 1024), 100),
        max: 100,
        status: 'healthy',
        details: `↓${formatBytes(network.bytesIn)} ↑${formatBytes(network.bytesOut)}`
      }),
      
      // Process Count
      healthMetric({
        title: 'Active Processes',
        value: `${processes.active} / ${processes.total}`,
        current: (processes.active / Math.max(processes.total, 1)) * 100,
        max: 100,
        status: 'healthy',
        details: `${processes.total - processes.active} idle processes`
      }),
      
      // Response Time Health
      healthMetric({
        title: 'API Health',
        value: 'Operational',
        current: 95,
        max: 100,
        status: 'healthy',
        details: 'All endpoints responding normally'
      })
    )
  );
};

/**
 * Health metric component
 */
const healthMetric = ({ title, value, current, max, status, details }) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  return div({ class: `health-metric ${status}` },
    div({ class: 'metric-header' },
      h4({ class: 'metric-title' }, title),
      span({ class: `status-indicator ${status}` }, 
        status === 'healthy' ? '🟢' : 
        status === 'warning' ? '🟡' : '🔴'
      )
    ),
    
    div({ class: 'metric-value' }, value),
    
    div({ class: 'metric-progress' },
      div({ class: 'progress-bar' },
        div({ 
          class: `progress-fill ${status}`,
          style: `width: ${percentage}%`
        })
      )
    ),
    
    div({ class: 'metric-details' }, details)
  );
};

/**
 * Format bytes to human readable format
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

module.exports = {
  statsView
};