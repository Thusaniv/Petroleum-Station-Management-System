import React, { useState, useEffect, memo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { TrendingUp, Calendar, DollarSign, History } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceForm = memo(function PriceForm({
    formData,
    setFormData,
    onSubmit,
    onCancel,
    products
}) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="product">Fuel Type</Label>
                <Select
                    value={formData.product_id}
                    onValueChange={(val) => setFormData({ ...formData, product_id: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Fuel" />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    type="date"
                    value={formData.price_date}
                    onChange={(e) => setFormData({ ...formData, price_date: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Usually today, but can set future/past.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="price">Price per Liter (Rs.)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onSubmit} className="btn-petro">Set Price</Button>
            </DialogFooter>
        </div>
    );
});

export default function FuelPricesPage() {
    const [prices, setPrices] = useState([]); // Current/Latest prices for all products
    const [history, setHistory] = useState([]); // History for selected product
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        product_id: '',
        price_date: new Date().toISOString().split('T')[0],
        price: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [prodRes] = await Promise.all([
                api.get('/products'),
                // api.get('/daily-prices/today') // Assuming we might make an endpoint for "Current Prices" summary
            ]);
            setProducts(prodRes.data || []);

            // Fetch history for first product if available
            if (prodRes.data.length > 0) {
                handleProductSelect(prodRes.data[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load data');
        }
    };

    const handleProductSelect = async (product) => {
        setSelectedProduct(product);
        try {
            const res = await api.get(`/daily-prices/history/${product.id}`);
            // Sort desc by date
            const sorted = (res.data || []).sort((a, b) => new Date(b.price_date) - new Date(a.price_date));
            setHistory(sorted);

            // Update form default
            setFormData(prev => ({ ...prev, product_id: String(product.id) }));
        } catch (error) {
            toast.error('Failed to fetch history');
        }
    };

    const handleSubmit = async () => {
        if (!formData.product_id || !formData.price) {
            toast.error('All fields required');
            return;
        }

        try {
            await api.post('/daily-prices', formData);
            toast.success('Price updated successfully');
            setIsDialogOpen(false);
            // Refresh history
            if (selectedProduct) handleProductSelect(selectedProduct);
        } catch (error) {
            console.error(error);
            toast.error('Failed to set price');
        }
    };

    // Prepare chart data (reverse for chronological order)
    const chartData = [...history].reverse().map(h => ({
        date: new Date(h.price_date).toLocaleDateString(),
        price: Number(h.price)
    }));

    const currentPrice = history.length > 0 ? history[0].price : 0;

    return (
        <DashboardLayout>
            <PageHeader title="Fuel Prices" description="Manage daily fuel rates">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-petro gap-2">
                            <TrendingUp className="w-4 h-4" /> Update Price
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set Fuel Price</DialogTitle>
                            <DialogDescription>Add a new price entry for a specific date.</DialogDescription>
                        </DialogHeader>
                        <PriceForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                            products={products}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Selector / List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Fuel Types</CardTitle>
                        <CardDescription>Select to view history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleProductSelect(p)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex justify-between items-center ${selectedProduct?.id === p.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                >
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-xs px-2 py-1 bg-muted rounded">{p.code}</span>
                                </div>
                            ))}
                            {products.length === 0 && <p className="text-muted-foreground text-center">No products found.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* History & Chart */}
                <div className="md:col-span-2 space-y-6">
                    {selectedProduct && (
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>{selectedProduct.name} - Price Trend</CardTitle>
                                            <CardDescription>Current: Rs. {currentPrice}</CardDescription>
                                        </div>
                                        <div className="text-2xl font-bold text-primary">
                                            Rs. {Number(currentPrice).toFixed(2)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="w-5 h-5" /> Recent Updates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Price (Rs.)</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.slice(0, 10).map((h) => (
                                                <TableRow key={h.id}>
                                                    <TableCell>{new Date(h.price_date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-bold">Rs. {Number(h.price).toFixed(2)}</TableCell>
                                                    <TableCell className="text-right text-muted-foreground text-xs">
                                                        {new Date(h.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {!selectedProduct && (
                        <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-10 text-muted-foreground">
                            Select a product to view prices
                        </div>
                    )}
                </div>
            </div>

        </DashboardLayout>
    );
}
