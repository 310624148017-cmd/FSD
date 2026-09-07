export const StatusBadge = ({ status }) => {
  return <span className={`badge badge-${status}`}>{status}</span>;
};

export const HealthBadge = ({ health }) => {
  return <span className={`badge badge-${health}`}>{health}</span>;
};

export const ImpactBadge = ({ impact }) => {
  const colors = {
    positive: 'badge-active',
    neutral: 'badge-open',
    negative: 'badge-declined',
  };
  return <span className={`badge ${colors[impact] || 'badge-open'}`}>{impact}</span>;
};
