import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend
} from 'recharts';
import { downloadSVG, downloadPNG, downloadCSV } from '../utils';

// Hardcoded Categories
const APP_CATEGORIES = {
  educational: ['Jguruji', 'Smart Board', 'Office', 'Browser', 'Acrobat', 'pdf', 'arduino', 'audacity', 'photoshop', 'msteam', 'zoom', 'bluefish editor', 'Adobe', 'Note', 'notepad'],
  nonEducational: ['YouTube', 'WhatsApp', 'ChatGPT', 'Games', 'BlueStacks', 'filmora'],
  system: ['UpTime', 'anydesk', 'winrar', 'zip', 'Avro Keyboard', 'eyeris']
};

const COLORS = {
  educational: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
  nonEducational: ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
  system: ['#475569', '#64748b', '#94a3b8', '#cbd5e1']
};

const formatHours = (h) => {
  if (h === undefined || h === null) return '0h 0m';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
};

const getCategory = (appName) => {
  if (!appName) return 'system';
  const name = appName.toLowerCase();
  
  if (APP_CATEGORIES.educational.some(app => name.includes(app.toLowerCase()))) return 'educational';
  if (APP_CATEGORIES.nonEducational.some(app => name.includes(app.toLowerCase()))) return 'nonEducational';
  return 'system';
};

