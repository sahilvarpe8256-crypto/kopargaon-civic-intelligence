import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
  decision_id: {
    type: String,
    required: true,
    unique: true
  },
  officer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  officer_name: {
    type: String,
    default: 'Municipal Officer'
  },
  decision_type: {
    type: String,
    enum: ['APPROVED', 'OVERRIDDEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'MERGED'],
    default: 'APPROVED'
  },
  report_id: {
    type: String,
    required: false
  },
  selected_reports: [{
    type: String
  }],
  deferred_reports: [{
    report_id: String,
    reason: String
  }],
  override_reason: {
    type: String,
    default: null
  },
  assigned_team: {
    type: String,
    default: null
  },
  decided_at: {
    type: Date,
    default: Date.now
  }
});

const Decision = mongoose.model('Decision', decisionSchema);
export default Decision;
