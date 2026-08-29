import React from 'react';
import { Users, Truck, Clock, IndianRupee, Activity } from 'lucide-react';

export default function ResourceCards({ resourceState }) {
  if (!resourceState) return null;

  const { crews, vehicles = [], workingHoursRemainingToday, dailyBudgetINR } = resourceState;

  const totalVehiclesAvailable = vehicles.reduce((sum, v) => sum + (v.available || 0), 0);
  const totalVehicles = vehicles.reduce((sum, v) => sum + (v.total || 0), 0);

  return (
    <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
      {/* Sanitation Crews */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>Sanitation Crews</span>
          <div style={{ background: 'var(--primary-50)', padding: '0.4rem', borderRadius: '8px', color: 'var(--primary-600)' }}>
            <Users size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {crews?.available ?? 0}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
            / {crews?.total ?? 0} Available
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
          {crews?.dispatched ?? 0} crews currently dispatched
        </div>
      </div>

      {/* Fleet Vehicles */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>Vehicles & Trucks</span>
          <div style={{ background: 'var(--accent-50)', padding: '0.4rem', borderRadius: '8px', color: 'var(--accent-600)' }}>
            <Truck size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {totalVehiclesAvailable}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
            / {totalVehicles} Fleet Units
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
          {vehicles.map(v => `${v.type.replace('_', ' ')}: ${v.available}`).join(' • ')}
        </div>
      </div>

      {/* Shift Time Remaining */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>Shift Window</span>
          <div style={{ background: 'var(--info-50)', padding: '0.4rem', borderRadius: '8px', color: 'var(--info-500)' }}>
            <Clock size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {workingHoursRemainingToday ?? 0}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>Hours Today</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
          Municipal Standard Day Shift (8.0h)
        </div>
      </div>

      {/* Operational Budget */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>Daily Budget</span>
          <div style={{ background: 'var(--warning-50)', padding: '0.4rem', borderRadius: '8px', color: 'var(--warning-600)' }}>
            <IndianRupee size={20} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            ₹{dailyBudgetINR?.remaining?.toLocaleString() ?? 0}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            / ₹{dailyBudgetINR?.allocated?.toLocaleString() ?? 0}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
          Spent Today: ₹{dailyBudgetINR?.spent?.toLocaleString() ?? 0}
        </div>
      </div>
    </div>
  );
}