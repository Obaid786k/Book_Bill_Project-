const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const accountService = {
  getOverview: async () => {
    await delay(400);
    return {
      storageUsedMb: 1240, // 1.24 GB
      storageTotalMb: 5120, // 5 GB
      billsCount: 1420,
      productCount: 156,
      draftCount: 12,
      templateCount: 4,
      lastLogin: new Date().toLocaleString(),
      accountStatus: 'Active Pro Plan'
    };
  },
  
  getStorageDetails: async () => {
    await delay(400);
    return {
      totalCapacityMb: 5120,
      usedMb: 1240,
      breakdown: [
        { name: 'PDF Invoices', value: 850, color: '#0A2540' },
        { name: 'Product Images', value: 300, color: '#0077C8' },
        { name: 'Database Data', value: 90, color: '#40E0D0' }
      ]
    };
  },
  
  getUsageStatistics: async () => {
    await delay(400);
    // Mock system activity over the last 7 days
    return [
      { name: 'Mon', logins: 2, actions: 45 },
      { name: 'Tue', logins: 3, actions: 60 },
      { name: 'Wed', logins: 1, actions: 35 },
      { name: 'Thu', logins: 4, actions: 80 },
      { name: 'Fri', logins: 2, actions: 55 },
      { name: 'Sat', logins: 0, actions: 10 },
      { name: 'Sun', logins: 1, actions: 25 },
    ];
  },
  
  getSecurityInfo: async () => {
    await delay(400);
    return {
      currentSession: {
        device: 'Chrome on Windows 11',
        ip: '192.168.1.145',
        location: 'Mumbai, India (Approx)',
        started: '2 hours ago'
      },
      lastPasswordChange: '45 days ago',
      twoFactorEnabled: false
    };
  }
};
