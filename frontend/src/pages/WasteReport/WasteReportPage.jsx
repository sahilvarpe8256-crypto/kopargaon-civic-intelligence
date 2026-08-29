import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

import ReportProgress from '../../components/report/ReportProgress';
import EvidenceUploader from '../../components/report/EvidenceUploader';
import WasteTypeSelector from '../../components/report/WasteTypeSelector';
import SeveritySelector from '../../components/report/SeveritySelector';
import LocationPicker from '../../components/report/LocationPicker';
import AiAssessmentCard from '../../components/report/AiAssessmentCard';
import DuplicateReportCard from '../../components/report/DuplicateReportCard';
import ReportSummary from '../../components/report/ReportSummary';
import ReportSuccess from '../../components/report/ReportSuccess';

import { simulateAiAssessment, generateReportId } from '../../services/mockAiService';
import { submitReport } from '../../services/api';
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
  const [isAiProcessing, setIsAiProcessing] = useState(false);
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
    zone: 'Z01',
    isGps: false
  });
  const [aiAssessment, setAiAssessment] = useState(null);
  const [linkedDuplicates, setLinkedDuplicates] = useState([]);

  // Errors
  const [errors, setErrors] = useState({});

  const handlePhotosChange = (updatedPhotos, errorMsg) => {
    setPhotos(updatedPhotos);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, photos: errorMsg }));
    } else if (updatedPhotos.length > 0) {
      setErrors((prev) => ({ ...prev, photos: null }));
    }
  };

  const handleIndicatorToggle = (ind) => {
    setIndicators((prev) => 
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const handleToggleDuplicateLink = (reportId) => {
    setLinkedDuplicates((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  // Step Navigations & Validations
  const handleNextStep = async () => {
    // Step 1 Validation
    if (currentStep === 1) {
      if (!photos || photos.length === 0) {
        setErrors((prev) => ({ ...prev, photos: 'Please upload at least 1 photo evidence before proceeding.' }));
        return;
      }
      setErrors((prev) => ({ ...prev, photos: null }));
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
      if (!severity) {
        setErrors((prev) => ({ ...prev, severity: 'Please select a severity level.' }));
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
      
      // Transition to Step 4 and trigger simulated AI assessment
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setIsAiProcessing(true);
      const result = await simulateAiAssessment({
        wasteType,
        severity,
        description,
        indicators,
        photos,
        location
      });
      setAiAssessment(result);
      setIsAiProcessing(false);
      return;
    }

    // Step 4 to Step 5
    if (currentStep === 4) {
      setCurrentStep(5);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      alert('Please check the confirmation box before submitting.');
      return;
    }

    const reportId = generateReportId();
    const finalReport = {
      reportId,
      category: 'Waste',
      wasteType,
      severity,
      description,
      indicators,
      location,
      photos: photos.map((p) => ({ name: p.name, size: p.size, preview: p.preview })),
      aiAssessment,
      linkedDuplicates,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    };

    try {
      const res = await submitReport(finalReport);
      const resultingReport = res.report || { ...finalReport, reportId: res.report_id || reportId };
      setCreatedReport(resultingReport);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(`Submission note: ${err.message}. Your report has been recorded.`);
      setCreatedReport(finalReport);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setPhotos([]);
    setWasteType('Overflowing Garbage');
    setSeverity('Medium');
    setDescription('');
    setIndicators([]);
    setAiAssessment(null);
    setLinkedDuplicates([]);
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
                  Provide citizen context on waste type and severity to aid automated evidence categorization.
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
                  <span className={`char-counter ${description.length >= 480 ? 'limit-near' : ''}`}>
                    {description.length} / 500
                  </span>
                </div>
                <textarea
                  id="waste-desc"
                  className="civic-textarea"
                  placeholder="Describe what you observed (e.g., location specifics, nearby landmarks, how long it has been accumulating)..."
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Quick Indicators */}
              <div className="indicators-group">
                <label className="section-field-label">Quick Risk Indicators</label>
                <p className="indicators-hint">Check any conditions that apply (directly informs the priority scoring engine):</p>
                <div className="indicator-checkboxes-grid">
                  {INDICATOR_OPTIONS.map((ind, i) => {
                    const isChecked = indicators.includes(ind);
                    return (
                      <label key={i} className={`indicator-checkbox-card ${isChecked ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleIndicatorToggle(ind)}
                        />
                        <span className="indicator-label-text">{ind}</span>
                      </label>
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
                onChange={(loc) => setLocation(loc)} 
                error={errors.location} 
              />
            </div>
          )}

          {/* STEP 4: AI Assessment */}
          {currentStep === 4 && (
            <div className="step-panel ai-step-panel">
              <div className="ai-step-header">
                <h2 className="step-title">AI Evidence Assessment</h2>
                <p className="step-subtitle">
                  Automated visual inspection, civic weighting calculation, and duplicate report matching.
                </p>
              </div>

              <AiAssessmentCard 
                aiAssessment={aiAssessment} 
                isProcessing={isAiProcessing} 
              />

              {!isAiProcessing && aiAssessment && (
                <DuplicateReportCard
                  duplicates={aiAssessment.nearbyDuplicates}
                  linkedReports={linkedDuplicates}
                  onToggleLink={handleToggleDuplicateLink}
                />
              )}
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="step-panel">
              <ReportSummary
                reportData={{
                  photos,
                  wasteType,
                  severity,
                  description,
                  indicators,
                  location,
                  aiAssessment,
                  linkedDuplicates
                }}
                isConfirmed={isConfirmed}
                onToggleConfirm={setIsConfirmed}
              />
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="flow-footer-actions">
            {currentStep > 1 ? (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handlePrevStep}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <Link to="/" className="btn-secondary">
                Cancel
              </Link>
            )}

            {currentStep < 5 ? (
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleNextStep}
                disabled={isAiProcessing}
              >
                <span>
                  {currentStep === 1 && 'Continue to Details'}
                  {currentStep === 2 && 'Continue to Location'}
                  {currentStep === 3 && 'Confirm Location & Run AI'}
                  {currentStep === 4 && 'Proceed to Review'}
                </span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary btn-submit-report"
                onClick={handleSubmit}
                disabled={!isConfirmed}
              >
                <CheckCircle2 size={18} />
                <span>Submit Civic Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}