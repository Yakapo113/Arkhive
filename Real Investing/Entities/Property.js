{
  "name": "Property",
  "type": "object",
  "properties": {
    "address": {
      "type": "string",
      "description": "Full property address"
    },
    "city": {
      "type": "string"
    },
    "state": {
      "type": "string"
    },
    "zip_code": {
      "type": "string"
    },
    "latitude": {
      "type": "number"
    },
    "longitude": {
      "type": "number"
    },
    "price": {
      "type": "number",
      "description": "Listing price"
    },
    "property_type": {
      "type": "string",
      "enum": [
        "single_family",
        "multi_family",
        "apartment",
        "commercial",
        "mixed_use",
        "land"
      ],
      "description": "Type of property"
    },
    "units": {
      "type": "number",
      "description": "Number of units"
    },
    "bedrooms": {
      "type": "number"
    },
    "bathrooms": {
      "type": "number"
    },
    "sqft": {
      "type": "number"
    },
    "year_built": {
      "type": "number"
    },
    "monthly_rent": {
      "type": "number",
      "description": "Total monthly rental income"
    },
    "annual_taxes": {
      "type": "number"
    },
    "insurance_annual": {
      "type": "number"
    },
    "hoa_monthly": {
      "type": "number"
    },
    "vacancy_rate": {
      "type": "number",
      "description": "Expected vacancy rate percentage"
    },
    "maintenance_annual": {
      "type": "number"
    },
    "cap_rate": {
      "type": "number",
      "description": "Capitalization rate percentage"
    },
    "cash_flow_monthly": {
      "type": "number"
    },
    "roi": {
      "type": "number",
      "description": "Return on investment percentage"
    },
    "noi": {
      "type": "number",
      "description": "Net Operating Income"
    },
    "image_url": {
      "type": "string"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "description": {
      "type": "string"
    },
    "listing_source": {
      "type": "string",
      "enum": [
        "zillow",
        "redfin",
        "realtor",
        "mls",
        "manual"
      ],
      "description": "Source of listing"
    },
    "listing_url": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "pending",
        "sold",
        "off_market"
      ],
      "default": "active"
    },
    "days_on_market": {
      "type": "number"
    },
    "unit_mix": {
      "type": "array",
      "description": "Details of each unit",
      "items": {
        "type": "object",
        "properties": {
          "unit_number": {
            "type": "string"
          },
          "bedrooms": {
            "type": "number"
          },
          "bathrooms": {
            "type": "number"
          },
          "sqft": {
            "type": "number"
          },
          "rent": {
            "type": "number"
          }
        }
      }
    },
    "investment_score": {
      "type": "number",
      "description": "AI-calculated investment score 1-100"
    }
  },
  "required": [
    "address",
    "city",
    "state",
    "price"
  ]
}