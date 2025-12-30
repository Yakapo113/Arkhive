import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, DollarSign, TrendingUp, ExternalLink } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (score) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#64748b';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 11px;
        ">${score || '?'}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 10);
    }
  }, [center, zoom, map]);
  return null;
}

export default function PropertyMap({ 
  properties = [], 
  center = [39.8283, -98.5795], 
  zoom = 4,
  onPropertyClick,
  selectedPropertyId 
}) {
  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const validProperties = properties.filter(p => p.latitude && p.longitude);

  return (
    <Card className="overflow-hidden border-0 shadow-lg h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full min-h-[400px]"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} />
        
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createCustomIcon(property.investment_score)}
          >
            <Popup className="property-popup" maxWidth={300}>
              <div className="p-1">
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-20 h-16 rounded-lg bg-slate-200 bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: property.image_url ? `url(${property.image_url})` : undefined }}
                  >
                    {!property.image_url && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-lg leading-tight">
                      {formatCurrency(property.price)}
                    </p>
                    <p className="text-sm text-slate-600 truncate">{property.address}</p>
                    <p className="text-xs text-slate-500">{property.city}, {property.state}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Cap Rate</p>
                    <p className="font-semibold text-slate-900">
                      {property.cap_rate?.toFixed(1) || 'N/A'}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">ROI</p>
                    <p className="font-semibold text-slate-900">
                      {property.roi?.toFixed(1) || 'N/A'}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Cash Flow</p>
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(property.cash_flow_monthly)}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  onClick={() => onPropertyClick?.(property)}
                >
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}