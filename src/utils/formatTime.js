import { formatDistanceToNow, format, isValid } from 'date-fns';

function toDate(value) {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isValid(d) ? d : null;
}

export const formatRelativeTime = (date) => {
  const d = toDate(date);
  if (!d) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatTime = (date) => {
  const d = toDate(date);
  if (!d) return '—';
  return format(d, 'hh:mm a');
};

export const formatDate = (date) => {
  const d = toDate(date);
  if (!d) return '—';
  return format(d, 'dd MMM yyyy');
};
