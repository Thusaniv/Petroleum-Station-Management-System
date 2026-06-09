import React, { useState, useEffect, memo } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/common/PageHeader";
import api from "../api/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { StatusBadge } from "../components/common/StatusBadge";
import { Plus, Search, Edit, Trash2, Phone, Car, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

// Memoized Form
const CustomerForm = memo(function CustomerForm({ formData, setFormData, onSubmit, onCancel, submitLabel }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Customer Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Company or Person Name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="077xxxxxxx"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vehicleNumber">Vehicle Number</Label>
          <Input
            id="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
            placeholder="WP AB-1234"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Billing Address"
        />
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    vehicleNumber: "",
    status: "active",
  });

  // Fetch data
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      vehicleNumber: "",
      status: "active",
    });
    setSelectedCustomer(null);
  };

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    try {
      await api.post('/customers', formData);
      toast.success("Customer added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to add customer");
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      await api.put(`/customers/${selectedCustomer.id}`, formData);
      toast.success("Customer updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success("Customer deleted");
        fetchCustomers();
      } catch (error) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const openEditDialog = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address || "",
      phone: customer.phone || "",
      vehicleNumber: customer.vehicleNumber || "",
      status: customer.status,
    });
    setIsEditDialogOpen(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    const name = customer.name?.toLowerCase() || "";
    const phone = customer.phone?.toLowerCase() || "";
    const vehicle = customer.vehicleNumber?.toLowerCase() || "";

    const matchesSearch = name.includes(term) || phone.includes(term) || vehicle.includes(term);
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader title="Credit Customers" description="Manage customers eligible for credit sales">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 btn-petro">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddCustomer}
              onCancel={() => { setIsAddDialogOpen(false); resetForm(); }}
              submitLabel="Add Customer"
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, vehicle or phone..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>{filteredCustomers.length} registered customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle No</TableHead>
                <TableHead className="text-right">Outstanding Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {customer.address}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {customer.phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.vehicleNumber ? (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Car className="w-3 h-3 text-muted-foreground" />
                        {customer.vehicleNumber}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`font-bold ${customer.outstandingBalance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      Rs. {Number(customer.outstandingBalance).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={customer.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCustomer(customer.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateCustomer}
            onCancel={() => { setIsEditDialogOpen(false); resetForm(); }}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
