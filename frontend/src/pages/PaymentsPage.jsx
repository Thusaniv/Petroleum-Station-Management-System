import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Search, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payRes, custRes] = await Promise.all([
        api.get('/payments'),
        api.get('/customers')
      ]);
      setPayments(payRes.data || []);
      setCustomers(custRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.customerId || !formData.amount) {
      toast.error('Customer and Amount are required');
      return;
    }

    try {
      await api.post('/payments', {
        ...formData,
        receivedBy: user?.id
      });
      toast.success('Payment recorded successfully');
      setIsAddDialogOpen(false);
      setFormData({
        customerId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: 'cash',
        reference: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to record payment');
    }
  };

  const filteredPayments = payments.filter(p =>
    p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader title="Customer Payments" description="Record payments received from credit customers">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-petro gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Payment</DialogTitle>
              <DialogDescription>Record a payment from a customer.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={val => setFormData({ ...formData, customerId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} (Bal: {Number(c.outstanding_balance).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Amount (Rs) *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={val => setFormData({ ...formData, paymentMethod: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Reference (Cheque No/Ref ID)</Label>
                <Input
                  value={formData.reference}
                  onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="btn-petro">Save Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map(pay => (
                <TableRow key={pay.id}>
                  <TableCell>{new Date(pay.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{pay.customerName}</TableCell>
                  <TableCell className="capitalize flex items-center gap-2">
                    {pay.paymentMethod === 'cash' && <Banknote className="h-4 w-4 text-green-600" />}
                    {pay.paymentMethod === 'bank_transfer' && <CreditCard className="h-4 w-4 text-yellow-600" />}
                    {pay.paymentMethod?.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{pay.reference || '-'}</TableCell>
                  <TableCell className="text-right font-bold">
                    Rs. {Number(pay.amount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No payments found
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
