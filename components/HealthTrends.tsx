
import React, { useState, useMemo } from 'react';
import { TimelineEntry, DailyLog } from '../types';

interface HealthTrendsProps {
  petName: string;
  dailyLogs: Record<string, DailyLog>;
  color?: 'orange' | 'emerald' | 'indigo';
}

type GraphType = 'Activity' | 'Feeding' | 'Mood';

export const HealthTrends: React.FC<HealthTrendsProps> = ({ petName, dailyLogs }) => {
  const [graphType, setGraphType] = useState<GraphType>('Activity');

  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
  }, []);

  const dataSeries = useMemo(() => {
    return dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const log = dailyLogs[dateStr] || { activityMinutes: 0, feedingCount: 0, moodRating: 3 };
      if (graphType === 'Activity') return log.activityMinutes;
      if (graphType === 'Feeding') return log.feedingCount;
      return log.moodRating;
    });
  }, [dates, dailyLogs, graphType]);

  const maxVal = graphType === 'Activity' ? 120 : (graphType === 'Mood' ? 5 : 4);
  const width = 400;
  const height = 100;
  
  const points = dataSeries.map((val, i) => {
    const x = (i / (dataSeries.length - 1)) * width;
    const y = height - (Math.min(val, maxVal) / maxVal) * height;
    return { x, y, val, date: dates[i] };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  const typeColorMap = {
    'Activity': { main: 'stroke-orange-500 fill-orange-500/10', bg: 'bg-orange-500', text: 'text-orange-600', activeBg: 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-md' },
    'Feeding': { main: 'stroke-emerald-500 fill-emerald-500/10', bg: 'bg-emerald-500', text: 'text-emerald-600', activeBg: 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-md' },
    'Mood': { main: 'stroke-indigo-500 fill-indigo-500/10', bg: 'bg-indigo-500', text: 'text-indigo-600', activeBg: 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-md' }
  };

  const currentConfig = typeColorMap[graphType];

  const graphTypes: GraphType[] = ['Activity', 'Feeding', 'Mood'];
  const activeIndex = graphTypes.indexOf(graphType);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 md:p-8 border-2 border-zinc-50 dark:border-zinc-800 shadow-sm overflow-hidden no-scrollbar transition-all duration-700 ease-in-out">
      <div className="flex flex-row justify-between items-center mb-6 gap-2">
        <div className="relative flex bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-xl border border-zinc-100 dark:border-zinc-700 min-w-[180px]">
           {/* Animated Slider Pill */}
           <div 
             className="absolute top-1 bottom-1 left-1 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-white dark:bg-zinc-900 shadow-md border border-zinc-100 dark:border-zinc-800"
             style={{ 
               width: 'calc(33.33% - 2px)', 
               transform: `translateX(${activeIndex * 100}%)` 
             }}
           />
           
           {graphTypes.map(t => (
             <button
               key={t}
               onClick={() => setGraphType(t)}
               className={`relative z-10 flex-1 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors duration-300 ${
                 graphType === t ? typeColorMap[t].text : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
               }`}
             >
               {t}
             </button>
           ))}
        </div>
        <div className="text-right">
           <p className={`text-[10px] font-black ${currentConfig.text} uppercase tracking-widest transition-colors duration-500`}>
             {dataSeries[6]}{graphType === 'Activity' ? 'm' : ''} Today
           </p>
        </div>
      </div>

      <div className="relative h-24 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`spark-grad-${graphType}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" className="transition-all duration-700" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="transition-all duration-700" />
            </linearGradient>
          </defs>
          
          <path 
            d={`${pathData} L ${width},${height} L 0,${height} Z`} 
            className={`${currentConfig.main} transition-all duration-700 ease-in-out`} 
            fill={`url(#spark-grad-${graphType})`} 
          />
          <path 
            d={pathData} 
            fill="none" 
            className={`${currentConfig.main} stroke-[4] transition-all duration-700 ease-in-out`} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {points.map((p, i) => (
            <circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r={i === 6 ? "5" : "2"} 
              className={`transition-all duration-700 ease-in-out ${
                i === 6 
                  ? `${currentConfig.bg} fill-white stroke-[3px] shadow-lg` 
                  : 'fill-zinc-200 dark:fill-zinc-700'
              }`} 
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
