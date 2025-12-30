import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Building2, DollarSign, TrendingUp, Calculator, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const propertyTypeLabels = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  apartment: "Apartment",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  land: "Land"
};

export default function PropertyCard({ 
  property, 
  isFavorite, 
  onToggleFavorite, 
  onViewDetails,
  onOpenCalculator,
  compact = false 
}) {
  const navigate = useNavigate();
  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!value && value !== 0) return "N/A";
    return `${value.toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (!score) return "bg-slate-100 text-slate-600";
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative">
          <div 
            className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 bg-cover bg-center"
            style={{ backgroundImage: property.image_url ? `url(${property.image_url})` : undefined }}
          >
            {!property.image_url && (
              <div className="h-full flex items-center justify-center">
                <Building2 className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </div>
          
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-slate-900/80 text-white backdrop-blur-sm border-0">
              {propertyTypeLabels[property.property_type] || property.property_type}
            </Badge>
            {property.units > 1 && (
              <Badge className="bg-amber-500/90 text-white backdrop-blur-sm border-0">
                {property.units} Units
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            {property.investment_score && (
              <Badge className={cn("backdrop-blur-sm border-0", getScoreColor(property.investment_score))}>
                Score: {property.investment_score}
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-9 w-9 rounded-full backdrop-blur-sm transition-all",
                isFavorite 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-white/80 text-slate-600 hover:bg-white hover:text-red-500"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(property);
              }}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-2xl font-bold text-white">{formatCurrency(property.price)}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900 leading-tight">{property.address}</p>
              <p className="text-sm text-slate-500">{property.city}, {property.state} {property.zip_code}</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Cap Rate
              </div>
              <p className="font-semibold text-slate-900">{formatPercent(property.cap_rate)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                ROI
              </div>
              <p className="font-semibold text-slate-900">{formatPercent(property.roi)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Monthly Rent
              </div>
              <p className="font-semibold text-slate-900">{formatCurrency(property.monthly_rent)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Cash Flow
              </div>
              <p className={cn(
                "font-semibold",
                property.cash_flow_monthly > 0 ? "text-emerald-600" : property.cash_flow_monthly < 0 ? "text-red-600" : "text-slate-900"
              )}>
                {formatCurrency(property.cash_flow_monthly)}/mo
              </p>
            </div>
          </div>

          {/* Property Details */}
          {!compact && (
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
              {property.bedrooms && <span>{property.bedrooms} Beds</span>}
              {property.bathrooms && <span>{property.bathrooms} Baths</span>}
              {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
              {property.year_built && <span>Built {property.year_built}</span>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-slate-900 hover:bg-slate-800"
              onClick={() => onViewDetails?.(property)}
            >
              View Details
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-200 hover:bg-slate-50"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCalculator?.(property);
              }}
              title="Quick Calculator"
            >
              <Calculator className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full mt-2 text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={(e) => {
              e.stopPropagation();
              navigate(createPageUrl('AdvancedCalculator'), { state: { property } });
            }}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Advanced Analysis
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}