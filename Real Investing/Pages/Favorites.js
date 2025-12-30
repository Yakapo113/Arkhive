import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, Trash2, MapPin, Building2, TrendingUp, 
  DollarSign, Calculator, Edit2, Check, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import InvestmentCalculator from '../components/properties/InvestmentCalculator';
import PropertyDetailModal from '../components/properties/PropertyDetailModal';

export default function Favorites() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [calculatorProperty, setCalculatorProperty] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState('');

  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date'),
  });

  // Fetch all properties to match with favorites
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  // Update favorite mutation
  const updateFavoriteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Favorite.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setEditingNotes(null);
      toast.success('Notes saved');
    },
  });

  // Delete favorite mutation
  const deleteFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
  });

  // Match favorites with property data
  const favoritesWithProperties = favorites.map(fav => ({
    ...fav,
    property: properties.find(p => p.id === fav.property_id)
  })).filter(fav => fav.property);

  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleEditNotes = (favorite) => {
    setEditingNotes(favorite.id);
    setNoteText(favorite.notes || '');
  };

  const handleSaveNotes = (favoriteId) => {
    updateFavoriteMutation.mutate({
      id: favoriteId,
      data: { notes: noteText }
    });
  };

  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Saved Properties</h1>
              <p className="text-slate-500">
                {favoritesWithProperties.length} properties saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {favoritesLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : favoritesWithProperties.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved properties</h3>
              <p className="text-slate-500 mb-4">
                Start exploring properties and save your favorites
              </p>
              <Button 
                className="bg-slate-900 hover:bg-slate-800"
                onClick={() => window.location.href = '/Properties'}
              >
                Browse Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {favoritesWithProperties.map((favorite) => {
                const property = favorite.property;
                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div 
                          className="w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-slate-200 to-slate-300 bg-cover bg-center flex-shrink-0 cursor-pointer"
                          style={{ backgroundImage: property.image_url ? `url(${property.image_url})` : undefined }}
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowDetails(true);
                          }}
                        >
                          {!property.image_url && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-12 h-12 text-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div 
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowDetails(true);
                              }}
                            >
                              <p className="text-xl font-bold text-slate-900">
                                {formatCurrency(property.price)}
                              </p>
                              <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{property.address}, {property.city}, {property.state}</span>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-red-500"
                              onClick={() => deleteFavoriteMutation.mutate(favorite.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Metrics */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            <Badge className="bg-amber-100 text-amber-700 border-0">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {property.cap_rate?.toFixed(1)}% Cap
                            </Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {formatCurrency(property.cash_flow_monthly)}/mo
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-700 border-0">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {property.roi?.toFixed(1)}% ROI
                            </Badge>
                            {property.investment_score && (
                              <Badge className={cn(
                                "border-0",
                                property.investment_score >= 80 ? "bg-emerald-100 text-emerald-700" :
                                property.investment_score >= 60 ? "bg-amber-100 text-amber-700" :
                                "bg-slate-100 text-slate-700"
                              )}>
                                Score: {property.investment_score}
                              </Badge>
                            )}
                          </div>

                          {/* Notes */}
                          <div className="border-t border-slate-100 pt-4">
                            {editingNotes === favorite.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Add notes about this property..."
                                  className="min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-slate-900 hover:bg-slate-800"
                                    onClick={() => handleSaveNotes(favorite.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelNotes}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {favorite.notes ? (
                                    <p className="text-sm text-slate-600">{favorite.notes}</p>
                                  ) : (
                                    <p className="text-sm text-slate-400 italic">No notes added</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-slate-600"
                                  onClick={() => handleEditNotes(favorite)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCalculatorProperty(property);
                                setShowCalculator(true);
                              }}
                            >
                              <Calculator className="w-4 h-4 mr-1" />
                              Calculator
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        open={showDetails}
        onOpenChange={setShowDetails}
        isFavorite={true}
        onToggleFavorite={() => {
          const fav = favorites.find(f => f.property_id === selectedProperty?.id);
          if (fav) deleteFavoriteMutation.mutate(fav.id);
        }}
        onOpenCalculator={(p) => {
          setCalculatorProperty(p);
          setShowCalculator(true);
        }}
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