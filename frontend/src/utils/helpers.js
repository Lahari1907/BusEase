/**
 * Format currency amount in INR
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Format date string for display (e.g. 2026-09-15 -> 15 Sep 2026)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Get seat status color classes for Tailwind
 */
export const getSeatStatusStyle = (status) => {
  switch (status) {
    case 'BOOKED':
      return 'bg-red-500 text-white cursor-not-allowed opacity-80';
    case 'LOCKED':
      return 'bg-amber-400 text-slate-900 cursor-not-allowed font-medium animate-pulse';
    case 'SELECTED':
      return 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-md scale-105';
    case 'AVAILABLE':
    default:
      return 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer hover:shadow-md transition-all duration-150';
  }
};
