import { useState, useEffect, useCallback, memo } from 'react';
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
import { StatusBadge } from '../components/common/StatusBadge';
import { Plus, Search, Edit, Trash2, Fuel, Warehouse, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Memoized Form Component
const PumpForm = memo(function PumpForm({
    formData,
    setFormData,
    onSubmit,
    submitLabel,
    onCancel,
    tanks // Pass tanks for selection instead of customers
}) {
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lastClosingReading' ? parseFloat(value) || 0 : value
        }));
    }, [setFormData]);

    const handleSelectChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [setFormData]);

    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="pump_name">Pump Name *</Label>
                <Input
                    id="pump_name"
                    name="pump_name"
                    value={formData.pump_name}
                    onChange={handleInputChange}
                    placeholder="Pump 1 - Nozzle A"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="tank_id">Connected Tank *</Label>
                <Select
                    value={String(formData.tank_id)}
                    onValueChange={(val) => handleSelectChange('tank_id', val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Tank" />
                    </SelectTrigger>
                    <SelectContent>
                        {tanks.map(tank => (
                            <SelectItem key={tank.id} value={String(tank.id)}>
                                {tank.name} ({tank.product_name})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="lastClosingReading">Initial/Last Reading</Label>
                    <Input
                        id="lastClosingReading"
                        name="lastClosingReading"
                        type="number"
                        value={formData.lastClosingReading}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(val) => handleSelectChange('status', val)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Island 1, Lane 2..."
                />
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

export default function PumpsPage() {
    const [pumps, setPumps] = useState([]);
    const [tanks, setTanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPump, setSelectedPump] = useState(null);

    const [formData, setFormData] = useState({
        pump_name: '',
        tank_id: '',
        lastClosingReading: 0,
        status: 'active',
        location: '',
    });

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pumpsRes, tanksRes] = await Promise.all([
                api.get('/pumps'),
                api.get('/tanks')
            ]);
            setPumps(pumpsRes.data || []);
            setTanks(tanksRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // CRUD Operations
    const handleAddPump = async () => {
        if (!formData.pump_name || !formData.tank_id) {
            toast.error('Name and Tank are required');
            return;
        }
        try {
            await api.post('/pumps', formData);
            toast.success('Pump added successfully');
            setIsAddDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add pump');
        }
    };

    const handleUpdatePump = async () => {
        if (!selectedPump) return;
        try {
            await api.put(`/pumps/${selectedPump.id}`, formData);
            toast.success('Pump updated successfully');
            setIsEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update pump');
        }
    };

    const handleDeletePump = async (id) => {
        if (window.confirm('Are you sure you want to delete this pump?')) {
            try {
                await api.delete(`/pumps/${id}`);
                toast.success('Pump deleted');
                fetchData();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete pump');
            }
        }
    };

    // Helpers
    const resetForm = () => {
        setFormData({
            pump_name: '',
            tank_id: '',
            lastClosingReading: 0,
            status: 'active',
            location: '',
        });
        setSelectedPump(null);
    };

    const openEditDialog = (pump) => {
        setSelectedPump(pump);
        setFormData({
            pump_name: pump.pump_name,
            tank_id: String(pump.tank_id),
            lastClosingReading: pump.lastClosingReading,
            status: pump.status,
            location: pump.location || '',
        });
        setIsEditDialogOpen(true);
    };

    const filteredPumps = pumps.filter(pump => {
        const matchesSearch = pump.pump_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || pump.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <PageHeader title="Pumps Management" description="Manage fuel dispensing units">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 btn-petro">
                            <Plus className="w-4 h-4" />
                            Add Pump
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Pump</DialogTitle>
                            <DialogDescription>Register a new fuel pump linked to a tank.</DialogDescription>
                        </DialogHeader>
                        <PumpForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleAddPump}
                            submitLabel="Add Pump"
                            onCancel={() => {
                                setIsAddDialogOpen(false);
                                resetForm();
                            }}
                            tanks={tanks}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Stats */}
            <div className="grid gap-4 mb-6 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                                <Fuel className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pumps.length}</p>
                                <p className="text-sm text-muted-foreground">Total Pumps</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search pumps..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <Card>
                <CardHeader>
                    <CardTitle>Pump List</CardTitle>
                    <CardDescription>{filteredPumps.length} pumps found</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pump Name</TableHead>
                                <TableHead>Connected Tank</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Last Reading</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPumps.map(pump => (
                                <TableRow key={pump.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Fuel className="w-4 h-4 text-yellow-500" />
                                            {pump.pump_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Warehouse className="w-4 h-4 text-gray-400" />
                                            {pump.tank_name || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-sm px-2 py-1 rounded bg-black/5">
                                            {pump.product_name || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{Number(pump.lastClosingReading).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                            <MapPin className="w-3 h-3" />
                                            {pump.location || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell><StatusBadge status={pump.status} /></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(pump)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeletePump(pump.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredPumps.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No pumps found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Pump</DialogTitle>
                    </DialogHeader>
                    <PumpForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleUpdatePump}
                        submitLabel="Save Changes"
                        onCancel={() => setIsEditDialogOpen(false)}
                        tanks={tanks}
                    />
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}
