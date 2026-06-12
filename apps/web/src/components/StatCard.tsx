export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      {icon && <span className="text-3xl">{icon}</span>}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-extrabold text-brand">{value}</p>
      </div>
    </div>
  )
}
