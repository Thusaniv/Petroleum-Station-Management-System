import React, { useState, useEffect, useCallback, memo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, Warehouse, Droplet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Memoized Form Component
const TankForm = memo(function TankForm({
    formData,
    setFormData,
    onSubmit,
    submitLabel,
    onCancel,
    products
}) {
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'capacity' || name === 'current_level' || name === 'alert_level')
                ? parseFloat(value) || 0
                : value
        }));
    }, [setFormData]);

    const handleSelectChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [setFormData]);

    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Tank Name *</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Underground Tank 1"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="product_id">Fuel Type *</Label>
                <Select
                    value={String(formData.product_id)}
                    onValueChange={(val) => handleSelectChange('product_id', val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map(product => (
                            <SelectItem key={product.id} value={String(product.id)}>
                                {product.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="capacity">Total Capacity (L) *</Label>
                    <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="alert_level">Low Stock Alert (L)</Label>
                    <Input
                        id="alert_level"
                        name="alert_level"
                        type="number"
                        value={formData.alert_level}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="current_level">Current Level (L) *</Label>
                <Input
                    id="current_level"
                    name="current_level"
                    type="number"
                    value={formData.current_level}
                    onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Usually updated via dips or auto-deducted.</p>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" onClick={onSubmit} className="btn-petro">
                    {submitLabel}
                </Button>
            </DialogFooter>
        </div>
    );
});

export default function TanksPage() {
    const [tanks, setTanks] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTank, setSelectedTank] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        product_id: '',
        capacity: 0,
        current_level: 0,
        alert_level: 1000,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tanksRes, productsRes] = await Promise.all([
                api.get('/tanks'),
                api.get('/products')
            ]);
            setTanks(tanksRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTank = async () => {
        if (!formData.name || !formData.product_id) {
            toast.error('Name and Product are required');
            return;
        }
        try {
            await api.post('/tanks', formData);
            toast.success('Tank added successfully');
            setIsAddDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add tank');
        }
    };

    const handleUpdateTank = async () => {
        if (!selectedTank) return;
        try {
            await api.put(`/tanks/${selectedTank.id}`, formData);
            toast.success('Tank updated successfully');
            setIsEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update tank');
        }
    };

    const handleDeleteTank = async (id) => {
        if (confirm('Are you sure you want to delete this tank?')) {
            try {
                await api.delete(`/tanks/${id}`);
                toast.success('Tank deleted');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete tank');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            product_id: '',
            capacity: 0,
            current_level: 0,
            alert_level: 1000,
        });
        setSelectedTank(null);
    };

    const openEditDialog = (tank) => {
        setSelectedTank(tank);
        setFormData({
            name: tank.name,
            product_id: String(tank.product_id),
            capacity: tank.capacity,
            current_level: tank.current_level,
            alert_level: tank.alert_level || 1000,
        });
        setIsEditDialogOpen(true);
    };

    const getProductColor = (productId) => {
        const p = products.find(p => p.id === productId);
        return p?.color_code || '#64748b'; // default slate-500
    };

    return (
        <DashboardLayout>
            <PageHeader title="Fuel Inventory" description="Manage underground tanks and stock levels">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-petro gap-2">
                            <Plus className="w-4 h-4" /> Add Tank
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Tank</DialogTitle>
                            <DialogDescription>Register a new fuel storage tank.</DialogDescription>
                        </DialogHeader>
                        <TankForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleAddTank}
                            submitLabel="Add Tank"
                            onCancel={() => { setIsAddDialogOpen(false); resetForm(); }}
                            products={products}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {tanks.map(tank => {
                    const percentage = Math.min((tank.current_level / tank.capacity) * 100, 100);
                    const isLow = tank.current_level <= (tank.alert_level || 1000);

                    return (
                        <Card key={tank.id} className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Warehouse className="w-5 h-5 opacity-70" />
                                        {tank.name}
                                    </CardTitle>
                                    {isLow && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Low Stock
                                        </span>
                                    )}
                                </div>
                                <CardDescription>{tank.product_name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Current Level</span>
                                        <span className="font-bold">{Number(tank.current_level).toLocaleString()} L</span>
                                    </div>

                                    {/* Custom Progress Bar */}
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative border">
                                        <div
                                            className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>0 L</span>
                                        <span>{Number(tank.capacity).toLocaleString()} L</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(tank)}>
                                        <Edit className="w-4 h-4 mr-1" /> Updates
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-red-50" onClick={() => handleDeleteTank(tank.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {tanks.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        No tanks found. Add one to see inventory.
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Tank</DialogTitle>
                    </DialogHeader>
                    <TankForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleUpdateTank}
                        submitLabel="Save Changes"
                        onCancel={() => setIsEditDialogOpen(false)}
                        products={products}
                    />
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
