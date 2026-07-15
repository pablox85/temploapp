export default function DashboardLoading() {
  return <div className="mx-auto max-w-7xl animate-pulse"><div className="h-4 w-28 rounded bg-slate-200" /><div className="mt-3 h-9 w-72 rounded bg-slate-200" /><div className="mt-10 grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 rounded-2xl bg-slate-200/70" />)}</div><div className="mt-8 h-80 rounded-2xl bg-slate-200/70" /></div>;
}
