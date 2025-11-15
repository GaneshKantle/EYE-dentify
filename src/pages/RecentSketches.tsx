import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, PenTool, RefreshCcw, Search, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-5 lg:py-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="mt-0.5 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg flex-shrink-0">
              <img src="/favicon.png" alt="EYE'dentify" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-slate-900">
                  Recent Sketches
                </h1>
                <Badge variant="secondary" className="w-fit bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs px-1.5 py-0.5">
                  Auto sync
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-snug mt-1">
                Access saved sketches and resume work from any device.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-shrink-0">
            <Button
              onClick={() => refresh()}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1.5 sm:gap-2 border-amber-200 text-amber-700 hover:text-amber-800 hover:bg-amber-100/70 text-xs sm:text-sm"
              disabled={loading && sketches.length === 0}
            >
              {isRefreshing ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              <span className="font-medium">Refresh</span>
            </Button>
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-xs sm:text-sm"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              New Sketch
            </Button>
          </div>
        </header>

        <section className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200/60 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="sr-only" htmlFor="sketch-search">
                Search sketches
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="sketch-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search sketches..."
                  className="pl-8 h-9 sm:h-10 text-xs sm:text-sm border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as SketchStatus | 'all')
                }
                className="w-full h-9 sm:h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs sm:text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
                aria-label="Filter by status"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as SketchPriority | 'all')
                }
                className="w-full h-9 sm:h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs sm:text-sm text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
                aria-label="Filter by priority"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className={`bg-gradient-to-br ${stat.accent} p-3 sm:p-4 rounded-lg flex flex-col gap-1 transition-all duration-200 hover:shadow-md border border-slate-200/50`}
              >
                <span className="text-[10px] sm:text-xs font-medium text-slate-600">
                  {stat.label}
                </span>
                <span className="text-xl sm:text-2xl font-bold">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500">
                  {stat.badge}
                </span>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3 sm:space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 shadow-[0_2px_8px_rgba(239,68,68,0.15),0_0_0_1px_rgba(239,68,68,0.2)]">
              <p className="font-semibold text-sm sm:text-base">Unable to load sketches</p>
              <p className="text-xs sm:text-sm mt-1 text-red-600">
                {error.message || 'Please check your connection and try again.'}
              </p>
              <Button
                onClick={() => refresh()}
                size="sm"
                className="mt-2 sm:mt-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
              >
                Try again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={`sketch-skeleton-${index}`} className="border border-slate-200 bg-white rounded-lg p-3 space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-8 w-full rounded" />
                </Card>
              ))}
            </div>
          ) : filteredSketches.length === 0 ? (
            <div className="bg-white rounded-lg p-6 sm:p-8 text-center border border-slate-200/60">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <PenTool className="h-6 w-6" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">No sketches found</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                {sketches.length === 0
                  ? 'Create your first forensic sketch to get started.'
                  : 'Try a different search or adjust your filters.'}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button onClick={handleCreateNew} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm">
                  New Sketch
                </Button>
                {sketches.length > 0 && (
                  <Button onClick={() => refresh()} size="sm" variant="outline" className="border-slate-200 text-slate-700 text-xs sm:text-sm">
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredSketches.map((sketch) => (
                <Card
                  key={sketch._id}
                  className="group bg-white rounded-lg overflow-hidden border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative">
                    {sketch.cloudinary_url ? (
                      <img
                        src={sketch.cloudinary_url}
                        alt={sketch.name}
                        className="w-full h-32 sm:h-36 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-32 sm:h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <PenTool className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                      {sketch.status && (
                        <Badge variant="secondary" className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${statusBadgeClasses[sketch.status] || ''}`}>
                          {sketch.status}
                        </Badge>
                      )}
                      {sketch.priority && (
                        <Badge variant="secondary" className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${priorityBadgeClasses[sketch.priority] || ''}`}>
                          {sketch.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{sketch.name}</h3>
                    <div className="space-y-1 text-xs text-slate-600">
                      {sketch.suspect && (
                        <p className="truncate">
                          <span className="text-slate-500">Suspect:</span> <span className="font-medium">{sketch.suspect}</span>
                        </p>
                      )}
                      {sketch.officer && (
                        <p className="truncate">
                          <span className="text-slate-500">Officer:</span> <span className="font-medium">{sketch.officer}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 truncate flex-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {sketch.updated_at ? new Date(sketch.updated_at).toLocaleDateString() : sketch.date ? new Date(sketch.date).toLocaleDateString() : 'No date'}
                        </span>
                      </span>
                    </div>
                    <Button
                      onClick={() => handleResume(sketch._id)}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                    >
                      Resume
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {loading && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-700 shadow-lg border border-slate-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Syncing...</span>
            <span className="sm:hidden">Sync</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSketches;


