import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Percent, PiggyBank, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function InvestmentCalculator({ property, open, onOpenChange }) {
  const [inputs, setInputs] = useState({
    purchasePrice: property?.price || 0,
    downPaymentPercent: 25,
    interestRate: 7.0,
    loanTermYears: 30,
    monthlyRent: property?.monthly_rent || 0,
    annualTaxes: property?.annual_taxes || 0,
    annualInsurance: property?.insurance_annual || 1200,
    monthlyHoa: property?.hoa_monthly || 0,
    vacancyRate: property?.vacancy_rate || 5,
    maintenancePercent: 10,
    managementPercent: 10,
    closingCostsPercent: 3
  });

  const [results, setResults] = useState({});

  useEffect(() => {
    if (property) {
      setInputs(prev => ({
        ...prev,
        purchasePrice: property.price || 0,
        monthlyRent: property.monthly_rent || 0,
        annualTaxes: property.annual_taxes || 0,
        annualInsurance: property.insurance_annual || 1200,
        monthlyHoa: property.hoa_monthly || 0,
        vacancyRate: property.vacancy_rate || 5
      }));
    }
  }, [property]);

  useEffect(() => {
    calculateReturns();
  }, [inputs]);

  const calculateReturns = () => {
    const {
      purchasePrice, downPaymentPercent, interestRate, loanTermYears,
      monthlyRent, annualTaxes, annualInsurance, monthlyHoa,
      vacancyRate, maintenancePercent, managementPercent, closingCostsPercent
    } = inputs;

    // Down payment and loan
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const closingCosts = purchasePrice * (closingCostsPercent / 100);
    const totalCashNeeded = downPayment + closingCosts;

    // Monthly mortgage payment (P&I)
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    const monthlyMortgage = loanAmount > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;

    // Annual income
    const grossAnnualRent = monthlyRent * 12;
    const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRate / 100);

    // Annual expenses
    const maintenance = effectiveGrossIncome * (maintenancePercent / 100);
    const management = effectiveGrossIncome * (managementPercent / 100);
    const totalOperatingExpenses = annualTaxes + annualInsurance + (monthlyHoa * 12) + maintenance + management;

    // NOI (Net Operating Income)
    const noi = effectiveGrossIncome - totalOperatingExpenses;

    // Cash flow
    const annualDebtService = monthlyMortgage * 12;
    const annualCashFlow = noi - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;

    // Investment metrics
    const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
    const cashOnCashReturn = totalCashNeeded > 0 ? (annualCashFlow / totalCashNeeded) * 100 : 0;
    const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
    const grm = monthlyRent > 0 ? purchasePrice / grossAnnualRent : 0;

    // ROI (simplified 5-year appreciation assumed at 3%/year)
    const appreciationRate = 0.03;
    const futureValue = purchasePrice * Math.pow(1 + appreciationRate, 5);
    const equityGain = futureValue - purchasePrice;
    const totalReturn5Year = (annualCashFlow * 5) + equityGain;
    const roi5Year = totalCashNeeded > 0 ? (totalReturn5Year / totalCashNeeded) * 100 : 0;

    setResults({
      downPayment,
      loanAmount,
      closingCosts,
      totalCashNeeded,
      monthlyMortgage,
      grossAnnualRent,
      effectiveGrossIncome,
      totalOperatingExpenses,
      noi,
      annualCashFlow,
      monthlyCashFlow,
      capRate,
      cashOnCashReturn,
      dscr,
      grm,
      roi5Year
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const MetricCard = ({ label, value, icon: Icon, color = "slate", subtext }) => (
    <div className={cn(
      "p-4 rounded-xl",
      color === "green" && "bg-emerald-50",
      color === "amber" && "bg-amber-50",
      color === "blue" && "bg-blue-50",
      color === "slate" && "bg-slate-50"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn(
          "w-4 h-4",
          color === "green" && "text-emerald-600",
          color === "amber" && "text-amber-600",
          color === "blue" && "text-blue-600",
          color === "slate" && "text-slate-600"
        )} />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn(
        "text-xl font-bold",
        color === "green" && "text-emerald-700",
        color === "amber" && "text-amber-700",
        color === "blue" && "text-blue-700",
        color === "slate" && "text-slate-900"
      )}>
        {value}
      </p>
      {subtext && <p className="text-xs text-slate-500 mt-0.5">{subtext}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calculator className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Investment Calculator</DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">{property?.address}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="inputs" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="inputs">Deal Inputs</TabsTrigger>
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="mt-4 space-y-6">
            {/* Purchase Details */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Purchase Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Purchase Price</Label>
                    <Input
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={(e) => updateInput("purchasePrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Closing Costs (%)</Label>
                    <Input
                      type="number"
                      value={inputs.closingCostsPercent}
                      onChange={(e) => updateInput("closingCostsPercent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financing */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4" /> Financing
                </h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Down Payment</Label>
                      <span className="text-sm font-medium">{inputs.downPaymentPercent}% ({formatCurrency(inputs.purchasePrice * inputs.downPaymentPercent / 100)})</span>
                    </div>
                    <Slider
                      value={[inputs.downPaymentPercent]}
                      onValueChange={([v]) => updateInput("downPaymentPercent", v)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={inputs.interestRate}
                        onChange={(e) => updateInput("interestRate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Term (years)</Label>
                      <Input
                        type="number"
                        value={inputs.loanTermYears}
                        onChange={(e) => updateInput("loanTermYears", parseInt(e.target.value) || 30)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Income
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Rent</Label>
                    <Input
                      type="number"
                      value={inputs.monthlyRent}
                      onChange={(e) => updateInput("monthlyRent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vacancy Rate (%)</Label>
                    <Input
                      type="number"
                      value={inputs.vacancyRate}
                      onChange={(e) => updateInput("vacancyRate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Percent className="w-4 h-4" /> Expenses
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Taxes</Label>
                    <Input
                      type="number"
                      value={inputs.annualTaxes}
                      onChange={(e) => updateInput("annualTaxes", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Insurance</Label>
                    <Input
                      type="number"
                      value={inputs.annualInsurance}
                      onChange={(e) => updateInput("annualInsurance", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly HOA</Label>
                    <Input
                      type="number"
                      value={inputs.monthlyHoa}
                      onChange={(e) => updateInput("monthlyHoa", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maintenance (%)</Label>
                    <Input
                      type="number"
                      value={inputs.maintenancePercent}
                      onChange={(e) => updateInput("maintenancePercent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Management (%)</Label>
                    <Input
                      type="number"
                      value={inputs.managementPercent}
                      onChange={(e) => updateInput("managementPercent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-4 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Cap Rate"
                value={`${results.capRate?.toFixed(2) || 0}%`}
                icon={TrendingUp}
                color="amber"
              />
              <MetricCard
                label="Cash on Cash"
                value={`${results.cashOnCashReturn?.toFixed(2) || 0}%`}
                icon={Percent}
                color="green"
              />
              <MetricCard
                label="DSCR"
                value={results.dscr?.toFixed(2) || 0}
                icon={TrendingUp}
                color={results.dscr >= 1.25 ? "green" : results.dscr >= 1 ? "amber" : "slate"}
              />
              <MetricCard
                label="5-Year ROI"
                value={`${results.roi5Year?.toFixed(1) || 0}%`}
                icon={TrendingUp}
                color="blue"
              />
            </div>

            {/* Cash Flow Analysis */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Cash Flow Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Gross Annual Rent</span>
                    <span className="font-medium">{formatCurrency(results.grossAnnualRent)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Effective Gross Income</span>
                    <span className="font-medium">{formatCurrency(results.effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Operating Expenses</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.totalOperatingExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 bg-slate-50 -mx-6 px-6">
                    <span className="font-medium text-slate-900">Net Operating Income (NOI)</span>
                    <span className="font-bold text-slate-900">{formatCurrency(results.noi)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Annual Debt Service</span>
                    <span className="font-medium text-red-600">-{formatCurrency(results.monthlyMortgage * 12)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-emerald-50 -mx-6 px-6 rounded-lg">
                    <span className="font-semibold text-emerald-800">Monthly Cash Flow</span>
                    <span className={cn(
                      "font-bold text-xl",
                      results.monthlyCashFlow >= 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {formatCurrency(results.monthlyCashFlow)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Summary */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Investment Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Total Cash Needed</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(results.totalCashNeeded)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Down Payment + Closing
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Monthly Payment</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(results.monthlyMortgage)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Principal + Interest
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Loan Amount</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(results.loanAmount)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">GRM</p>
                    <p className="text-xl font-bold text-slate-900">{results.grm?.toFixed(1) || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Gross Rent Multiplier
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}