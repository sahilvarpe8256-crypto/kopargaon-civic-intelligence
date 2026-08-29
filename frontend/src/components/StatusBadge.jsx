import React from 'react';
import { STATUS_LABELS } from '../utils/constants';

export default function StatusBadge({ status }) {
  const meta = STATUS_LABELS[status] || { label: status || 'UNKNOWN', badgeClass: 'badge-status-pending' };

  return (
    <span className={`badge ${meta.badgeClass}`}>
      {meta.label}
    </span>
  );
}