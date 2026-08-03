const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const insightsService = {
  getOverview: async (period = 'month') => {
    await delay(400);
    return {
      totalRevenue: 285400,
      revenueGrowth: 18.2,
      billsGenerated: 142,
      billsGrowth: 5.4,
      avgBillValue: 2010,
      avgBillGrowth: -2.1,
      outstanding: 45000,
      outstandingGrowth: 12.5,
      // Trend data for the mini charts
      revenueTrend: [
        { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 }, { name: 'Wed', value: 2000 },
        { name: 'Thu', value: 2780 }, { name: 'Fri', value: 1890 }, { name: 'Sat', value: 2390 }, { name: 'Sun', value: 3490 }
      ]
    };
  },

  getRevenueAnalytics: async () => {
    await delay(400);
    return {
      total: 1245000,
      growth: 15.4,
      monthlyTrend: [
        { name: 'Jan', revenue: 40000, profit: 24000 },
        { name: 'Feb', revenue: 30000, profit: 13980 },
        { name: 'Mar', revenue: 20000, profit: 9800 },
        { name: 'Apr', revenue: 27800, profit: 19080 },
        { name: 'May', revenue: 18900, profit: 4800 },
        { name: 'Jun', revenue: 23900, profit: 18000 },
        { name: 'Jul', revenue: 34900, profit: 23000 },
        { name: 'Aug', revenue: 45000, profit: 31000 },
        { name: 'Sep', revenue: 52000, profit: 38000 },
        { name: 'Oct', revenue: 48000, profit: 34000 },
        { name: 'Nov', revenue: 61000, profit: 45000 },
        { name: 'Dec', revenue: 75000, profit: 58000 },
      ]
    };
  },

  getBillAnalytics: async () => {
    await delay(400);
    return {
      totalBills: 1250,
      averageValue: 3450,
      largestBill: 45000,
      smallestBill: 120,
      avgItems: 4.2,
      volumeTrend: [
        { name: 'Week 1', bills: 45 },
        { name: 'Week 2', bills: 52 },
        { name: 'Week 3', bills: 38 },
        { name: 'Week 4', bills: 65 }
      ]
    };
  },

  getGSTAnalytics: async () => {
    await delay(400);
    return {
      totalTax: 124500,
      breakdown: [
        { name: 'CGST', value: 45000 },
        { name: 'SGST', value: 45000 },
        { name: 'IGST', value: 34500 }
      ],
      monthlyTax: [
        { name: 'Jan', tax: 4000 },
        { name: 'Feb', tax: 3000 },
        { name: 'Mar', tax: 2000 },
        { name: 'Apr', tax: 2780 },
        { name: 'May', tax: 1890 },
        { name: 'Jun', tax: 2390 }
      ]
    };
  },

  getPaymentAnalytics: async () => {
    await delay(400);
    return {
      totalCollected: 1100000,
      outstanding: 145000,
      collectionRate: 88, // 88%
      statusBreakdown: [
        { name: 'Paid', value: 850 },
        { name: 'Pending', value: 120 },
        { name: 'Partial', value: 30 }
      ]
    };
  }
};
