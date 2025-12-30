import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  LayoutGrid, Map, List, Plus, Search, ArrowUpDown,
  ChevronDown, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import PropertyCard from '../components/properties/PropertyCard';
import FilterPanel from '../components/properties/FilterPanel';
import PropertyMap from '../components/properties/PropertyMap';
import MetricsSummary from '../components/properties/MetricsSummary';
import InvestmentCalculator from '../components/properties/InvestmentCalculator';
import PropertyDetailModal from '../components/properties/PropertyDetailModal';
import PropertySearch from '../components/properties/PropertySearch';

export default function Properties() {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [calculatorProperty, setCalculatorProperty] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState('investment_score');
  const [quickSearch, setQuickSearch] = useState('');

  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-investment_score', 100),
  });

  // Fetch favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  // Create favorite mutation
  const createFavoriteMutation = useMutation({
    mutationFn: (propertyId) => base44.entities.Favorite.create({ property_id: propertyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Property saved to favorites');
    },
  });

  // Delete favorite mutation
  const deleteFavoriteMutation = useMutation({
    mutationFn: (favoriteId) => base44.entities.Favorite.delete(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: (searchFilters) => base44.entities.SearchHistory.create({
      search_name: `Search ${new Date().toLocaleDateString()}`,
      filters: searchFilters,
      results_count: filteredProperties.length
    }),
    onSuccess: () => {
      toast.success('Search saved');
    },
  });

  const favoritePropertyIds = favorites.map(f => f.property_id);

  const isPropertyFavorite = (propertyId) => favoritePropertyIds.includes(propertyId);

  const toggleFavorite = (property) => {
    const favorite = favorites.find(f => f.property_id === property.id);
    if (favorite) {
      deleteFavoriteMutation.mutate(favorite.id);
    } else {
      createFavoriteMutation.mutate(property.id);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    // Quick search
    if (quickSearch) {
      const searchLower = quickSearch.toLowerCase();
      const matchesSearch = 
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower) ||
        property.state?.toLowerCase().includes(searchLower) ||
        property.zip_code?.includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      const matchesLocation = 
        property.city?.toLowerCase().includes(locationLower) ||
        property.state?.toLowerCase().includes(locationLower) ||
        property.zip_code?.includes(filters.location);
      if (!matchesLocation) return false;
    }

    // Price range
    if (filters.min_price && property.price < filters.min_price) return false;
    if (filters.max_price && property.price > filters.max_price) return false;

    // Property types
    if (filters.property_types?.length > 0) {
      if (!filters.property_types.includes(property.property_type)) return false;
    }

    // Units
    if (filters.min_units && property.units < filters.min_units) return false;
    if (filters.max_units && property.units > filters.max_units) return false;

    // Investment metrics
    if (filters.min_cap_rate && property.cap_rate < filters.min_cap_rate) return false;
    if (filters.min_roi && property.roi < filters.min_roi) return false;
    if (filters.min_cash_flow && property.cash_flow_monthly < filters.min_cash_flow) return false;

    return true;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'investment_score':
        return (b.investment_score || 0) - (a.investment_score || 0);
      case 'price_asc':
        return (a.price || 0) - (b.price || 0);
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
      case 'cap_rate':
        return (b.cap_rate || 0) - (a.cap_rate || 0);
      case 'cash_flow':
        return (b.cash_flow_monthly || 0) - (a.cash_flow_monthly || 0);
      case 'newest':
        return new Date(b.created_date) - new Date(a.created_date);
      default:
        return 0;
    }
  });

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setShowDetails(true);
  };

  const handleOpenCalculator = (property) => {
    setCalculatorProperty(property);
    setShowCalculator(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Investment Properties</h1>
              <p className="text-slate-500 text-sm">
                {sortedProperties.length} properties found
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Property Search */}
              <PropertySearch onSearchComplete={() => queryClient.invalidateQueries({ queryKey: ['properties'] })} />
              
              {/* Quick Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Quick filter..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200"
                />
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-200">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('investment_score')}>
                    Investment Score
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price_asc')}>
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price_desc')}>
                    Price: High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('cap_rate')}>
                    Cap Rate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('cash_flow')}>
                    Cash Flow
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    Newest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="bg-slate-100 rounded-lg p-1 flex">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  className={viewMode === 'map' ? 'bg-white shadow-sm' : ''}
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Metrics Summary */}
        <div className="mb-6">
          <MetricsSummary properties={sortedProperties} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={(f) => setFilters(f)}
                onSaveSearch={(f) => saveSearchMutation.mutate(f)}
                onReset={() => setFilters({})}
                isExpanded={expandedFilters}
                onToggleExpand={() => setExpandedFilters(!expandedFilters)}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {propertiesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : viewMode === 'map' ? (
              <div className="h-[600px] rounded-xl overflow-hidden">
                <PropertyMap
                  properties={sortedProperties}
                  onPropertyClick={handleViewDetails}
                  selectedPropertyId={selectedProperty?.id}
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {sortedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={isPropertyFavorite(property.id)}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={handleViewDetails}
                      onOpenCalculator={handleOpenCalculator}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!propertiesLoading && sortedProperties.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your filters or search criteria</p>
                <Button variant="outline" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        open={showDetails}
        onOpenChange={setShowDetails}
        isFavorite={selectedProperty && isPropertyFavorite(selectedProperty.id)}
        onToggleFavorite={toggleFavorite}
        onOpenCalculator={handleOpenCalculator}
      />

      {/* Investment Calculator Modal */}
      <InvestmentCalculator
        property={calculatorProperty}
        open={showCalculator}
        onOpenChange={setShowCalculator}
      />
    </div>
  );
}