const ChartToolbar = ({ chartId, csvData, filename }) => {
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    if (!showMenu) return;
    const handleOutsideClick = () => setShowMenu(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showMenu]);
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  return (
    <div className="absolute top-3 right-3 z-30 no-print" style={{ pointerEvents: 'auto' }}>
      <div className="relative inline-block text-left">
        <button onClick={handleMenuClick} type="button" className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none" title="Download Options">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        {showMenu && (
          <div className="origin-top-right absolute right-0 mt-1.5 w-36 rounded-lg shadow-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans">
            <button onClick={() => { const el = document.getElementById(chartId); const svgEl = el?.tagName?.toLowerCase() === 'svg' ? el : el?.querySelector('svg'); if (svgEl) downloadSVG(svgEl, `${filename}.svg`); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Download SVG</button>
            <button onClick={() => { const el = document.getElementById(chartId); const svgEl = el?.tagName?.toLowerCase() === 'svg' ? el : el?.querySelector('svg'); if (svgEl) downloadPNG(svgEl, `${filename}.png`); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Download PNG</button>
            {csvData && <button onClick={() => downloadCSV(csvData, `${filename}.csv`)} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">Download CSV</button>}
          </div>
        )}
      </div>
    </div>
  );
};

const PremiumChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const title = label || payload[0]?.payload?.name || "";
  return (
    <div className="bg-[#111827] text-white p-3 rounded-xl shadow-2xl border border-[#374151] text-xs font-sans min-w-[180px] pointer-events-none select-none z-50">
      {title && <p className="font-extrabold text-[#f3f4f6] text-sm mb-2 border-b border-[#374151] pb-1.5">{title}</p>}
      <div className="space-y-1.5">
        {payload.map((p, idx) => {
          const bulletColor = p.color || p.payload?.fill || '#0d9488';
          return (
            <div key={idx} className="flex items-center justify-between gap-4 font-bold py-0.5">
              <div className="flex items-center gap-1.5 text-[#d1d5db]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                <span>{p.name || p.dataKey}:</span>
              </div>
              <span className="font-black text-white">{typeof p.value === 'number' ? formatHours(p.value) : p.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Icons
const MonitorIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SchoolIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ClockIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BookIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const GamepadIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;
const CalendarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

const EduStatApplication = ({ edustatAppData = [], schools = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalHours', direction: 'desc' });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const processedData = useMemo(() => {
    if (!edustatAppData || edustatAppData.length === 0) return null;

    let totalHours = 0;
    let eduHours = 0;
    let nonEduHours = 0;
    let sysHours = 0;
    const devices = new Set();
    const udises = new Set();
    let minDate = '9999-12-31';
    let maxDate = '0000-00-00';

    const appUsage = {};
    const dailyUsage = {};
    const districtUsage = {};
    const schoolStats = {};

    edustatAppData.forEach(record => {
      const h = parseFloat(record.hours) || 0;
      if (h <= 0) return;

      totalHours += h;
      devices.add(record.serial);
      if (record.udise) udises.add(record.udise);

      if (record.date) {
        if (record.date < minDate) minDate = record.date;
        if (record.date > maxDate) maxDate = record.date;
      }

      const cat = getCategory(record.processName);
      if (cat === 'educational') eduHours += h;
      else if (cat === 'nonEducational') nonEduHours += h;
      else sysHours += h;

      // App Usage
      const appKey = record.processName || 'Unknown';
      if (!appUsage[appKey]) appUsage[appKey] = { name: appKey, hours: 0, category: cat };
      appUsage[appKey].hours += h;

      // Daily
      if (record.date) {
        if (!dailyUsage[record.date]) dailyUsage[record.date] = { date: record.date, educational: 0, nonEducational: 0, system: 0 };
        dailyUsage[record.date][cat] += h;
      }

      // District
      if (record.district) {
        if (!districtUsage[record.district]) districtUsage[record.district] = { district: record.district, educational: 0, nonEducational: 0, total: 0 };
        districtUsage[record.district][cat] += h;
        districtUsage[record.district].total += h;
      }

      // School
      if (record.udise && record.schoolName) {
        if (!schoolStats[record.udise]) {
          schoolStats[record.udise] = {
            udise: record.udise,
            schoolName: record.schoolName,
            district: record.district || '-',
            block: record.block || '-',
            devices: new Set(),
            eduHours: 0,
            nonEduHours: 0,
            sysHours: 0,
            totalHours: 0,
            appCounts: {}
          };
        }
        schoolStats[record.udise].devices.add(record.serial);
        schoolStats[record.udise].totalHours += h;
        schoolStats[record.udise][cat === 'educational' ? 'eduHours' : cat === 'nonEducational' ? 'nonEduHours' : 'sysHours'] += h;
        
        if (!schoolStats[record.udise].appCounts[appKey]) schoolStats[record.udise].appCounts[appKey] = 0;
        schoolStats[record.udise].appCounts[appKey] += h;
      }
    });

    const appUsageList = Object.values(appUsage)
      .sort((a, b) => b.hours - a.hours)
      .map((app, i) => {
        let colorList = COLORS[app.category];
        return { ...app, fill: colorList[i % colorList.length] };
      });

    const dailyTrendList = Object.values(dailyUsage).sort((a, b) => a.date.localeCompare(b.date));
    const districtList = Object.values(districtUsage).sort((a, b) => b.total - a.total);

    const schoolTableData = Object.values(schoolStats).map(school => {
      const eduPerc = school.totalHours > 0 ? (school.eduHours / school.totalHours) * 100 : 0;
      const topApp = Object.entries(school.appCounts).sort((a, b) => b[1] - a[1])[0];
      return {
        ...school,
        deviceCount: school.devices.size,
        eduPerc,
        topAppName: topApp ? topApp[0] : '-'
      };
    });

    return {
      kpi: {
        totalHours, eduHours, nonEduHours, sysHours,
        devices: devices.size,
        schools: udises.size,
        dateRange: minDate !== '9999-12-31' ? `${minDate} to ${maxDate}` : 'N/A'
      },
      appUsageList,
      dailyTrendList,
      districtList,
      schoolTableData,
      topApps: appUsageList.slice(0, 10)
    };

  }, [edustatAppData]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredSchools = useMemo(() => {
    if (!processedData) return [];
    let items = [...processedData.schoolTableData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(s => 
        (s.schoolName && s.schoolName.toLowerCase().includes(term)) ||
        (s.udise && s.udise.toLowerCase().includes(term)) ||
        (s.district && s.district.toLowerCase().includes(term))
      );
    }

    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [processedData, searchTerm, sortConfig]);

  const paginatedSchools = useMemo(() => {
    if (rowsPerPage === 'All') return sortedAndFilteredSchools;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedAndFilteredSchools.slice(start, start + rowsPerPage);
  }, [sortedAndFilteredSchools, currentPage, rowsPerPage]);

  if (!edustatAppData || edustatAppData.length === 0 || !processedData) {
    return (
      <div className="portal-card p-10 flex flex-col items-center justify-center text-center h-[60vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">No EduStat Application Data</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Please upload the App-Summary DateWise Report from the Data Upload section to view application analytics.
        </p>
      </div>
    );
  }

  const { kpi, appUsageList, dailyTrendList, districtList, topApps } = processedData;

  const eduPerc = (kpi.eduHours / kpi.totalHours) * 100 || 0;
  const nonEduPerc = (kpi.nonEduHours / kpi.totalHours) * 100 || 0;
  const sysPerc = (kpi.sysHours / kpi.totalHours) * 100 || 0;

  const kpiCards = [
    { title: "Total Devices", value: kpi.devices, icon: <MonitorIcon />, color: "from-blue-500 to-blue-600" },
    { title: "Schools Covered", value: kpi.schools, icon: <SchoolIcon />, color: "from-purple-500 to-purple-600" },
    { title: "Total Uptime", value: formatHours(kpi.totalHours), icon: <ClockIcon />, color: "from-slate-600 to-slate-700" },
    { title: "Educational Usage", value: `${eduPerc.toFixed(1)}%`, icon: <BookIcon />, color: "from-emerald-500 to-emerald-600" },
    { title: "Non-Educational", value: `${nonEduPerc.toFixed(1)}%`, icon: <GamepadIcon />, color: "from-rose-500 to-rose-600" },
    { title: "Date Range", value: kpi.dateRange, icon: <CalendarIcon />, color: "from-teal-500 to-teal-600", textClass: "text-sm" }
  ];

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="portal-card relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
              {card.icon}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{card.title}</p>
            <p className={`font-bold text-slate-800 dark:text-white ${card.textClass || 'text-xl'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Usage Donut */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative lg:col-span-1">
          <ChartToolbar chartId="app-donut-chart" csvData={appUsageList} filename="app-usage-breakdown" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Application Breakdown</h3>
          <div className="h-[300px]" id="app-donut-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appUsageList}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="hours"
                >
                  {appUsageList.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<PremiumChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Edu vs NonEdu Comparison */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Usage Category Analysis</h3>
          <div className="flex flex-col md:flex-row h-[300px] gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Educational', value: kpi.eduHours, fill: COLORS.educational[0] },
                      { name: 'Non-Educational', value: kpi.nonEduHours, fill: COLORS.nonEducational[0] },
                      { name: 'System/Other', value: kpi.sysHours, fill: COLORS.system[0] }
                    ]}
                    cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  >
                    <Cell fill={COLORS.educational[0]} />
                    <Cell fill={COLORS.nonEducational[0]} />
                    <Cell fill={COLORS.system[0]} />
                  </Pie>
                  <Tooltip content={<PremiumChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Educational</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{eduPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${eduPerc}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{formatHours(kpi.eduHours)}</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Non-Educational</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{nonEduPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                  <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${nonEduPerc}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{formatHours(kpi.nonEduHours)}</p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">System/Other</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{sysPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                  <div className="bg-slate-400 h-3 rounded-full" style={{ width: `${sysPerc}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{formatHours(kpi.sysHours)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative">
          <ChartToolbar chartId="daily-trend-chart" csvData={dailyTrendList} filename="daily-trend" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Daily Usage Trend</h3>
          <div className="h-[300px]" id="daily-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEdu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.educational[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.educational[0]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNonEdu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.nonEducational[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.nonEducational[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 10}} tickMargin={10} stroke="#64748b" />
                <YAxis tick={{fontSize: 10}} stroke="#64748b" tickFormatter={(v) => `${v}h`} />
                <Tooltip content={<PremiumChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="educational" name="Educational" stroke={COLORS.educational[0]} fillOpacity={1} fill="url(#colorEdu)" />
                <Area type="monotone" dataKey="nonEducational" name="Non-Educational" stroke={COLORS.nonEducational[0]} fillOpacity={1} fill="url(#colorNonEdu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Apps */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative">
          <ChartToolbar chartId="top-apps-chart" csvData={topApps} filename="top-10-apps" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Top 10 Applications</h3>
          <div className="h-[300px]" id="top-apps-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topApps} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" tick={{fontSize: 10}} stroke="#64748b" tickFormatter={(v) => `${v}h`} />
                <YAxis type="category" dataKey="name" tick={{fontSize: 11, fontWeight: 'bold'}} stroke="#64748b" width={80} />
                <Tooltip content={<PremiumChartTooltip />} />
                <Bar dataKey="hours" name="Usage" radius={[0, 4, 4, 0]}>
                  {topApps.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Comparison */}
      <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative">
        <ChartToolbar chartId="district-chart" csvData={districtList} filename="district-comparison" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">District-Wise Comparison</h3>
        <div className="h-[400px]" id="district-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtList} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="district" tick={{fontSize: 11}} angle={-45} textAnchor="end" stroke="#64748b" />
              <YAxis tick={{fontSize: 10}} stroke="#64748b" tickFormatter={(v) => `${v}h`} />
              <Tooltip content={<PremiumChartTooltip />} />
              <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
              <Bar dataKey="educational" name="Educational" stackId="a" fill={COLORS.educational[0]} radius={[0, 0, 0, 0]} />
              <Bar dataKey="nonEducational" name="Non-Educational" stackId="a" fill={COLORS.nonEducational[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="portal-card bg-slate-50 dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">AI Usage Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpi.nonEduHours > kpi.eduHours && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg p-3">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">Critical Observation</p>
              <p className="text-sm text-rose-600 dark:text-rose-400">Overall non-educational usage ({formatHours(kpi.nonEduHours)}) exceeds educational usage ({formatHours(kpi.eduHours)}).</p>
            </div>
          )}
          {districtList.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Top District</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400"><strong>{districtList[0].district}</strong> leads in total usage with {formatHours(districtList[0].total)}.</p>
            </div>
          )}
          {appUsageList.find(a => a.name.toLowerCase().includes('jguruji')) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Jguruji Adoption</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Jguruji app accounts for {formatHours(appUsageList.find(a => a.name.toLowerCase().includes('jguruji')).hours)} of usage.</p>
            </div>
          )}
          {processedData.schoolTableData.filter(s => s.eduPerc < 40).length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">Low Edu % Warning</p>
              <p className="text-sm text-amber-600 dark:text-amber-400">{processedData.schoolTableData.filter(s => s.eduPerc < 40).length} schools have less than 40% educational usage.</p>
            </div>
          )}
        </div>
      </div>

      {/* School Level Table */}
      <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">School-Level Analysis</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search schools..."
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="All">All</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('schoolName')}>School Name</th>
                <th className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('udise')}>UDISE</th>
                <th className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('district')}>District</th>
                <th className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('deviceCount')}>Devices</th>
                <th className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('totalHours')}>Total Usage</th>
                <th className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('eduPerc')}>Edu %</th>
                <th className="p-3 font-semibold">Top App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedSchools.map((school, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-700 dark:text-slate-300">
                  <td className="p-3 font-medium truncate max-w-[200px]" title={school.schoolName}>{school.schoolName}</td>
                  <td className="p-3">{school.udise}</td>
                  <td className="p-3">{school.district}</td>
                  <td className="p-3 font-semibold">{school.deviceCount}</td>
                  <td className="p-3 font-semibold">{formatHours(school.totalHours)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      school.eduPerc >= 70 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      school.eduPerc >= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      {school.eduPerc.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-xs truncate max-w-[120px]" title={school.topAppName}>{school.topAppName}</td>
                </tr>
              ))}
              {paginatedSchools.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">No schools found matching the criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {rowsPerPage !== 'All' && sortedAndFilteredSchools.length > rowsPerPage && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedAndFilteredSchools.length)} of {sortedAndFilteredSchools.length} entries
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={currentPage * rowsPerPage >= sortedAndFilteredSchools.length}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default EduStatApplication;
