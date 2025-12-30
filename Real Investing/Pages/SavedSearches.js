import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  History, Search, Trash2, Play, MapPin, DollarSign, 
  Building2, TrendingUp, Loader2, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { toast } from "sonner";

export default function SavedSearches() {
  const queryClient = useQueryClient();

  // Fetch search history
  const { data: searches = [], isLoading } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => base44.entities.SearchHistory.list('-created_date'),
  });

  // Delete search mutation
  const deleteSearchMutation = useMutation({
    mutationFn: (id) => base44.entities.SearchHistory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      toast.success('Search deleted');
    },
  });

  const formatCurrency = (value) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getFilterSummary = (filters) => {
    if (!filters) return [];
    const summary = [];
    
    if (filters.location) {
      summary.push({ icon: MapPin, text: filters.location });
    }
    if (filters.min_price || filters.max_price) {
      const min = formatCurrency(filters.min_price);
      const max = formatCurrency(filters.max_price);
      summary.push({ 
        icon: DollarSign, 
        text: min && max ? `${min} - ${max}` : min || `Up to ${max}`
      });
    }
    if (filters.property_types?.length > 0) {
      summary.push({ 
        icon: Building2, 
        text: filters.property_types.join(', ').replace(/_/g, ' ')
      });
    }
    if (filters.min_cap_rate) {
      summary.push({ icon: TrendingUp, text: `${filters.min_cap_rate}%+ Cap Rate` });
    }
    if (filters.min_roi) {
      summary.push({ icon: TrendingUp, text: `${filters.min_roi}%+ ROI` });
    }
    if (filters.min_cash_flow) {
      summary.push({ icon: DollarSign, text: `$${filters.min_cash_flow}+ Cash Flow` });
    }
    
    return summary;
  };

  const runSearch = (filters) => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.property_types?.length) params.set('types', filters.property_types.join(','));
    if (filters.min_cap_rate) params.set('min_cap', filters.min_cap_rate);
    if (filters.min_roi) params.set('min_roi', filters.min_roi);
    if (filters.min_cash_flow) params.set('min_cf', filters.min_cash_flow);
    
    window.location.href = createPageUrl('Properties') + '?' + params.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <History className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Saved Searches</h1>
              <p className="text-slate-500">
                {searches.length} searches saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : searches.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved searches</h3>
              <p className="text-slate-500 mb-4">
                Save your search criteria to quickly run them again
              </p>
              <Link to={createPageUrl('Properties')}>
                <Button className="bg-slate-900 hover:bg-slate-800">
                  Start Searching
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {searches.map((search) => {
                const filterSummary = getFilterSummary(search.filters);
                
                return (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                              {search.search_name || 'Saved Search'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {format(new Date(search.created_date), 'MMM d, yyyy h:mm a')}
                              </span>
                              {search.results_count !== undefined && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{search.results_count} results</span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => deleteSearchMutation.mutate(search.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Filter Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {filterSummary.map((filter, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="py-1.5 px-3 text-sm"
                            >
                              <filter.icon className="w-3.5 h-3.5 mr-1.5" />
                              {filter.text}
                            </Badge>
                          ))}
                          {filterSummary.length === 0 && (
                            <span className="text-sm text-slate-400 italic">
                              No filters applied
                            </span>
                          )}
                        </div>

                        {/* Run Search Button */}
                        <Button
                          className="bg-slate-900 hover:bg-slate-800"
                          onClick={() => runSearch(search.filters)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Run Search
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}