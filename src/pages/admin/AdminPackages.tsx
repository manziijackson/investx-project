
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InvestmentPackage {
  id: string;
  name: string;
  amount: number;
  returnAmount: number;
  duration: number;
  maxUses: number;
  isActive: boolean;
}

const AdminPackages = () => {
  const [packages, setPackages] = useState<InvestmentPackage[]>(() => {
    const saved = localStorage.getItem('investx_packages');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Starter Package',
        amount: 5000,
        returnAmount: 7500,
        duration: 7,
        maxUses: 1,
        isActive: true
      },
      {
        id: '2',
        name: 'Growth Package',
        amount: 10000,
        returnAmount: 16000,
        duration: 14,
        maxUses: 3,
        isActive: true
      }
    ];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<InvestmentPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    returnAmount: '',
    duration: '',
    maxUses: ''
  });

  const savePackages = (newPackages: InvestmentPackage[]) => {
    setPackages(newPackages);
    localStorage.setItem('investx_packages', JSON.stringify(newPackages));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData: InvestmentPackage = {
      id: editingPackage ? editingPackage.id : Date.now().toString(),
      name: formData.name,
      amount: Number(formData.amount),
      returnAmount: Number(formData.returnAmount),
      duration: Number(formData.duration),
      maxUses: Number(formData.maxUses),
      isActive: true
    };

    if (editingPackage) {
      const updatedPackages = packages.map(pkg => 
        pkg.id === editingPackage.id ? packageData : pkg
      );
      savePackages(updatedPackages);
      toast({
        title: "Package Updated",
        description: "Investment package has been updated successfully.",
      });
    } else {
      savePackages([...packages, packageData]);
      toast({
        title: "Package Created",
        description: "New investment package has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    setEditingPackage(null);
    setFormData({ name: '', amount: '', returnAmount: '', duration: '', maxUses: '' });
  };

  const handleEdit = (pkg: InvestmentPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      amount: pkg.amount.toString(),
      returnAmount: pkg.returnAmount.toString(),
      duration: pkg.duration.toString(),
      maxUses: pkg.maxUses.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== id);
    savePackages(updatedPackages);
    toast({
      title: "Package Deleted",
      description: "Investment package has been deleted successfully.",
    });
  };

  const toggleStatus = (id: string) => {
    const updatedPackages = packages.map(pkg => 
      pkg.id === id ? { ...pkg, isActive: !pkg.isActive } : pkg
    );
    savePackages(updatedPackages);
    toast({
      title: "Package Status Updated",
      description: "Package status has been updated successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Investment Packages</h2>
            <p className="text-gray-600">Manage investment packages and returns</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPackage ? 'Edit Package' : 'Create New Package'}
                </DialogTitle>
                <DialogDescription>
                  {editingPackage ? 'Update the package details below.' : 'Fill in the details for the new investment package.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Investment Amount (RWF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnAmount">Return Amount (RWF)</Label>
                  <Input
                    id="returnAmount"
                    type="number"
                    value={formData.returnAmount}
                    onChange={(e) => setFormData({...formData, returnAmount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Maximum Uses per User</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={pkg.isActive ? 'border-green-200' : 'border-gray-200'}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-red-600" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Investment:</span>
                    <span className="font-medium">{pkg.amount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Return:</span>
                    <span className="font-medium text-green-600">{pkg.returnAmount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">{pkg.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max Uses:</span>
                    <span className="font-medium">{pkg.maxUses}</span>
                  </div>
                  <div className="pt-2">
                    <Button 
                      variant={pkg.isActive ? "destructive" : "default"}
                      size="sm" 
                      className="w-full"
                      onClick={() => toggleStatus(pkg.id)}
                    >
                      {pkg.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPackages;
