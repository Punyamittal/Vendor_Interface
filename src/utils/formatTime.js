import { formatDistanceToNow, format } from 'date-fns';

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatTime = (date) => {
  return format(new Date(date), 'hh:mm a');
};

export const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy');
};
