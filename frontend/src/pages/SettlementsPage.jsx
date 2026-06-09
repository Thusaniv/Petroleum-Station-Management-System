import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Receipt, Save, Calculator, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettlementsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [shift, setShift] = useState(1);
    const [customers, setCustomers] = useState([]);

    const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
    const [creditRecords, setCreditRecords] = useState([]); // { customerId, amount, notes }
    const [newCredit, setNewCredit] = useState({ customerId: '', amount: '' });

    const [settlementData, setSettlementData] = useState({
        totalSalesAmount: 0, // System Calculated
        cashCollected: 0,
        cardSales: 0,
        creditSales: 0, // Should match sum of creditRecords
        expenses: 0,
        shortageExcess: 0,
        notes: '',
        status: 'pending'
    });

    useEffect(() => {
        fetchSettlement();
        fetchCustomers();
    }, [date, shift]);

    // Sync credit sales total
    useEffect(() => {
        const total = creditRecords.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        setSettlementData(prev => {
            if (prev.creditSales === total) return prev;
            return { ...prev, creditSales: total };
        });
    }, [creditRecords]);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data || []);
        } catch (e) {
            console.error("Failed to load customers");
        }
    };

    const handleAddCredit = () => {
        if (!newCredit.customerId || !newCredit.amount) return;
        setCreditRecords([...creditRecords, newCredit]);
        setNewCredit({ customerId: '', amount: '' });
    };

    const fetchSettlement = async () => {
        setLoading(true);
        try {
            // 1. Get existing settlement if any
            const res = await api.get(`/settlements?date=${date}&shift=${shift}`);

            // 2. Ideally we also want the LIVE system sales calc to show "Expected" even if not saved.
            // The backend 'createOrUpdate' logic calculates it. 
            // We can trigger a dry-run or specific endpoint for stats if needed.
            // For now, if no settlement exists, we might show 0 or need a separate endpoint to get 'projected' sales.
            // Let's assume the backend 'get' returns partial data or we add a specific query.

            // Workaround: We'll rely on what's saved. If nothing saved, we might assume 0 until they hit 'Calculate' or we could auto-fetch DailySales for that date/shift here.

            if (res.data) {
                setSettlementData(res.data);
                // Also populate itemized list if returned
                if (res.data.creditRecords) {
                    setCreditRecords(res.data.creditRecords);
                } else {
                    setCreditRecords([]);
                }
            } else {
                // Reset if no record
                setSettlementData({
                    totalSalesAmount: 0,
                    cashCollected: 0,
                    cardSales: 0,
                    creditSales: 0,
                    expenses: 0,
                    shortageExcess: 0,
                    notes: '',
                    status: 'pending'
                });
                setCreditRecords([]);
            }

        } catch (error) {
            console.error('Error fetching settlement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettlementData(prev => {
            const newData = { ...prev, [name]: name === 'notes' ? value : parseFloat(value) || 0 };
            // Recalculate Shortage/Excess live
            const totalCollected = (parseFloat(newData.cashCollected) || 0) + (parseFloat(newData.cardSales) || 0) + (parseFloat(newData.creditSales) || 0) + (parseFloat(newData.expenses) || 0);
            newData.shortageExcess = totalCollected - (parseFloat(newData.totalSalesAmount) || 0);
            return newData;
        });
    };

    const calculateShortage = () => {
        const totalCollected = (parseFloat(settlementData.cashCollected) || 0) + (parseFloat(settlementData.cardSales) || 0) + (parseFloat(settlementData.creditSales) || 0) + (parseFloat(settlementData.expenses) || 0);
        return totalCollected - (parseFloat(settlementData.totalSalesAmount) || 0);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                date,
                shiftNumber: shift,
                ...settlementData,
                creditRecords: creditRecords, // Send list to backend
                finalizedBy: user?.id
            };

            const res = await api.post('/settlements', payload);
            setSettlementData(res.data); // Update with server data (which includes correct Total Sales calc)
            toast.success('Shift settlement saved successfully', {
                description: `Shortage/Excess: ${res.data.shortageExcess}`
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settlement');
        } finally {
            setLoading(false);
        }
    };

    const shortage = calculateShortage();
    const isBalanced = Math.abs(shortage) < 1;

    return (
        <DashboardLayout>
            <PageHeader title="Shift Settlements" description="Reconcile daily sales, cash, and credit." />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Controls */}
                <Card className="md:col-span-2">
                    <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-2 flex-1">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2 w-32">
                            <Label>Shift</Label>
                            <Input type="number" min={1} value={shift} onChange={e => setShift(parseInt(e.target.value))} />
                        </div>
                        <Button onClick={fetchSettlement} variant="outline" className="mb-0.5">
                            Refresh
                        </Button>
                    </CardContent>
                </Card>

                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cash & Collections</CardTitle>
                        <CardDescription>Enter amounts collected during the shift</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Cash Collected (Rs)</Label>
                            <Input
                                name="cashCollected"
                                type="number"
                                value={settlementData.cashCollected}
                                onChange={handleInputChange}
                                className="text-lg font-bold text-green-700"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Card Sales (Rs)</Label>
                            <Input
                                name="cardSales"
                                type="number"
                                value={settlementData.cardSales}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Credit Sales (Rs)</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="creditSales"
                                    type="number"
                                    value={settlementData.creditSales}
                                    readOnly
                                    className="bg-muted"
                                />
                                <Button variant="outline" onClick={() => setIsCreditDialogOpen(true)} className="whitespace-nowrap">
                                    Review List
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">Auto-calculated from credit slips</p>
                        </div>

                        {/* Credit Dialog */}
                        <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Shift Credit Sales</DialogTitle>
                                    <DialogDescription>Record all credit transactions for this shift.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="grid gap-1 flex-1">
                                            <Label>Customer</Label>
                                            <Select value={newCredit.customerId} onValueChange={v => setNewCredit({ ...newCredit, customerId: v })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map(c => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-1 w-32">
                                            <Label>Amount</Label>
                                            <Input
                                                type="number"
                                                value={newCredit.amount}
                                                onChange={e => setNewCredit({ ...newCredit, amount: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleAddCredit}><Plus className="h-4 w-4" /></Button>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Customer</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {creditRecords.map((rec, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{customers.find(c => String(c.id) === String(rec.customerId))?.name || rec.customerId}</TableCell>
                                                    <TableCell className="text-right">{Number(rec.amount).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" variant="ghost" onClick={() => {
                                                            const newRecs = creditRecords.filter((_, i) => i !== idx);
                                                            setCreditRecords(newRecs);
                                                        }}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {creditRecords.length === 0 && (
                                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No records added</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => setIsCreditDialogOpen(false)}>Done</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className="grid gap-2">
                            <Label>Expenses (Petty Cash)</Label>
                            <Input
                                name="expenses"
                                type="number"
                                value={settlementData.expenses}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Textarea
                                name="notes"
                                value={settlementData.notes}
                                onChange={handleInputChange}
                                placeholder="Any discrepancies or remarks..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>Reconciliation</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 grid gap-6">

                        <div className="p-4 rounded-lg bg-background border shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">Total System Sales</p>
                            <p className="text-3xl font-bold">Rs. {Number(settlementData.totalSalesAmount).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">Calculated from Pump Readings</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                <p className="text-xs uppercase tracking-wider font-semibold">Total Collected</p>
                                <p className="text-lg font-bold">
                                    Rs. {((parseFloat(settlementData.cashCollected) || 0) + (parseFloat(settlementData.cardSales) || 0) + (parseFloat(settlementData.creditSales) || 0) + (parseFloat(settlementData.expenses) || 0)).toLocaleString()}
                                </p>
                            </div>
                            <div className={`p-3 rounded ${isBalanced ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                <p className="text-xs uppercase tracking-wider font-semibold">
                                    {shortage >= 0 ? "Excess" : "Shortage"}
                                </p>
                                <p className="text-lg font-bold">
                                    Rs. {Math.abs(shortage).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {settlementData.totalSalesAmount === 0 && (
                            <div className="flex items-center gap-2 p-3 text-sm text-yellow-600 bg-yellow-50 rounded-md border border-yellow-200">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Save to calculate System Sales based on entries.</span>
                            </div>
                        )}

                        <div className="mt-auto pt-6">
                            <Button className="w-full btn-petro gap-2" size="lg" onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save & Finalize Settlement
                                    </>
                                )}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
