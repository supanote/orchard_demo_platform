// Helper functions to generate dynamic dates and times

/**
 * Get a relative time string based on minutes ago
 */
export const getRelativeTime = (minutesAgo: number): string => {
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${Math.round(minutesAgo)} min ago`;
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hr${hoursAgo > 1 ? 's' : ''} ago`;
  
  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
};

/**
 * Get a formatted date string for a date relative to today
 * @param daysFromNow - positive for future, negative for past
 */
export const getRelativeDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Get a formatted date with day of week (e.g., "Tue, Jan 7")
 */
export const getRelativeDateWithDay = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${dayName}, ${monthDay}`;
};

/**
 * Get today's date formatted
 */
export const getTodayFormatted = (): string => {
  return new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Get a timestamp for today with a specific time
 * @param hoursAgo - hours before current time
 * @param minutesOffset - additional minutes offset
 */
export const getTimestampToday = (hoursAgo: number = 0, minutesOffset: number = 0): string => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesOffset);
  
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${month} ${day}, ${time}`;
};

/**
 * Get a timestamp for a relative day with a specific time
 * @param daysFromNow - positive for future, negative for past
 * @param time - time string like "3:30 PM"
 */
export const getDateTimeString = (daysFromNow: number, time: string): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  
  // Add ordinal suffix
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${dayName}, ${monthName} ${ordinal(day)} at ${time}`;
};

/**
 * Get full date with year for past events
 */
export const getPastDateWithTime = (daysAgo: number, time: string): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year} at ${time}`;
};

/**
 * Get fax-style date format (MM/DD/YYYY HH:MM AM)
 */
export const getFaxDateFormat = (hoursAgo: number = 0): string => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${month}/${day}/${year} ${time}`;
};

/**
 * Get EDI short date format (YYMMDD)
 */
export const getEdiShortDate = (): string => {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Get EDI long date format (YYYYMMDD)
 */
export const getEdiLongDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Get the next Monday from today
 * @param time - optional time string like "9:30 AM"
 * @returns formatted date string for next Monday
 */
export const getNextMonday = (time?: string): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days until next Monday
  // If today is Monday (1), we want next Monday (7 days)
  // If today is Sunday (0), next Monday is 1 day away
  // Otherwise, it's (8 - dayOfWeek) % 7 days, but we want the NEXT Monday not today
  let daysUntilMonday = (8 - dayOfWeek) % 7;
  if (daysUntilMonday === 0) daysUntilMonday = 7; // If today is Monday, get next Monday
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  
  const monthName = nextMonday.toLocaleDateString('en-US', { month: 'long' });
  const day = nextMonday.getDate();
  
  // Add ordinal suffix
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  if (time) {
    return `Monday, ${monthName} ${ordinal(day)} at ${time}`;
  }
  return `Mon, ${monthName.slice(0, 3)} ${day}`;
};

/**
 * Get next Monday formatted for short display (e.g., "Mon, Jan 13")
 */
export const getNextMondayShort = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  let daysUntilMonday = (8 - dayOfWeek) % 7;
  if (daysUntilMonday === 0) daysUntilMonday = 7;
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  
  return nextMonday.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Convert an appointment time (e.g., "9:30 AM", "2:00 PM") to a natural availability preference
 * @param appointmentTime - time string like "9:30 AM" or "4:30 PM"
 * @returns natural availability preference string
 */
export const getAvailabilityFromTime = (appointmentTime: string | undefined): string => {
  if (!appointmentTime) return 'Flexible';
  
  // Parse the hour from the time string
  const match = appointmentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 'Flexible';
  
  let hour = parseInt(match[1], 10);
  const period = match[3].toUpperCase();
  
  // Convert to 24-hour format for easier comparison
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  // Generate natural availability text based on time
  if (hour < 10) {
    return 'Mornings, before 10am';
  } else if (hour < 12) {
    return `Mornings, around ${appointmentTime.toLowerCase()}`;
  } else if (hour === 12) {
    return 'Midday, around noon';
  } else if (hour < 15) {
    return `Early afternoons, around ${appointmentTime.toLowerCase()}`;
  } else if (hour < 17) {
    return `Afternoons, after 3pm`;
  } else {
    return `Evenings, after 5pm`;
  }
};

/**
 * Get a short availability description for provider matching
 * @param appointmentTime - time string like "9:30 AM"
 * @returns short description like "Have slots around 9:30 AM"
 */
export const getAvailabilitySlotDescription = (appointmentTime: string | undefined, appointmentDate?: string): string => {
  if (!appointmentTime) return 'Have available slots';
  
  if (appointmentDate) {
    // Try to extract day of week from date
    const date = new Date(appointmentDate);
    if (!isNaN(date.getTime())) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `Have slots ${dayName}, ${monthDay} at ${appointmentTime}`;
    }
  }
  
  return `Have slots at ${appointmentTime}`;
};
