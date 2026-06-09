import React, { useState, useEffect, memo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Droplet, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ProductForm = memo(function ProductForm({
    formData,
    setFormData,
    onSubmit,
    onCancel
}) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Fuel Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Petrol 92"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="LP92"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="color">Color Code (Hex)</Label>
                <div className="flex gap-2">
                    <Input
                        id="color"
                        type="color"
                        className="w-12 h-10 p-1"
                        value={formData.color_code}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                    />
                    <Input
                        value={formData.color_code}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                        placeholder="#FF0000"
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onSubmit} className="btn-petro">Save Product</Button>
            </DialogFooter>
        </div>
    );
});

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        color_code: '#000000'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data || []);
        } catch (error) {
            toast.error('Failed to load products');
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            code: product.code,
            color_code: product.color_code || '#000000'
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Name is required');
            return;
        }

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
                toast.success('Product updated');
            } else {
                await api.post('/products', formData);
                toast.success('Product added');
            }
            setIsDialogOpen(false);
            setEditingId(null);
            setFormData({ name: '', code: '', color_code: '#000000' });
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save product');
        }
    };

    return (
        <DashboardLayout>
            <PageHeader title="Fuel Types" description="Manage fuel products sold at the station">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingId(null);
                        setFormData({ name: '', code: '', color_code: '#000000' });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="btn-petro gap-2">
                            <Plus className="w-4 h-4" /> Add Fuel Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Product' : 'Add New Fuel Type'}</DialogTitle>
                            <DialogDescription>Define a new product for the system.</DialogDescription>
                        </DialogHeader>
                        <ProductForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Color</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: p.color_code }}></div>
                                    </TableCell>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell><span className="bg-muted px-2 py-1 rounded text-xs">{p.code}</span></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No products found. Add Petrol or Diesel.
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
