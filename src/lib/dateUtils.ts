export function getAdmissionYearText(settings: any): string {
  const admissions = settings?.admissions || { mode: 'auto' };
  
  if (admissions.mode === 'manual' && admissions.manualText) {
    return admissions.manualText;
  }
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let startYear, endYear;
  if (currentMonth >= 4) { 
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    startYear = currentYear - 1;
    endYear = currentYear;
  }
  
  return `Admission Open ${startYear}–${endYear.toString().slice(-2)}`;
}
