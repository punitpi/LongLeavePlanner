// Static holiday data for countries not covered by Nager.Date API
// Holidays for current year (2026) and next year (2027)

export interface StaticHoliday {
  date: string   // YYYY-MM-DD
  name: string
  localName: string
}

export interface StaticCountry {
  countryCode: string
  name: string
}

// Countries to add that Nager.Date doesn't have
export const STATIC_COUNTRIES: StaticCountry[] = [
  { countryCode: 'IN', name: 'India' },
  { countryCode: 'PK', name: 'Pakistan' },
  { countryCode: 'BD', name: 'Bangladesh' },
  { countryCode: 'LK', name: 'Sri Lanka' },
  { countryCode: 'NP', name: 'Nepal' },
  { countryCode: 'MM', name: 'Myanmar' },
  { countryCode: 'KH', name: 'Cambodia' },
  { countryCode: 'LA', name: 'Laos' },
  { countryCode: 'AE', name: 'United Arab Emirates' },
  { countryCode: 'SA', name: 'Saudi Arabia' },
  { countryCode: 'QA', name: 'Qatar' },
  { countryCode: 'KW', name: 'Kuwait' },
  { countryCode: 'BH', name: 'Bahrain' },
  { countryCode: 'OM', name: 'Oman' },
  { countryCode: 'EG', name: 'Egypt' },
  { countryCode: 'NG', name: 'Nigeria' },
  { countryCode: 'KE', name: 'Kenya' },
  { countryCode: 'GH', name: 'Ghana' },
  { countryCode: 'ET', name: 'Ethiopia' },
  { countryCode: 'TZ', name: 'Tanzania' },
]

