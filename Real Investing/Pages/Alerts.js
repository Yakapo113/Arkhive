import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, MapPin, TrendingUp, DollarSign, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Alerts() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    locations: [],
    min_cap_rate: 0,
    min_roi: 0,
    min_cash_flow: 0,
    max_price: 0,
    property_types: [],
    is_active: true
  });
  const [locationInput, setLocationInput] = useState('');

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.AlertPreference.list('-created_date'),
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.AlertPreference.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowCreateDialog(false);
      setNewAlert({
        name: '',
        locations: [],
        min_cap_rate: 0,
        min_roi: 0,
        min_cash_flow: 0,
        max_price: 0,
        property_types: [],
        is_active: true
      });
      toast.success('Alert created successfully');
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AlertPreference.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert updated');
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.AlertPreference.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert deleted');
    },
  });

  const addLocation = () => {
    if (locationInput.trim()) {
      setNewAlert({
        ...newAlert,
        locations: [...newAlert.locations, locationInput.trim()]
      });
      setLocationInput('');
    }
  };

  const removeLocation = (index) => {
    setNewAlert({
      ...newAlert,
      locations: newAlert.locations.filter((_, i) => i !== index)
    });
  };

  const toggleAlertActive = (alert) => {
    updateAlertMutation.mutate({
      id: alert.id,
      data: { is_active: !alert.is_active }
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "Any";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Deal Alerts</h1>
                <p className="text-slate-500">Get notified when properties match your criteria</p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Alert Name</Label>
                    <Input
                      placeholder="e.g., Austin Multi-Family Deals"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Locations (Cities, States, or Regions)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Austin, TX or Texas"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                      />
                      <Button type="button" onClick={addLocation}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newAlert.locations.map((loc, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          {loc}
                          <button
                            onClick={() => removeLocation(idx)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Cap Rate (%)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newAlert.min_cap_rate || ''}
                        onChange={(e) => setNewAlert({ ...newAlert, min_cap_rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min ROI (%)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newAlert.min_roi || ''}
                        onChange={(e) => setNewAlert({ ...newAlert, min_roi: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Cash Flow ($/month)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newAlert.min_cash_flow || ''}
                        onChange={(e) => setNewAlert({ ...newAlert, min_cash_flow: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Price ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newAlert.max_price || ''}
                        onChange={(e) => setNewAlert({ ...newAlert, max_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => createAlertMutation.mutate(newAlert)}
                    disabled={!newAlert.name || newAlert.locations.length === 0}
                  >
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No alerts set up</h3>
              <p className="text-slate-500 mb-4">
                Create your first alert to get notified about great investment deals
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${alert.is_active ? 'bg-blue-100' : 'bg-slate-100'}`}>
                            <Bell className={`w-5 h-5 ${alert.is_active ? 'text-blue-600' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 text-lg">{alert.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Switch
                                checked={alert.is_active}
                                onCheckedChange={() => toggleAlertActive(alert)}
                              />
                              <span className="text-sm text-slate-500">
                                {alert.is_active ? 'Active' : 'Paused'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => deleteAlertMutation.mutate(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-2">Monitoring Locations</p>
                          <div className="flex flex-wrap gap-2">
                            {alert.locations?.map((loc, idx) => (
                              <Badge key={idx} variant="outline" className="gap-1">
                                <MapPin className="w-3 h-3" />
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-2">Alert Criteria</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {alert.min_cap_rate > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-amber-600" />
                                <span>Cap ≥ {alert.min_cap_rate}%</span>
                              </div>
                            )}
                            {alert.min_roi > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span>ROI ≥ {alert.min_roi}%</span>
                              </div>
                            )}
                            {alert.min_cash_flow > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span>CF ≥ ${alert.min_cash_flow}/mo</span>
                              </div>
                            )}
                            {alert.max_price > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <span>Price ≤ {formatCurrency(alert.max_price)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {alert.last_checked && (
                          <p className="text-xs text-slate-400">
                            Last checked: {new Date(alert.last_checked).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}