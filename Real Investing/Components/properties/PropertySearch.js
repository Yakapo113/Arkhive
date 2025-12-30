import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2, MapPin, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PropertySearch({ onSearchComplete }) {
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const searchProperties = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const prompt = `Find real estate investment properties based on this search: "${searchQuery}".
      
      Search for actual properties currently listed for sale. Include:
      - Multi-family properties, apartments, single-family homes suitable for investment
      - Properties in the specified location or matching the criteria
      - Current market listings with realistic prices
      
      Return exactly 5-10 properties as a JSON array with this structure:
      [
        {
          "address": "full street address",
          "city": "city name",
          "state": "state abbreviation",
          "zip_code": "zip code",
          "latitude": number,
          "longitude": number,
          "price": number,
          "property_type": "single_family|multi_family|apartment|commercial",
          "units": number,
          "bedrooms": number,
          "bathrooms": number,
          "sqft": number,
          "year_built": number,
          "monthly_rent": estimated monthly rent total,
          "annual_taxes": estimated annual property taxes,
          "insurance_annual": 1200-2400 based on property,
          "vacancy_rate": 5,
          "description": "brief property description",
          "listing_source": "source of listing"
        }
      ]
      
      Calculate reasonable investment metrics for each property.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            properties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  zip_code: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  price: { type: "number" },
                  property_type: { type: "string" },
                  units: { type: "number" },
                  bedrooms: { type: "number" },
                  bathrooms: { type: "number" },
                  sqft: { type: "number" },
                  year_built: { type: "number" },
                  monthly_rent: { type: "number" },
                  annual_taxes: { type: "number" },
                  insurance_annual: { type: "number" },
                  vacancy_rate: { type: "number" },
                  description: { type: "string" },
                  listing_source: { type: "string" }
                }
              }
            }
          }
        }
      });

      const properties = result.properties || [];
      
      if (properties.length === 0) {
        toast.error('No properties found. Try a different search.');
        setIsSearching(false);
        return;
      }

      // Calculate investment metrics for each property
      const enrichedProperties = properties.map(prop => {
        const monthlyRent = prop.monthly_rent || 0;
        const annualRent = monthlyRent * 12;
        const effectiveRent = annualRent * (1 - (prop.vacancy_rate || 5) / 100);
        const operatingExpenses = (prop.annual_taxes || 0) + (prop.insurance_annual || 1500) + (effectiveRent * 0.2);
        const noi = effectiveRent - operatingExpenses;
        const capRate = prop.price > 0 ? (noi / prop.price) * 100 : 0;
        
        // Estimate cash flow with financing
        const downPayment = prop.price * 0.25;
        const loanAmount = prop.price - downPayment;
        const monthlyRate = 0.07 / 12;
        const numPayments = 30 * 12;
        const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        const monthlyExpenses = operatingExpenses / 12;
        const cashFlow = monthlyRent - monthlyMortgage - monthlyExpenses;
        
        const totalInvestment = downPayment + (prop.price * 0.03);
        const annualCashFlow = cashFlow * 12;
        const roi = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
        
        // Investment score
        let score = 50;
        if (capRate >= 8) score += 15;
        else if (capRate >= 6) score += 10;
        if (roi >= 15) score += 15;
        else if (roi >= 10) score += 10;
        if (cashFlow >= 500) score += 15;
        else if (cashFlow >= 200) score += 10;
        if (prop.units >= 4) score += 5;
        
        return {
          ...prop,
          hoa_monthly: 0,
          maintenance_annual: effectiveRent * 0.1,
          cap_rate: capRate,
          cash_flow_monthly: cashFlow,
          roi: roi,
          noi: noi,
          investment_score: Math.min(100, Math.max(0, score)),
          status: 'active',
          days_on_market: Math.floor(Math.random() * 60),
        };
      });

      setSearchResults(enrichedProperties);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search properties. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const saveProperties = async () => {
    if (!searchResults) return;

    try {
      await base44.entities.Property.bulkCreate(searchResults);
      toast.success(`Added ${searchResults.length} properties to your database`);
      setShowDialog(false);
      setSearchResults(null);
      setSearchQuery('');
      onSearchComplete?.();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save properties');
    }
  };

  return (
    <>
      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => setShowDialog(true)}
      >
        <Search className="w-4 h-4 mr-2" />
        Search New Properties
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search for Investment Properties</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., multi-family properties in Austin TX under 500k"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isSearching && searchProperties()}
                className="flex-1"
              />
              <Button onClick={searchProperties} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Search Tips:</strong> Be specific about location, property type, price range, or investment criteria. 
                Example: "4-unit apartment buildings in Phoenix under $600k"
              </p>
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-slate-600">Searching for properties...</p>
                  <p className="text-sm text-slate-500 mt-1">This may take a moment</p>
                </div>
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Found {searchResults.length} properties
                  </p>
                  <Button onClick={saveProperties} className="bg-emerald-600 hover:bg-emerald-700">
                    Add All to Database
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((prop, idx) => (
                    <Card key={idx} className="border border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900">{prop.address}</h4>
                            <p className="text-sm text-slate-500">
                              {prop.city}, {prop.state} {prop.zip_code}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">
                              ${prop.price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-emerald-600">
                              {prop.cap_rate?.toFixed(1)}% Cap Rate
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-600">
                          <span>{prop.units} units</span>
                          <span>•</span>
                          <span>{prop.bedrooms} beds</span>
                          <span>•</span>
                          <span>${prop.monthly_rent?.toLocaleString()}/mo rent</span>
                          <span>•</span>
                          <span>Score: {prop.investment_score}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}