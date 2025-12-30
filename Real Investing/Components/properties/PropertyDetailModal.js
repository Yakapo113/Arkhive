import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Building2, Calendar, Ruler, Bed, Bath, 
  DollarSign, TrendingUp, Calculator, Heart, ExternalLink,
  Home, PiggyBank, BarChart3
} from "lucide-react";
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

export default function PropertyDetailModal({ 
  property, 
  open, 
  onOpenChange,
  isFavorite,
  onToggleFavorite,
  onOpenCalculator 
}) {
  const navigate = useNavigate();
  
  if (!property) return null;

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative h-64 bg-gradient-to-br from-slate-200 to-slate-300">
          {property.image_url ? (
            <img 
              src={property.image_url} 
              alt={property.address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-24 h-24 text-slate-400" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(property.price)}
                </p>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address}</span>
                </div>
                <p className="text-white/70 text-sm mt-0.5">
                  {property.city}, {property.state} {property.zip_code}
                </p>
              </div>
              
              <div className="flex gap-2">
                {property.investment_score && (
                  <Badge className={cn("text-lg px-4 py-1", getScoreColor(property.investment_score))}>
                    Score: {property.investment_score}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <Home className="w-4 h-4 mr-1.5" />
              {propertyTypeLabels[property.property_type] || property.property_type}
            </Badge>
            {property.units && (
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Building2 className="w-4 h-4 mr-1.5" />
                {property.units} Units
              </Badge>
            )}
            {property.bedrooms && (
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Bed className="w-4 h-4 mr-1.5" />
                {property.bedrooms} Beds
              </Badge>
            )}
            {property.bathrooms && (
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Bath className="w-4 h-4 mr-1.5" />
                {property.bathrooms} Baths
              </Badge>
            )}
            {property.sqft && (
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Ruler className="w-4 h-4 mr-1.5" />
                {property.sqft.toLocaleString()} sqft
              </Badge>
            )}
            {property.year_built && (
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Calendar className="w-4 h-4 mr-1.5" />
                Built {property.year_built}
              </Badge>
            )}
          </div>

          <Tabs defaultValue="metrics" className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="metrics">Investment Metrics</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Cap Rate
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatPercent(property.cap_rate)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <TrendingUp className="w-4 h-4" />
                      ROI
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatPercent(property.roi)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <DollarSign className="w-4 h-4" />
                      NOI
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(property.noi)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <DollarSign className="w-4 h-4" />
                      Cash Flow
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      property.cash_flow_monthly > 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {formatCurrency(property.cash_flow_monthly)}/mo
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financials" className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Income
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Rent</span>
                        <span className="font-medium">{formatCurrency(property.monthly_rent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Annual Rent</span>
                        <span className="font-medium">{formatCurrency((property.monthly_rent || 0) * 12)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <PiggyBank className="w-4 h-4" />
                      Expenses
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Annual Taxes</span>
                        <span className="font-medium">{formatCurrency(property.annual_taxes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Insurance</span>
                        <span className="font-medium">{formatCurrency(property.insurance_annual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">HOA</span>
                        <span className="font-medium">{formatCurrency((property.hoa_monthly || 0) * 12)}/yr</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Unit Mix */}
              {property.unit_mix && property.unit_mix.length > 0 && (
                <Card className="border-slate-200 mt-4">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-4">Unit Mix</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-2 text-slate-500 font-medium">Unit</th>
                            <th className="text-left py-2 px-2 text-slate-500 font-medium">Beds</th>
                            <th className="text-left py-2 px-2 text-slate-500 font-medium">Baths</th>
                            <th className="text-left py-2 px-2 text-slate-500 font-medium">Sqft</th>
                            <th className="text-right py-2 px-2 text-slate-500 font-medium">Rent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {property.unit_mix.map((unit, index) => (
                            <tr key={index} className="border-b border-slate-100">
                              <td className="py-2 px-2">{unit.unit_number || `Unit ${index + 1}`}</td>
                              <td className="py-2 px-2">{unit.bedrooms}</td>
                              <td className="py-2 px-2">{unit.bathrooms}</td>
                              <td className="py-2 px-2">{unit.sqft?.toLocaleString()}</td>
                              <td className="py-2 px-2 text-right font-medium">{formatCurrency(unit.rent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {property.description && (
                <Card className="border-slate-200 mb-4">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-slate-900 mb-3">Description</h4>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-200">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-slate-900 mb-4">Property Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Days on Market</p>
                      <p className="font-medium">{property.days_on_market || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <Badge variant="outline">{property.status || 'Active'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Source</p>
                      <p className="font-medium capitalize">{property.listing_source || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Vacancy Rate</p>
                      <p className="font-medium">{property.vacancy_rate || 5}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant={isFavorite ? "default" : "outline"}
                className={cn(
                  isFavorite && "bg-red-500 hover:bg-red-600"
                )}
                onClick={() => onToggleFavorite?.(property)}
              >
                <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onOpenCalculator?.(property)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Quick Calculator
              </Button>
              
              {property.listing_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(property.listing_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Listing
                </Button>
              )}
            </div>
            
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              onClick={() => {
                onOpenChange(false);
                navigate(createPageUrl('AdvancedCalculator'), { state: { property } });
              }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Run Advanced Investment Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}