/**
 * Formats a date string or Date object into a readable date format
 * @param {string|Date} dateInput - The date to format
 * @param {string} [format='default'] - The format to use ('default', 'short', 'iso', 'time')
 * @returns {string} The formatted date string
 */
export const formatDate = (dateInput, format = 'default') => {
  if (!dateInput) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'time':
        return date.toLocaleTimeString();
      case 'datetime':
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      case 'default':
      default: {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
}; 