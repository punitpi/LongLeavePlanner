interface SummaryCardProps {
  totalDaysOff: number
  leaveDaysUsed: number
  efficiencyPercent: number | null
  clustersFound: number
}

export function SummaryCard({ totalDaysOff, leaveDaysUsed, efficiencyPercent, clustersFound }: SummaryCardProps) {
  const progressPercent = leaveDaysUsed > 0
    ? Math.min(100, Math.round((leaveDaysUsed / totalDaysOff) * 100))
    : 0

  return (
    <div className="bg-inverse-surface text-inverse-on-surface p-6 rounded-lg mt-6">
      <p className="font-label text-[10px] uppercase font-bold tracking-[0.2em] mb-4 opacity-70 text-secondary-container">
        Summary of Gains
      </p>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-4xl font-headline font-extrabold">{totalDaysOff}</span>
          <span className="text-xs font-label uppercase font-medium opacity-70 pb-1">Total Days Off</span>
        </div>

        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-bold">
          <span>Using {leaveDaysUsed} Leave Day{leaveDaysUsed !== 1 ? 's' : ''}</span>
          <span className="text-tertiary-fixed">
            {efficiencyPercent === null ? 'Pure Efficiency' : `${efficiencyPercent}% Efficiency`}
          </span>
        </div>

        <div className="pt-3 border-t border-white/10">
          <p className="text-xs opacity-60 font-body">
            {clustersFound} opportunity cluster{clustersFound !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>
    </div>
  )
}
