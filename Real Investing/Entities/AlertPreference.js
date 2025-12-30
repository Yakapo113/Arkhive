{
  "name": "AlertPreference",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Alert name"
    },
    "locations": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Cities, states, or regions to monitor"
    },
    "min_cap_rate": {
      "type": "number",
      "description": "Minimum cap rate percentage"
    },
    "min_roi": {
      "type": "number",
      "description": "Minimum ROI percentage"
    },
    "min_cash_flow": {
      "type": "number",
      "description": "Minimum monthly cash flow"
    },
    "max_price": {
      "type": "number",
      "description": "Maximum property price"
    },
    "property_types": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Property types to monitor"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether this alert is active"
    },
    "last_checked": {
      "type": "string",
      "format": "date-time",
      "description": "Last time properties were checked"
    }
  },
  "required": [
    "name",
    "locations"
  ]
}