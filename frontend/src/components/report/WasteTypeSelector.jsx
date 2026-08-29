import React from 'react';
import { Trash, AlertTriangle, Layers, Construction, Apple, Box, Flame, HelpCircle } from 'lucide-react';
import './WasteTypeSelector.css';

const WASTE_TYPES = [
  { id: 'Overflowing Garbage', label: 'Overflowing Garbage', desc: 'Full community bins or roadside containers overflowing', icon: Trash },
  { id: 'Illegal Dumping', label: 'Illegal Dumping', desc: 'Unauthorized open waste dumps on streets or vacant plots', icon: AlertTriangle },
  { id: 'Plastic Waste', label: 'Plastic Waste', desc: 'Heavy plastic accumulation, bottles, packaging film', icon: Layers },
  { id: 'Construction Waste', label: 'Construction Waste', desc: 'Debris, cement rubble, stones, building excavation', icon: Construction },
  { id: 'Organic Waste', label: 'Organic Waste', desc: 'Vegetable market remnants, food waste, plant debris', icon: Apple },
  { id: 'Mixed Waste', label: 'Mixed Waste', desc: 'Combination of non-segregated wet and dry garbage', icon: Box },
  { id: 'Hazardous Waste', label: 'Hazardous Waste', desc: 'Medical waste, chemicals, toxic substances, broken glass', icon: Flame },
  { id: 'Other', label: 'Other Civic Waste', desc: 'Any other civic waste issue not listed above', icon: HelpCircle }
];

export default function WasteTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="waste-type-selector-group">
      <label className="section-field-label">
        Select Primary Waste Category <span className="req-star">*</span>
      </label>
      <div className="waste-type-grid">
        {WASTE_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          const Icon = type.icon;

          return (
            <button
              type="button"
              key={type.id}
              className={`waste-type-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(type.id)}
            >
              <div className="waste-type-icon-wrapper">
                <Icon size={22} />
              </div>
              <div className="waste-type-info">
                <span className="waste-type-name">{type.label}</span>
                <span className="waste-type-desc">{type.desc}</span>
              </div>
              {isSelected && <div className="selected-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}