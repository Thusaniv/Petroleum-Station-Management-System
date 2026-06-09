import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/common/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import api from "../api/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Fuel,
  TrendingUp,
  AlertTriangle,
  Droplet,
  DollarSign
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayLiters: 0,
    activePumps: 0,
    lowStockTanks: 0,
    monthlyRevenue: [],
    recentSales: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const revenueData = stats.monthlyRevenue || [];
  const recentSales = stats.recentSales || [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Station Dashboard"
        description="Overview of daily fuel operations"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Today's Revenue"
          value={`Rs. ${Number(stats.todayRevenue).toLocaleString()}`}
          subtitle="Total Sales"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Fuel Dispensed"
          value={`${Number(stats.todayLiters).toLocaleString()} L`}
          subtitle="Today's Volume"
          icon={Droplet}
          variant="primary"
        />
        <StatCard
          title="Active Pumps"
          value={stats.activePumps || 0}
          subtitle="Operational Units"
          icon={Fuel}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockTanks || 0}
          subtitle="Tanks below limit"
          icon={AlertTriangle}
          variant={stats.lowStockTanks > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Revenue Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.8} stopColor="#eab308" />
                    <stop offset="95%" stopOpacity={0} stopColor="#eab308" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#eab308" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Sales List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Recent Shift Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-3 mb-2 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">{sale.pump_name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(sale.reading_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">Rs. {Number(sale.total_amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{sale.sales_qty} L</p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && <p className="text-center text-muted-foreground py-8">No recent activity</p>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
