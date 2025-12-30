import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Save, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const propertyTypes = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "apartment", label: "Apartment" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed Use" },
];

export default function FilterPanel({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  onSaveSearch,
  onReset,
  isExpanded,
  onToggleExpand 
}) {
  const [localFilters, setLocalFilters] = useState(filters || {
    location: "",
    min_price: 0,
    max_price: 2000000,
    property_types: [],
    min_units: 1,
    max_units: 50,
    min_cap_rate: 0,
    min_roi: 0,
    min_cash_flow: 0
  });

  const updateFilter = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange?.(updated);
  };

  const togglePropertyType = (type) => {
    const current = localFilters.property_types || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter("property_types", updated);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const activeFiltersCount = [
    localFilters.location,
    localFilters.min_price > 0,
    localFilters.max_price < 2000000,
    localFilters.property_types?.length > 0,
    localFilters.min_units > 1,
    localFilters.max_units < 50,
    localFilters.min_cap_rate > 0,
    localFilters.min_roi > 0,
    localFilters.min_cash_flow > 0
  ].filter(Boolean).length;

  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Find Deals</CardTitle>
              <p className="text-sm text-slate-500">Filter investment properties</p>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-0">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="City, State or ZIP code"
              value={localFilters.location || ""}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700">Price Range</Label>
            <span className="text-sm text-slate-500">
              {formatCurrency(localFilters.min_price)} - {formatCurrency(localFilters.max_price)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.min_price || ""}
              onChange={(e) => updateFilter("min_price", parseInt(e.target.value) || 0)}
              className="border-slate-200"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.max_price || ""}
              onChange={(e) => updateFilter("max_price", parseInt(e.target.value) || 0)}
              className="border-slate-200"
            />
          </div>
        </div>

        {/* Property Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Property Type</Label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => togglePropertyType(type.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  localFilters.property_types?.includes(type.value)
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Units Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700">Number of Units</Label>
            <span className="text-sm text-slate-500">
              {localFilters.min_units} - {localFilters.max_units}+
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.min_units || ""}
              onChange={(e) => updateFilter("min_units", parseInt(e.target.value) || 1)}
              className="border-slate-200"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.max_units || ""}
              onChange={(e) => updateFilter("max_units", parseInt(e.target.value) || 50)}
              className="border-slate-200"
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Investment Metrics */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <Label className="text-sm font-medium text-slate-700">Investment Metrics</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Min Cap Rate</span>
                    <span className="text-sm font-medium">{localFilters.min_cap_rate}%</span>
                  </div>
                  <Slider
                    value={[localFilters.min_cap_rate || 0]}
                    onValueChange={([value]) => updateFilter("min_cap_rate", value)}
                    max={15}
                    step={0.5}
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Min ROI</span>
                    <span className="text-sm font-medium">{localFilters.min_roi}%</span>
                  </div>
                  <Slider
                    value={[localFilters.min_roi || 0]}
                    onValueChange={([value]) => updateFilter("min_roi", value)}
                    max={30}
                    step={1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Min Cash Flow</span>
                    <span className="text-sm font-medium">${localFilters.min_cash_flow}/mo</span>
                  </div>
                  <Slider
                    value={[localFilters.min_cash_flow || 0]}
                    onValueChange={([value]) => updateFilter("min_cash_flow", value)}
                    max={5000}
                    step={100}
                    className="py-2"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          className="w-full text-slate-600"
          onClick={onToggleExpand}
        >
          {isExpanded ? "Show Less" : "More Filters"}
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            className="flex-1 border-slate-200"
            onClick={() => {
              setLocalFilters({
                location: "",
                min_price: 0,
                max_price: 2000000,
                property_types: [],
                min_units: 1,
                max_units: 50,
                min_cap_rate: 0,
                min_roi: 0,
                min_cash_flow: 0
              });
              onReset?.();
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            className="flex-1 bg-slate-900 hover:bg-slate-800"
            onClick={() => onSearch?.(localFilters)}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          onClick={() => onSaveSearch?.(localFilters)}
        >
          <Save className="w-4 h-4 mr-2" />
          Save This Search
        </Button>
      </CardContent>
    </Card>
  );
}