// Static holidays by country code and year
// Note: Islamic holidays vary by year/moon sighting — these are approximate
const STATIC_HOLIDAYS: Record<string, Record<number, StaticHoliday[]>> = {
  IN: {
    2025: [
      { date: '2025-01-01', name: "New Year's Day", localName: 'नव वर्ष' },
      { date: '2025-01-14', name: 'Makar Sankranti', localName: 'मकर संक्रांति' },
      { date: '2025-01-26', name: 'Republic Day', localName: 'गणतंत्र दिवस' },
      { date: '2025-02-26', name: 'Maha Shivaratri', localName: 'महा शिवरात्रि' },
      { date: '2025-03-14', name: 'Holi', localName: 'होली' },
      { date: '2025-03-31', name: 'Id-ul-Fitr (Eid)', localName: 'ईद-उल-फ़ित्र' },
      { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti', localName: 'डॉ. अंबेडकर जयंती' },
      { date: '2025-04-18', name: 'Good Friday', localName: 'गुड फ्राइडे' },
      { date: '2025-05-01', name: 'Labour Day', localName: 'मजदूर दिवस' },
      { date: '2025-06-07', name: 'Id-ul-Adha (Bakrid)', localName: 'बकरीद' },
      { date: '2025-07-06', name: 'Muharram', localName: 'मुहर्रम' },
      { date: '2025-08-15', name: 'Independence Day', localName: 'स्वतंत्रता दिवस' },
      { date: '2025-08-16', name: "Janmashtami", localName: 'जन्माष्टमी' },
      { date: '2025-09-05', name: "Eid-e-Milad (Prophet's Birthday)", localName: 'ईद-ए-मिलाद' },
      { date: '2025-10-02', name: 'Gandhi Jayanti / Dussehra', localName: 'गांधी जयंती / दशहरा' },
      { date: '2025-10-20', name: 'Diwali (Lakshmi Puja)', localName: 'दीवाली' },
      { date: '2025-11-05', name: 'Guru Nanak Jayanti', localName: 'गुरु नानक जयंती' },
      { date: '2025-12-25', name: 'Christmas Day', localName: 'क्रिसमस' },
    ],
    2026: [
      { date: '2026-01-01', name: "New Year's Day", localName: 'नव वर्ष' },
      { date: '2026-01-14', name: 'Makar Sankranti', localName: 'मकर संक्रांति' },
      { date: '2026-01-26', name: 'Republic Day', localName: 'गणतंत्र दिवस' },
      { date: '2026-02-15', name: 'Maha Shivaratri', localName: 'महा शिवरात्रि' },
      { date: '2026-03-03', name: 'Holi', localName: 'होली' },
      { date: '2026-03-20', name: 'Id-ul-Fitr (Eid)', localName: 'ईद-उल-फ़ित्र' },
      { date: '2026-04-03', name: 'Good Friday', localName: 'गुड फ्राइडे' },
      { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', localName: 'डॉ. अंबेडकर जयंती' },
      { date: '2026-05-01', name: 'Labour Day', localName: 'मजदूर दिवस' },
      { date: '2026-05-27', name: 'Id-ul-Adha (Bakrid)', localName: 'बकरीद' },
      { date: '2026-06-16', name: 'Muharram', localName: 'मुहर्रम' },
      { date: '2026-08-15', name: 'Independence Day', localName: 'स्वतंत्रता दिवस' },
      { date: '2026-08-25', name: "Eid-e-Milad (Prophet's Birthday)", localName: 'ईद-ए-मिलाद' },
      { date: '2026-09-04', name: "Janmashtami", localName: 'जन्माष्टमी' },
      { date: '2026-10-02', name: 'Gandhi Jayanti', localName: 'गांधी जयंती' },
      { date: '2026-10-09', name: 'Dussehra', localName: 'दशहरा' },
      { date: '2026-10-28', name: 'Diwali (Lakshmi Puja)', localName: 'दीवाली' },
      { date: '2026-11-24', name: 'Guru Nanak Jayanti', localName: 'गुरु नानक जयंती' },
      { date: '2026-12-25', name: 'Christmas Day', localName: 'क्रिसमस' },
    ],
  },
  AE: {
    2025: [
      { date: '2025-01-01', name: "New Year's Day", localName: 'رأس السنة الميلادية' },
      { date: '2025-03-31', name: 'Eid Al Fitr', localName: 'عيد الفطر' },
      { date: '2025-04-01', name: 'Eid Al Fitr Holiday', localName: 'عيد الفطر' },
      { date: '2025-04-02', name: 'Eid Al Fitr Holiday', localName: 'عيد الفطر' },
      { date: '2025-06-07', name: 'Arafat Day / Eid Al Adha', localName: 'عيد الأضحى' },
      { date: '2025-06-08', name: 'Eid Al Adha Holiday', localName: 'عيد الأضحى' },
      { date: '2025-06-09', name: 'Eid Al Adha Holiday', localName: 'عيد الأضحى' },
      { date: '2025-06-27', name: 'Al Hijra (Islamic New Year)', localName: 'رأس السنة الهجرية' },
      { date: '2025-09-05', name: "Prophet's Birthday", localName: 'المولد النبوي' },
      { date: '2025-11-18', name: 'UAE National Day', localName: 'اليوم الوطني' },
      { date: '2025-12-02', name: 'UAE National Day', localName: 'اليوم الوطني' },
      { date: '2025-12-03', name: 'UAE National Day Holiday', localName: 'اليوم الوطني' },
    ],
    2026: [
      { date: '2026-01-01', name: "New Year's Day", localName: 'رأس السنة الميلادية' },
      { date: '2026-03-20', name: 'Eid Al Fitr', localName: 'عيد الفطر' },
      { date: '2026-03-21', name: 'Eid Al Fitr Holiday', localName: 'عيد الفطر' },
      { date: '2026-03-22', name: 'Eid Al Fitr Holiday', localName: 'عيد الفطر' },
      { date: '2026-05-27', name: 'Eid Al Adha', localName: 'عيد الأضحى' },
      { date: '2026-05-28', name: 'Eid Al Adha Holiday', localName: 'عيد الأضحى' },
      { date: '2026-05-29', name: 'Eid Al Adha Holiday', localName: 'عيد الأضحى' },
      { date: '2026-12-02', name: 'UAE National Day', localName: 'اليوم الوطني' },
      { date: '2026-12-03', name: 'UAE National Day Holiday', localName: 'اليوم الوطني' },
    ],
  },
  SA: {
    2025: [
      { date: '2025-02-22', name: 'Founding Day', localName: 'يوم التأسيس' },
      { date: '2025-03-31', name: 'Eid Al Fitr', localName: 'عيد الفطر' },
      { date: '2025-04-01', name: 'Eid Al Fitr Holiday', localName: 'عيد الفطر' },
      { date: '2025-04-02', name: 'Eid Al Fitr Holiday', localName: 'عيد الفطر' },
      { date: '2025-06-07', name: 'Eid Al Adha', localName: 'عيد الأضحى' },
      { date: '2025-06-08', name: 'Eid Al Adha Holiday', localName: 'عيد الأضحى' },
      { date: '2025-06-09', name: 'Eid Al Adha Holiday', localName: 'عيد الأضحى' },
      { date: '2025-09-23', name: 'Saudi National Day', localName: 'اليوم الوطني السعودي' },
    ],
    2026: [
      { date: '2026-02-22', name: 'Founding Day', localName: 'يوم التأسيس' },
      { date: '2026-03-20', name: 'Eid Al Fitr', localName: 'عيد الفطر' },
      { date: '2026-05-27', name: 'Eid Al Adha', localName: 'عيد الأضحى' },
      { date: '2026-09-23', name: 'Saudi National Day', localName: 'اليوم الوطني السعودي' },
    ],
  },
}

export function getStaticHolidays(year: number, countryCode: string): StaticHoliday[] | null {
  const upper = countryCode.toUpperCase()
  const countryData = STATIC_HOLIDAYS[upper]
  if (!countryData) return null
  return countryData[year] ?? []
}

export function isStaticCountry(countryCode: string): boolean {
  return STATIC_COUNTRIES.some(c => c.countryCode === countryCode.toUpperCase())
}
