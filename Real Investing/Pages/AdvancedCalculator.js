import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Calculator, Copy } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AdvancedCalculator() {
  const location = useLocation();
  const propertyData = location.state?.property;

  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculatorUrl = "https://arkhive.us/RealEstateCalc/index.html";

  const openCalculatorInNewTab = () => {
    // Open in new window with specific dimensions
    const width = 1200;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      calculatorUrl, 
      'AdvancedCalculator',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const copyPropertyData = () => {
    if (!propertyData) return;

    const dataText = `
Property: ${propertyData.address}, ${propertyData.city}, ${propertyData.state}

Key Inputs for Calculator:
• Purchase Price: ${formatCurrency(propertyData.price)}
• Down Payment: 25% (${formatCurrency(propertyData.price * 0.25)})
• Annual Property Tax: ${formatCurrency(propertyData.annual_taxes)}
• Annual Insurance: ${formatCurrency(propertyData.insurance_annual)}
• Monthly HOA: ${formatCurrency(propertyData.hoa_monthly)}
• Number of Units: ${propertyData.units || 1}
• Monthly Rent: ${formatCurrency(propertyData.monthly_rent)}
• Rent per Unit: ${formatCurrency((propertyData.monthly_rent || 0) / (propertyData.units || 1))}
• Vacancy Rate: ${propertyData.vacancy_rate || 5}%
• Annual Maintenance: ${formatCurrency(propertyData.maintenance_annual)}

Calculated Metrics:
• Cap Rate: ${propertyData.cap_rate?.toFixed(1)}%
• ROI: ${propertyData.roi?.toFixed(1)}%
• Monthly Cash Flow: ${formatCurrency(propertyData.cash_flow_monthly)}
• NOI: ${formatCurrency(propertyData.noi)}
    `.trim();

    navigator.clipboard.writeText(dataText);
    toast.success('Property data copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Properties')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Advanced Investment Simulator</h1>
                {propertyData && (
                  <p className="text-sm text-slate-500">
                    {propertyData.address}, {propertyData.city}, {propertyData.state}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Calculator className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Open Advanced Calculator
                </h2>
                <p className="text-slate-600">
                  The full investment simulator will open in a new tab with detailed cash flow analysis, 
                  tax calculations, appreciation scenarios, and interactive charts.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                onClick={openCalculatorInNewTab}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Calculator in New Tab
              </Button>
              
              {propertyData && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={copyPropertyData}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Property Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {propertyData && (
          <>
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Property Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Purchase Price</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(propertyData.price)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Monthly Rent</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(propertyData.monthly_rent)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Cash Flow</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(propertyData.cash_flow_monthly)}/mo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Calculator Input Guide</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Use these values from the property to populate the advanced calculator:
                </p>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Purchase Price</span>
                      <span className="font-medium">{formatCurrency(propertyData.price)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Down Payment (25%)</span>
                      <span className="font-medium">{formatCurrency(propertyData.price * 0.25)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Loan Interest Rate</span>
                      <span className="font-medium">7.0%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Loan Term</span>
                      <span className="font-medium">30 years</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Closing Costs (2%)</span>
                      <span className="font-medium">{formatCurrency(propertyData.price * 0.02)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Land Value (15%)</span>
                      <span className="font-medium">{formatCurrency(propertyData.price * 0.15)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Number of Units</span>
                      <span className="font-medium">{propertyData.units || 1}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Rent per Unit</span>
                      <span className="font-medium">{formatCurrency((propertyData.monthly_rent || 0) / (propertyData.units || 1))}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Vacancy Rate</span>
                      <span className="font-medium">{propertyData.vacancy_rate || 5}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Annual Property Tax</span>
                      <span className="font-medium">{formatCurrency(propertyData.annual_taxes)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Annual Insurance</span>
                      <span className="font-medium">{formatCurrency(propertyData.insurance_annual)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Annual HOA Fees</span>
                      <span className="font-medium">{formatCurrency((propertyData.hoa_monthly || 0) * 12)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Annual Maintenance</span>
                      <span className="font-medium">{formatCurrency(propertyData.maintenance_annual)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Click "Copy Property Data" above to copy all these values to your clipboard, 
                    then you can easily reference them when filling out the calculator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!propertyData && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-slate-600 mb-4">
                No property data loaded. You can still use the calculator with your own values.
              </p>
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                onClick={openCalculatorInNewTab}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Calculator
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}