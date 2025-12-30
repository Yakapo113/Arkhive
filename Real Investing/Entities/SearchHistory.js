{
  "name": "SearchHistory",
  "type": "object",
  "properties": {
    "search_name": {
      "type": "string",
      "description": "Name for saved search"
    },
    "filters": {
      "type": "object",
      "description": "Search filters applied",
      "properties": {
        "location": {
          "type": "string"
        },
        "min_price": {
          "type": "number"
        },
        "max_price": {
          "type": "number"
        },
        "property_types": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "min_units": {
          "type": "number"
        },
        "max_units": {
          "type": "number"
        },
        "min_cap_rate": {
          "type": "number"
        },
        "min_roi": {
          "type": "number"
        },
        "min_cash_flow": {
          "type": "number"
        }
      }
    },
    "results_count": {
      "type": "number"
    }
  },
  "required": [
    "filters"
  ]
}