// src/services/dashboardService.js
// TODO: Replace with real Supabase API calls in the Backend Phase

const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDashboardData = {
  health: {
        todayRevenue: 24500,
        billsToday: 12,
        pendingPayments: 45000,
        outstandingAmount: 125000,
        alerts: [
          { type: 'warning', message: '3 Invoices are overdue by more than 30 days.' }
        ]
      },
      insights: {
        revenueTrend: [
          { name: 'Mon', revenue: 12000 },
          { name: 'Tue', revenue: 15000 },
          { name: 'Wed', revenue: 11000 },
          { name: 'Thu', revenue: 22000 },
          { name: 'Fri', revenue: 24500 },
          { name: 'Sat', revenue: 8000 },
          { name: 'Sun', revenue: 5000 },
        ],
        topProducts: [
          { name: 'Website Design', sales: 45000 },
          { name: 'Consulting', sales: 25000 },
          { name: 'Hosting (Annual)', sales: 15000 }
        ]
      },
      recentActivity: {
        recentBills: [
          { id: 'INV-2024-001', customer: 'Acme Corp', amount: 15000, status: 'Paid', date: 'Today, 10:30 AM' },
          { id: 'INV-2024-002', customer: 'Stark Ind.', amount: 45000, status: 'Pending', date: 'Today, 09:15 AM' },
          { id: 'INV-2024-003', customer: 'Wayne Ent.', amount: 25000, status: 'Overdue', date: 'Yesterday' },
          { id: 'INV-2024-004', customer: 'Oscorp', amount: 8000, status: 'Draft', date: 'Yesterday' },
        ],
        recentProducts: [
          { id: 'P-01', name: 'SEO Audit', price: 5000, stock: 'Unlimited' },
          { id: 'P-02', name: 'Maintenance', price: 2000, stock: 'Unlimited' },
        ]
      },
      account: {
        storageUsed: '45MB',
        storageLimit: '500MB',
        unreadNotifications: 3
      }
};

export const dashboardService = {
  getDashboardData: async () => {
    await delay();
    return mockDashboardData;
  }
};
