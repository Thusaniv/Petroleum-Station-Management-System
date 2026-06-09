import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import api from '../api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Loader2, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Sales Report
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'sales') fetchSales();
  }, [reportType, startDate, endDate]);


  return (
    <DashboardLayout>
      <PageHeader title="Reports" description="Analytics and Business Intelligence" />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Daily Sales Report</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span>to</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        <Button onClick={fetchSales} disabled={loading}>
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Generate Report'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Fuel Transaction Report</CardTitle>
          <CardDescription>From {startDate} to {endDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pump</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty (L)</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total (Rs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(row.reading_date).toLocaleDateString()}</TableCell>
                  <TableCell>{row.pump_name}</TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell className="text-right">{row.sales_qty}</TableCell>
                  <TableCell className="text-right">{row.unit_price}</TableCell>
                  <TableCell className="text-right font-bold">{Number(row.total_amount).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {data.length > 0 && (
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={3}>TOTAL</TableCell>
                  <TableCell className="text-right">
                    {data.reduce((acc, curr) => acc + Number(curr.sales_qty), 0).toLocaleString()} L
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    Rs. {data.reduce((acc, curr) => acc + Number(curr.total_amount), 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              )}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No records found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
