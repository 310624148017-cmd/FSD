import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  CheckCheck, 
  ShieldAlert, 
  Activity,
  Sparkles
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'open':
        return <Clock size={12} />;
      case 'accepted':
        return <CheckCircle2 size={12} />;
      case 'active':
        return <Activity size={12} />;
      case 'completed':
        return <CheckCheck size={12} />;
      case 'declined':
      case 'cancelled':
        return <XCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      default:
        return <Sparkles size={12} />;
    }
  };

  return (
    <span className={`badge badge-${status}`}>
      {getIcon()}
      {status}
    </span>
  );
};

export const HealthBadge = ({ health }) => {
  const getDotColor = () => {
    switch (health) {
      case 'excellent':
        return '#34d399';
      case 'good':
        return '#a3e635';
      case 'fair':
        return '#fbbf24';
      case 'poor':
        return '#fb923c';
      case 'critical':
        return '#fb7185';
      default:
        return '#94a3b8';
    }
  };

  return (
    <span className={`badge badge-${health}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: getDotColor(),
          display: 'inline-block',
        }}
      />
      {health}
    </span>
  );
};

export const ImpactBadge = ({ impact }) => {
  const colors = {
    positive: 'badge-active',
    neutral: 'badge-open',
    negative: 'badge-declined',
  };

  return (
    <span className={`badge ${colors[impact] || 'badge-open'}`}>
      {impact === 'positive' && '↗ '}
      {impact === 'negative' && '↘ '}
      {impact === 'neutral' && '→ '}
      {impact}
    </span>
  );
};
