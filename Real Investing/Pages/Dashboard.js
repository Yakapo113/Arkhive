import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Heart, History, TrendingUp, DollarSign,
  Search, ArrowRight, MapPin, Target, BarChart3, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
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

  // Fetch search history
  const { data: searches = [] } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => base44.entities.SearchHistory.list('-created_date', 5),
  });

  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate stats
  const totalProperties = properties.length;
  const avgCapRate = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.cap_rate || 0), 0) / properties.length
    : 0;
  const avgCashFlow = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.cash_flow_monthly || 0), 0) / properties.length
    : 0;
  const topDeals = properties
    .filter(p => p.investment_score >= 70)
    .slice(0, 5);

  const stats = [
    {
      label: "Total Properties",
      value: totalProperties,
      icon: Building2,
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Saved Favorites",
      value: favorites.length,
      icon: Heart,
      color: "bg-red-500",
      bgColor: "bg-red-50"
    },
    {
      label: "Avg Cap Rate",
      value: `${avgCapRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      label: "Avg Cash Flow",
      value: formatCurrency(avgCashFlow) + "/mo",
      icon: DollarSign,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Next
              <span className="text-amber-400"> Investment Deal</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Discover income-producing properties with instant ROI analysis, 
              cap rates, and cash flow projections.
            </p>
            <Link to={createPageUrl('Properties')}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                <Search className="w-5 h-5 mr-2" />
                Start Searching
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-12 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                      <stat.icon className={cn("w-6 h-6", stat.color.replace('bg-', 'text-'))} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Deals */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">Top Investment Deals</CardTitle>
                </div>
                <Link to={createPageUrl('Properties')}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : topDeals.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No properties found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topDeals.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link to={createPageUrl('Properties')}>
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                            <div 
                              className="w-16 h-16 rounded-lg bg-slate-200 bg-cover bg-center flex-shrink-0"
                              style={{ backgroundImage: property.image_url ? `url(${property.image_url})` : undefined }}
                            >
                              {!property.image_url && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-900">
                                  {formatCurrency(property.price)}
                                </p>
                                {property.investment_score && (
                                  <Badge className={cn(
                                    "text-xs",
                                    property.investment_score >= 80 
                                      ? "bg-emerald-100 text-emerald-700" 
                                      : "bg-amber-100 text-amber-700"
                                  )}>
                                    {property.investment_score}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 truncate">
                                {property.address}, {property.city}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-emerald-600">
                                {property.cap_rate?.toFixed(1)}% Cap
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatCurrency(property.cash_flow_monthly)}/mo
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Searches */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('Properties')} className="block">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Search className="w-5 h-5 mr-3" />
                    Search Properties
                  </Button>
                </Link>
                <Link to={createPageUrl('Favorites')} className="block">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Heart className="w-5 h-5 mr-3" />
                    View Favorites
                  </Button>
                </Link>
                <Link to={createPageUrl('SavedSearches')} className="block">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <History className="w-5 h-5 mr-3" />
                    Saved Searches
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-lg">Recent Searches</CardTitle>
                </div>
                <Link to={createPageUrl('SavedSearches')}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {searches.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No recent searches
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searches.slice(0, 3).map((search) => (
                      <div 
                        key={search.id}
                        className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {search.search_name || 'Search'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {search.results_count} results
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Insights Placeholder */}
        <Card className="border-0 shadow-lg mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Market Insights</CardTitle>
                <p className="text-sm text-slate-500">Investment trends and analysis</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {(properties.filter(p => p.cap_rate >= 8).length / Math.max(properties.length, 1) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Properties with 8%+ Cap Rate</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {(properties.filter(p => p.cash_flow_monthly > 500).length / Math.max(properties.length, 1) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Positive Cash Flow ($500+/mo)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {properties.filter(p => p.property_type === 'multi_family').length}
                </p>
                <p className="text-sm text-slate-500 mt-1">Multi-Family Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}