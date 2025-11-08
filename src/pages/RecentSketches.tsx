import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, PenTool, RefreshCcw, Search, Shield, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useSketches } from '../lib/sketchService';
import { SketchPriority, SketchStatus } from '../types/sketch';

const statusOptions: Array<{ value: SketchStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions: Array<{ value: SketchPriority | 'all'; label: string }> = [
  { value: 'all', label: 'All priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const priorityBadgeClasses: Record<SketchPriority, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-emerald-100 text-emerald-700',
};

const statusBadgeClasses: Record<SketchStatus, string> = {
  'in-progress': 'bg-blue-100 text-blue-700',
  draft: 'bg-slate-200 text-slate-700',
  review: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const RecentSketches: React.FC = () => {
  const navigate = useNavigate();
  const { sketches, loading, error, refresh } = useSketches({
    autoRefresh: true,
    refreshIntervalMs: 30_000,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SketchStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<SketchPriority | 'all'>('all');

  const stats = useMemo(() => {
    const total = sketches.length;
    const completed = sketches.filter((sketch) => sketch.status === 'completed').length;
    const inProgress = sketches.filter((sketch) => sketch.status === 'in-progress' || sketch.status === 'draft').length;
    const highPriority = sketches.filter((sketch) => sketch.priority === 'urgent' || sketch.priority === 'high').length;
    const officers = new Set(sketches.map((sketch) => sketch.officer).filter(Boolean)).size;

    return [
      {
        label: 'Total sketches',
        value: total,
        accent: 'from-blue-500/15 to-blue-500/5 text-blue-700 border-blue-200/60',
        badge: `${completed} completed`,
      },
      {
        label: 'Active cases',
        value: inProgress,
        accent: 'from-indigo-500/15 to-indigo-500/5 text-indigo-700 border-indigo-200/60',
        badge: `${highPriority} high priority`,
      },
      {
        label: 'High priority',
        value: highPriority,
        accent: 'from-amber-500/15 to-amber-500/5 text-amber-700 border-amber-200/60',
        badge: `${total ? Math.round((highPriority / total) * 100) : 0}% of total`,
      },
      {
        label: 'Assigned officers',
        value: officers,
        accent: 'from-emerald-500/15 to-emerald-500/5 text-emerald-700 border-emerald-200/60',
        badge: `${total - completed} in progress`,
      },
    ];
  }, [sketches]);

  const filteredSketches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return sketches.filter((sketch) => {
      const matchesSearch =
        !normalizedSearch ||
        [sketch.name, sketch.suspect, sketch.officer, sketch.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesStatus =
        statusFilter === 'all' ||
        (sketch.status?.toLowerCase() as SketchStatus | undefined) === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' ||
        (sketch.priority?.toLowerCase() as SketchPriority | undefined) === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, sketches, searchTerm, statusFilter]);

  const isRefreshing = loading && sketches.length > 0;

  const handleCreateNew = () => {
    navigate('/sketch?mode=new');
  };

  const handleResume = (id: string) => {
    navigate(`/sketch?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-6 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                  Recent Sketches
                </h1>
                <Badge variant="secondary" className="w-fit bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                  Auto sync every 30s
                </Badge>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Access saved forensic sketches instantly, resume unfinished work from any device,
                and keep global collaboration smooth with real-time syncing.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              onClick={() => refresh()}
              variant="outline"
              className="flex items-center justify-center gap-2 border-amber-200 text-amber-700 hover:text-amber-800 hover:bg-amber-100/70"
              disabled={loading && sketches.length === 0}
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              <span className="text-sm font-medium">Refresh</span>
            </Button>
            <Button
              onClick={handleCreateNew}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              New Sketch
            </Button>
          </div>
        </header>

        <section className="bg-white/85 backdrop-blur-sm border border-amber-200/60 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            <div className="lg:col-span-2 xl:col-span-2">
              <label className="sr-only" htmlFor="sketch-search">
                Search sketches
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sketch-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by sketch name, suspect, officer or description…"
                  className="pl-9 h-11 text-sm border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-1">
              <div>
                <label className="sr-only" htmlFor="status-filter">
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as SketchStatus | 'all')
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  aria-label="Filter sketches by status"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="sr-only" htmlFor="priority-filter">
                  Filter by priority
                </label>
                <select
                  id="priority-filter"
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value as SketchPriority | 'all')
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  aria-label="Filter sketches by priority"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className={`bg-gradient-to-br ${stat.accent} shadow-sm border p-4 sm:p-5 rounded-2xl flex flex-col gap-2 transition-transform duration-200 hover:translate-y-[-2px]`}
              >
                <span className="text-xs uppercase tracking-wide font-semibold">
                  {stat.label}
                </span>
                <span className="text-2xl font-bold">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {stat.badge}
                </span>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-4 sm:p-5">
              <p className="font-semibold">Unable to load sketches</p>
              <p className="text-sm mt-1 text-red-600">
                {error.message || 'Please check your connection and try again.'}
              </p>
              <Button
                onClick={() => refresh()}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
              >
                Try again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={`sketch-skeleton-${index}`}
                  className="border-amber-100/70 bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-5 space-y-4"
                >
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-2/3 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-full" />
                    <Skeleton className="h-4 w-1/3 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-9 flex-1 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredSketches.length === 0 ? (
            <div className="bg-white/85 backdrop-blur-sm border border-amber-200/60 rounded-3xl p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <PenTool className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">No sketches found</h2>
              <p className="text-sm text-slate-600 mt-2">
                {sketches.length === 0
                  ? 'Create your first forensic sketch to get started.'
                  : 'Try a different search or adjust your filters.'}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start a new sketch
                </Button>
                {sketches.length > 0 && (
                  <Button onClick={() => refresh()} variant="outline" className="border-amber-200 text-amber-700">
                    Reset filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSketches.map((sketch) => (
                <Card
                  key={sketch._id}
                  className="group relative border-amber-200/60 bg-white/85 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    {sketch.cloudinary_url ? (
                      <img
                        src={sketch.cloudinary_url}
                        alt={sketch.name}
                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <PenTool className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                      {sketch.status && (
                        <Badge
                          variant="secondary"
                          className={`text-xs font-semibold rounded-full px-3 py-1 ${statusBadgeClasses[sketch.status] || ''}`}
                        >
                          {sketch.status}
                        </Badge>
                      )}
                      {sketch.priority && (
                        <Badge
                          variant="secondary"
                          className={`text-xs font-semibold rounded-full px-3 py-1 ${priorityBadgeClasses[sketch.priority] || ''}`}
                        >
                          {sketch.priority} priority
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{sketch.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        {sketch.suspect && (
                          <p>
                            <span className="text-slate-500">Suspect:</span>{' '}
                            <span className="font-medium text-slate-700">{sketch.suspect}</span>
                          </p>
                        )}
                        {sketch.officer && (
                          <p>
                            <span className="text-slate-500">Officer:</span>{' '}
                            <span className="font-medium text-slate-700">{sketch.officer}</span>
                          </p>
                        )}
                      </div>
                      {sketch.description && (
                        <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                          {sketch.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {sketch.updated_at
                          ? new Date(sketch.updated_at).toLocaleString()
                          : sketch.date
                          ? new Date(sketch.date).toLocaleDateString()
                          : 'No timestamp'}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        #{sketch._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleResume(sketch._id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        Resume sketch
                      </Button>
                      <Button
                        onClick={handleCreateNew}
                        variant="outline"
                        className="flex-1 border-amber-200 text-amber-700 hover:text-amber-800 hover:bg-amber-100/70"
                      >
                        New sketch
                      </Button>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-amber-100 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none" />
                </Card>
              ))}
            </div>
          )}
        </section>

        {loading && (
          <div className="fixed bottom-6 right-6 sm:right-8 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur shadow-lg border border-amber-200 px-3 py-1.5 text-sm text-amber-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing latest sketches…
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSketches;


