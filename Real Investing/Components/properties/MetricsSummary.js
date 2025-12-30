import React from 'react';
import { Card } from "@/components/ui/card";
import { Building2, TrendingUp, DollarSign, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function MetricsSummary({ properties = [] }) {
  const totalProperties = properties.length;
  const avgCapRate = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.cap_rate || 0), 0) / properties.length
    : 0;
  const avgCashFlow = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.cash_flow_monthly || 0), 0) / properties.length
    : 0;
  const avgScore = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.investment_score || 0), 0) / properties.length
    : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const metrics = [
    {
      label: "Properties Found",
      value: totalProperties,
      icon: Building2,
      color: "bg-blue-500"
    },
    {
      label: "Avg Cap Rate",
      value: `${avgCapRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-amber-500"
    },
    {
      label: "Avg Cash Flow",
      value: formatCurrency(avgCashFlow) + "/mo",
      icon: DollarSign,
      color: "bg-emerald-500"
    },
    {
      label: "Avg Score",
      value: avgScore.toFixed(0),
      icon: Target,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {metric.value}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}