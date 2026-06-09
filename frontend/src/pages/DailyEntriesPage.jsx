import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/common/PageHeader";
import api from "../api/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Plus, Trash2, Fuel } from "lucide-react";
import { toast } from "sonner";

export default function DailyEntriesPage() {
    const [readings, setReadings] = useState([]);
    const [pumps, setPumps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        pumpId: "",
        readingDate: new Date().toISOString().split('T')[0],
        openingReading: 0,
        closingReading: 0,
        testingQty: 0,
    });

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [readingsRes, pumpsRes] = await Promise.all([
                api.get("/pump-readings"),
                api.get("/pumps"),
            ]);
            setReadings(readingsRes.data || []);
            setPumps(pumpsRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Handle Input Changes
    const handlePumpSelect = (pumpId) => {
        const pump = pumps.find((p) => p.id === parseInt(pumpId));
        setFormData({
            ...formData,
            pumpId,
            openingReading: pump ? pump.lastClosingReading : 0, // Auto-fill opening
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (!formData.pumpId) return toast.error("Select a pump");
            await api.post("/pump-readings", formData);
            toast.success("Entry saved successfully");
            setIsDialogOpen(false);
            fetchData(); // Refresh
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to save entry");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/pump-readings/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Daily Shift Entries"
                description="Record pump readings and daily sales"
            >
                <Button onClick={() => setIsDialogOpen(true)} className="btn-petro gap-2">
                    <Plus className="h-4 w-4" />
                    New Entry
                </Button>
            </PageHeader>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Entries</CardTitle>
                        <CardDescription>
                            {readings.length} entries recorded
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Pump</TableHead>
                                    <TableHead className="text-right">Opening</TableHead>
                                    <TableHead className="text-right">Closing</TableHead>
                                    <TableHead className="text-right">Sales Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {readings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">No entries found</TableCell>
                                    </TableRow>
                                ) : (
                                    readings.map((reading) => (
                                        <TableRow key={reading.id}>
                                            <TableCell>{reading.readingDate}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Fuel className="h-4 w-4 text-muted-foreground" />
                                                    {reading.pumpName}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{reading.openingReading}</TableCell>
                                            <TableCell className="text-right">{reading.closingReading}</TableCell>
                                            <TableCell className="text-right font-bold text-yellow-600">
                                                {reading.salesQty} L
                                            </TableCell>
                                            <TableCell className="text-right">{reading.unitPrice}</TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {Number(reading.totalAmount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(reading.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Daily Pump Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Pump</label>
                            <Select onValueChange={handlePumpSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Pump" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pumps.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.pump_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    name="readingDate"
                                    value={formData.readingDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Testing Qty (L)</label>
                                <Input
                                    type="number"
                                    name="testingQty"
                                    value={formData.testingQty}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Opening Reading</label>
                                <Input
                                    type="number"
                                    name="openingReading"
                                    value={formData.openingReading}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Closing Reading</label>
                                <Input
                                    type="number"
                                    name="closingReading"
                                    value={formData.closingReading}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between font-semibold">
                                <span>Calculated Sales:</span>
                                <span>
                                    {Math.max(
                                        0,
                                        formData.closingReading -
                                        formData.openingReading -
                                        formData.testingQty
                                    )}{" "}
                                    L
                                </span>
                            </div>
                        </div>

                        <Button onClick={handleSubmit} className="w-full btn-petro">
                            Save Entry
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
