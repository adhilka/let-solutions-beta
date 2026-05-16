export function getAdmissionYearText(settings: any): string {
  const admissions = settings?.admissions || { mode: 'auto' };
  
  if (admissions.mode === 'manual' && admissions.manualText) {
    return admissions.manualText;
  }
  
  // Auto Mode
  // Academic year usually starts around June/July in India
  // If current month is >= June (5 index), it's the current year to next year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let startYear, endYear;
  if (currentMonth >= 5) { // June or later
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    startYear = currentYear - 1;
    endYear = currentYear;
  }
  
  return `Admission Open ${startYear}–${endYear.toString().slice(-2)}`;
}
