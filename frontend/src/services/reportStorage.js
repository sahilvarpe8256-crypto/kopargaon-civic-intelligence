/**
 * reportStorage.js
 * Local storage manager for Kopargaon Civic Waste Intelligence reports, prioritization, and duplicate cluster intelligence.
 */
import { INITIAL_MOCK_REPORTS } from '../utils/mockReports';

const STORAGE_KEY = 'kopargaon_civic_reports_v2';
const CLUSTER_DECISIONS_KEY = 'kopargaon_civic_cluster_decisions_v2';

export function getReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REPORTS));
      return INITIAL_MOCK_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MOCK_REPORTS;
  } catch {
    return INITIAL_MOCK_REPORTS;
  }
}

export function getReport(reportId) {
  if (!reportId) return null;
  const reports = getReports();
  const cleanId = String(reportId).trim().toUpperCase();
  
  return (
    reports.find((r) => {
      const rId = String(r.id || r.reportId || '').toUpperCase();
      const alias = String(r.aliasId || '').toUpperCase();
      const numericPart = cleanId.replace(/\D/g, '');
      const rNumericPart = rId.replace(/\D/g, '');

      return (
        rId === cleanId ||
        alias === cleanId ||
        (numericPart && rNumericPart && numericPart === rNumericPart) ||
        (r.supportingReportIds && r.supportingReportIds.some((sid) => sid.toUpperCase() === cleanId))
      );
    }) || null
  );
}

export function saveReport(report) {
  try {
    const reports = getReports();
    const updated = [report, ...reports.filter((r) => r.reportId !== report.reportId && r.id !== report.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save report to localStorage:', err);
    return false;
  }
}

export function updateReportStatus(reportId, newStatus, decisionNote = '') {
  try {
    const reports = getReports();
    const cleanId = String(reportId).trim().toUpperCase();
    const numericPart = cleanId.replace(/\D/g, '');

    const updated = reports.map((r) => {
      const rId = String(r.id || r.reportId || '').toUpperCase();
      const alias = String(r.aliasId || '').toUpperCase();
      const rNumericPart = rId.replace(/\D/g, '');

      if (
        rId === cleanId ||
        alias === cleanId ||
        (numericPart && rNumericPart && numericPart === rNumericPart) ||
        (r.supportingReportIds && r.supportingReportIds.some((sid) => sid.toUpperCase() === cleanId))
      ) {
        return {
          ...r,
          status: newStatus,
          decisionNote: decisionNote || r.decisionNote,
          decidedAt: new Date().toISOString()
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to update report status:', err);
    return false;
  }
}

export function assignReportTeam(reportId, teamName) {
  try {
    const reports = getReports();
    const cleanId = String(reportId).trim().toUpperCase();
    const numericPart = cleanId.replace(/\D/g, '');

    const updated = reports.map((r) => {
      const rId = String(r.id || r.reportId || '').toUpperCase();
      const alias = String(r.aliasId || '').toUpperCase();
      const rNumericPart = rId.replace(/\D/g, '');

      if (
        rId === cleanId ||
        alias === cleanId ||
        (numericPart && rNumericPart && numericPart === rNumericPart)
      ) {
        return {
          ...r,
          assignedTeam: teamName,
          status: r.status === 'PENDING' || r.status === 'UNDER_REVIEW' ? 'ASSIGNED' : r.status,
          decidedAt: new Date().toISOString()
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to assign team:', err);
    return false;
  }
}

export function updateReportPriority(reportId, newPriority) {
  try {
    const reports = getReports();
    const cleanId = String(reportId).trim().toUpperCase();
    const numericPart = cleanId.replace(/\D/g, '');

    let score = 50;
    if (newPriority.toUpperCase() === 'CRITICAL') score = 92;
    else if (newPriority.toUpperCase() === 'HIGH') score = 75;
    else if (newPriority.toUpperCase() === 'MEDIUM') score = 55;
    else if (newPriority.toUpperCase() === 'LOW') score = 35;

    const updated = reports.map((r) => {
      const rId = String(r.id || r.reportId || '').toUpperCase();
      const alias = String(r.aliasId || '').toUpperCase();
      const rNumericPart = rId.replace(/\D/g, '');

      if (
        rId === cleanId ||
        alias === cleanId ||
        (numericPart && rNumericPart && numericPart === rNumericPart)
      ) {
        return {
          ...r,
          priority: newPriority,
          priorityScore: score,
          severity: newPriority,
          aiAssessment: {
            ...r.aiAssessment,
            score,
            level: newPriority.toUpperCase()
          }
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to update priority:', err);
    return false;
  }
}

export function getClusterDecisions() {
  try {
    const raw = localStorage.getItem(CLUSTER_DECISIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveClusterDecision(clusterId, status, note = '') {
  try {
    const decisions = getClusterDecisions();
    decisions[clusterId] = {
      action: status === 'CONFIRMED' || status === 'MERGED' ? 'DUPLICATE_MERGED' : 'DUPLICATE_SEPARATE',
      status, // 'MERGED' | 'SEPARATE'
      note,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CLUSTER_DECISIONS_KEY, JSON.stringify(decisions));
    return true;
  } catch (err) {
    console.error('Failed to save cluster decision:', err);
    return false;
  }
}

export function isClusterMerged(clusterId) {
  const decisions = getClusterDecisions();
  return decisions[clusterId]?.status === 'MERGED' || decisions[clusterId]?.status === 'CONFIRMED';
}

export function resetMockData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REPORTS));
    localStorage.removeItem(CLUSTER_DECISIONS_KEY);
    return INITIAL_MOCK_REPORTS;
  } catch {
    return INITIAL_MOCK_REPORTS;
  }
}