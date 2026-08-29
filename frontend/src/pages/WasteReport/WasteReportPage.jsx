import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

import ReportProgress from '../../components/report/ReportProgress';
import EvidenceUploader from '../../components/report/EvidenceUploader';
import WasteTypeSelector from '../../components/report/WasteTypeSelector';
import SeveritySelector from '../../components/report/SeveritySelector';
import LocationPicker from '../../components/report/LocationPicker';
import ReportSummary from '../../components/report/ReportSummary';
import ReportSuccess from '../../components/report/ReportSuccess';

import { saveReport } from '../../services/reportStorage';
import './WasteReportPage.css';

const INDICATOR_OPTIONS = [
  'Waste blocking road/path',
  'Strong smell',
  'Attracting animals',
  'Near residential area',
  'Near school/public place',
  'Burning/smoke visible'
];

export default function WasteReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createdReport, setCreatedReport] = useState(null);

  // Form State
  const [photos, setPhotos] = useState([]);
  const [wasteType, setWasteType] = useState('Overflowing Garbage');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [indicators, setIndicators] = useState([]);
  const [location, setLocation] = useState({
    latitude: 19.8833,
    longitude: 74.4667,
    area: 'Kopargaon Market Area (Z01)',
    address: 'Near Daily Mandi / Municipal Complex, Kopargaon',
    zone: 'Zone Z01'
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  const handlePhotosChange = (newPhotos) => {
    setPhotos(newPhotos);
    if (newPhotos.length > 0 && errors.photos) {
      setErrors((prev) => ({ ...prev, photos: null }));
    }
  };

  const handleIndicatorToggle = (option) => {
    setIndicators((prev) => 
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: null }));
    }
  };

  const handleNextStep = () => {
    // Step 1 Validation
    if (currentStep === 1) {
      if (photos.length === 0) {
        setErrors((prev) => ({ ...prev, photos: 'Please upload or capture at least one photo of the waste issue.' }));
        return;
      }
      setErrors({});
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 2 Validation
    if (currentStep === 2) {
      if (!wasteType) {
        setErrors((prev) => ({ ...prev, wasteType: 'Please select a waste category.' }));
        return;
      }
      setErrors({});
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 3 Validation
    if (currentStep === 3) {
      if (!location || !location.latitude) {
        setErrors((prev) => ({ ...prev, location: 'Please select or confirm a valid location in Kopargaon.' }));
        return;
      }
      setErrors({});
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      alert('Please check the confirmation box before submitting.');
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const reportId = `KOP-${randomDigits}`;
    
    let priorityScore = 50;
    if (severity.toLowerCase() === 'critical') priorityScore = 90;
    else if (severity.toLowerCase() === 'high') priorityScore = 75;
    else if (severity.toLowerCase() === 'medium') priorityScore = 55;
    else if (severity.toLowerCase() === 'low') priorityScore = 35;

    const finalReport = {
      id: reportId,
      reportId,
      category: 'Waste',
      issue: `${wasteType} — ${location.area}`,
      wasteType,
      severity,
      priority: severity,
      priorityScore,
      description,
      indicators,
      location,
      photos: photos.map((p) => ({ name: p.name, size: p.size, preview: p.preview })),
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };

    saveReport(finalReport);
    setCreatedReport(finalReport);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setCurrentStep(1);
    setPhotos([]);
    setWasteType('Overflowing Garbage');
    setSeverity('Medium');
    setDescription('');
    setIndicators([]);
    setIsConfirmed(false);
    setIsSubmitted(false);
    setCreatedReport(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSubmitted && createdReport) {
    return (
      <div className="container">
        <ReportSuccess report={createdReport} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="waste-report-flow-container">
        {/* Multi-step Header */}
        <ReportProgress currentStep={currentStep} onStepClick={(step) => step < currentStep && setCurrentStep(step)} />

        <div className="flow-card-body">
          {/* STEP 1: Photo Evidence */}
          {currentStep === 1 && (
            <div className="step-panel">
              <EvidenceUploader 
                photos={photos} 
                onChange={handlePhotosChange} 
                error={errors.photos} 
              />
            </div>
          )}

          {/* STEP 2: Problem Details */}
          {currentStep === 2 && (
            <div className="step-panel details-step-panel">
              <div className="details-header">
                <h2 className="step-title">Tell Us About the Issue</h2>
                <p className="step-subtitle">
                  Provide citizen context on waste type and severity to aid municipal categorization.
                </p>
              </div>

              <WasteTypeSelector 
                selectedType={wasteType} 
                onSelect={(type) => setWasteType(type)} 
              />

              <SeveritySelector 
                selectedSeverity={severity} 
                onSelect={(sev) => setSeverity(sev)} 
              />

              {/* Description Input */}
              <div className="description-input-group">
                <div className="desc-header-row">
                  <label htmlFor="waste-desc" className="section-field-label">
                    Additional Observations (Optional)
                  </label>
                  <span className="desc-char-count">{description.length} / 500</span>
                </div>
                <textarea
                  id="waste-desc"
                  className="civic-textarea"
                  placeholder="Describe landmarks, overflow spread, hazards, or specific accessibility notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  rows={4}
                />
              </div>

              {/* Hazard & Context Indicator Chips */}
              <div className="indicators-selection-group">
                <label className="section-field-label">Quick Hazard Indicators</label>
                <div className="indicator-chips-grid">
                  {INDICATOR_OPTIONS.map((option) => {
                    const isSelected = indicators.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`indicator-chip-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleIndicatorToggle(option)}
                      >
                        <span className="chip-indicator-icon">{isSelected ? '✓' : '+'}</span>
                        <span className="chip-label">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="step-panel">
              <LocationPicker 
                location={location} 
                onChange={handleLocationChange} 
                error={errors.location} 
              />
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="step-panel">
              <ReportSummary 
                reportData={{
                  photos,
                  wasteType,
                  severity,
                  description,
                  indicators,
                  location
                }}
                isConfirmed={isConfirmed}
                onToggleConfirm={setIsConfirmed}
              />
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="flow-footer-nav">
            <div className="footer-nav-left">
              {currentStep > 1 && (
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>
              )}
              <Link to="/" className="btn-outline-cancel">
                Cancel
              </Link>
            </div>

            <div className="footer-nav-right">
              {currentStep < 4 ? (
                <button type="button" className="btn-primary" onClick={handleNextStep}>
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  type="button" 
                  className={`btn-primary btn-submit-final ${!isConfirmed ? 'btn-disabled' : ''}`}
                  disabled={!isConfirmed}
                  onClick={handleSubmit}
                >
                  <CheckCircle2 size={18} />
                  <span>Submit Citizen Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}