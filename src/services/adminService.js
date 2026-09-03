const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const adminService = {
  getPlatformDashboard: async () => {
    await delay(300);
    return {
      totalTenants: 12450,
      activeUsers24h: 8432,
      apiUptime: '99.98%',
      systemStatus: 'Operational',
      activeIncidents: 0
    };
  },

  getUserStatistics: async () => {
    await delay(300);
    return {
      totalUsers: 14205,
      activeSubscriptions: 8900,
      signupTrend: [
        { name: 'Mon', signups: 145 },
        { name: 'Tue', signups: 162 },
        { name: 'Wed', signups: 130 },
        { name: 'Thu', signups: 180 },
        { name: 'Fri', signups: 155 },
        { name: 'Sat', signups: 80 },
        { name: 'Sun', signups: 95 },
      ]
    };
  },

  getDatabaseHealth: async () => {
    await delay(300);
    return {
      clusterStatus: 'Healthy',
      readIops: '12,450',
      writeIops: '8,210',
      avgLatencyMs: 14,
      nodesActive: 3,
      nodesTotal: 3
    };
  },

  getStorageMonitoring: async () => {
    await delay(300);
    return {
      totalAllocatedTb: 50,
      totalUsedTb: 12.4,
      buckets: [
        { name: 'us-east-media', usedTb: 8.2, capacityTb: 20 },
        { name: 'eu-west-media', usedTb: 3.1, capacityTb: 10 },
        { name: 'db-backups-cold', usedTb: 1.1, capacityTb: 20 }
      ]
    };
  },

  getPerformanceMetrics: async () => {
    await delay(300);
    return {
      avgResponseTimeMs: 124,
      p99ResponseTimeMs: 450,
      errorRate: '0.02%',
      requestsPerMinute: 45200
    };
  },

  getSystemLogs: async () => {
    await delay(300);
    return [
      { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: 'INFO', service: 'auth-service', message: 'JWT token rotation completed', ip: '10.0.1.45' },
      { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), level: 'WARN', service: 'db-cluster', message: 'High memory usage on node-2', ip: '10.0.1.12' },
      { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), level: 'ERROR', service: 'payment-gateway', message: 'Webhook timeout from upstream provider', ip: '10.0.1.88' },
      { id: 4, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), level: 'INFO', service: 'storage-service', message: 'S3 bucket sync successful', ip: '10.0.1.92' },
      { id: 5, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), level: 'INFO', service: 'api-gateway', message: 'Rate limit applied for IP 192.168.1.5', ip: '10.0.1.10' }
    ];
  },

  getBackupStatus: async () => {
    await delay(300);
    return {
      lastFullBackup: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
      lastIncrementalBackup: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      nextScheduled: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // in 2 hours
      status: 'Success',
      sizeGb: 450.5
    };
  }
};
