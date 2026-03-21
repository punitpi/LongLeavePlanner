export interface LeaveDay {
  date: Date
  dateString: string  // ISO format YYYY-MM-DD
  needToApply: boolean
}

export interface LeaveCluster {
  id: string
  days: LeaveDay[]
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
  totalDays: number
  leaveDaysRequired: number
  emoji: string
}

export interface CalculateResponse {
  clusters: LeaveCluster[]
  summary: SummaryStats
}

export interface SummaryStats {
  totalDaysOff: number
  leaveDaysUsed: number
  efficiencyPercent: number | null  // null when leaveDaysUsed === 0
  clustersFound: number
}

export interface Holiday {
  date: string       // DD-MM-YYYY
  localName: string
  name: string
  countryCode: string
}

export interface Country {
  countryCode: string
  name: string
}

export interface PreviewItem {
  date: string       // DD-MM-YYYY
  label?: string     // from API holiday name, optional for manual/csv entries
}
