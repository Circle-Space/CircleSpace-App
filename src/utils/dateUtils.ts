export const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Returns an object with planStartDate (today) and planEndDate (365 days later) in ISO format.
 */
export function getPlanDates(): { planStartDate: string; planEndDate: string } {
  const now = new Date();
  const planStartDate = now.toISOString();

  // Calculate end date (365 days later)
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 365);
  const planEndDate = endDate.toISOString();

  return { planStartDate, planEndDate };
} 