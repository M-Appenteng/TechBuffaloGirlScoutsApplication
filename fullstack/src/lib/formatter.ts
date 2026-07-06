// src/lib/formatters.js
// ============================================================================
// TYPE-SAFE SCHOOL RECRUITMENT EVENT FORMATTING UTILITIES
// ============================================================================

/**
 * Combines the separate street, city, and zip code columns into a standard clean address block.
 */
export const formatFullAddress = (street = '', city = '', zipCode = '') => {
  if (!street && !city && !zipCode) return 'No address provided';

  const parts = [street, city, zipCode]
    .map(str => (str ? String(str).trim() : ''))
    .filter(Boolean);
    
  return parts.join(', ');
};

/**
 * Cleans up and formats the event date and time into a highly readable block.
 */
export const formatEventSchedule = (day = '', date = '', time = '') => {
  if (!date) return 'Date TBD';
  
  let displayDate = date;
  try {
    const parsedDate = new Date(date);
    // FIX: Use .getTime() so isNaN receives a number instead of a Date object
    if (!isNaN(parsedDate.getTime())) {
      displayDate = parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (e) {
    // Fallback to original string if parsing fails
  }

  const dayBlock = day ? `${String(day).trim()}, ` : '';
  const timeBlock = time ? ` @ ${String(time).trim()}` : '';
  
  return `${dayBlock}${displayDate}${timeBlock}`;
};

/**
 * Truncates long text cells (like notes or instructions) so they don't break layouts.
 */
export const truncateNotes = (text = '', maxLength = 80) => {
  if (!text) return 'No instructions provided.';
  const strText = String(text).trim();
  if (strText.length <= maxLength) return strText;
  return strText.substring(0, maxLength).trim() + '...';
};

/**
 * Ensures the lead card count is always returned safely as a number, defaulting to 0.
 * FIX: Cast count explicitly or provide a type fallback to satisfy implicit 'any' rules.
 */
export const formatLeadCards = (count = 0) => {
  // If count is passed as a string or mixed type, extract it safely
  const parsed = parseInt(String(count), 10);
  return isNaN(parsed) ? 0 : parsed;
};