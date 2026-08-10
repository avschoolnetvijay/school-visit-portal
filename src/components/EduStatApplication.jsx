import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList
} from 'recharts';
import { downloadSVG, downloadPNG, downloadCSV } from '../utils';

// Hardcoded Categories
const APP_CATEGORIES = {
  educational: [
    'jguruji', 'smart board', 'office', 'browser', 'acrobat', 'pdf',
    'arduino', 'audacity', 'photoshop', 'msteam', 'zoom', 'bluefish editor',
    'adobe', 'note', 'notepad', 'vlc', 'eyeris'
  ],
  nonEducational: [
    'youtube', 'whatsapp', 'chatgpt', 'games', 'bluestacks', 'filmora'
  ],
  system: [
    'uptime', 'anydesk', 'winrar', 'zip', 'avro keyboard'
  ]
};

const COLORS = {
  educational: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
  nonEducational: ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
  system: ['#475569', '#64748b', '#94a3b8', '#cbd5e1'],
  jguruji: '#0284c7'
};

const formatHours = (h) => {
  if (h === undefined || h === null || isNaN(h)) return '0h 0m';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
};

const getCategory = (appName) => {
  if (!appName) return 'system';
  const name = String(appName).trim().toLowerCase();
  if (name === 'uptime') return 'system';
  if (APP_CATEGORIES.educational.some(app => name === app || name.includes(app))) return 'educational';
  if (APP_CATEGORIES.nonEducational.some(app => name === app || name.includes(app))) return 'nonEducational';
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
              <span className="font-black text-white">{typeof p.value === 'number' ? (p.dataKey === 'devices' ? p.value : formatHours(p.value)) : p.value}</span>
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
const PlayIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PauseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

const EduStatApplication = ({ edustatAppData = [], schools = [], manpower = [], ccNameMapping = {} }) => {
  const [activeTab, setActiveTab] = useState('school'); // 'school' | 'device'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'upTimeHours', direction: 'desc' });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Device-level search and sorting
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [deviceSortConfig, setDeviceSortConfig] = useState({ key: 'upTimeHours', direction: 'desc' });
  const [deviceRowsPerPage, setDeviceRowsPerPage] = useState(10);
  const [deviceCurrentPage, setDeviceCurrentPage] = useState(1);

  // Drill-down Modal State
  const [drillModal, setDrillModal] = useState(null); // { filterType: 'all' | 'zero', searchTerm: '' }

  // 1. Build Master Lookups for Project, CC/DEF, ICT Instructor
  const schoolLookup = useMemo(() => {
    const map = {};
    (schools || []).forEach(s => {
      const u = String(s.udise_code || s.udise || '').trim();
      if (u) {
        const rawCC = s.visitor_name || s.cc_name || s.def_name || s.ccName || '-';
        const resolvedCC = (ccNameMapping && ccNameMapping[rawCC]) || rawCC;
        map[u] = {
          projectName: s.project_name || s.project || '-',
          ccDef: resolvedCC,
          rawCC: rawCC
        };
      }
    });
    return map;
  }, [schools, ccNameMapping]);

  const manpowerLookup = useMemo(() => {
    const map = {};
    (manpower || []).forEach(m => {
      const u = String(m.udise || m.udise_code || '').trim();
      const instName = m.instructorName || m.name || m.staffName || m.instructor || '';
      if (u && instName) {
        if (!map[u]) map[u] = [];
        if (!map[u].includes(instName)) map[u].push(instName);
      }
    });
    return map;
  }, [manpower]);

  // 2. Process EduStat Records
  const processedData = useMemo(() => {
    if (!edustatAppData || edustatAppData.length === 0) return null;

    let totalUpTimeHours = 0;
    let totalActiveAppHours = 0;
    let totalJgurujiHours = 0;
    let totalEduHours = 0;
    let totalNonEduHours = 0;
    let totalSysHours = 0;

    const devices = new Set();
    const udises = new Set();
    let minDate = '9999-12-31';
    let maxDate = '0000-00-00';

    const appUsage = {};
    const dailyUsage = {};
    const districtUsage = {};
    const schoolStats = {};
    const deviceStats = {};

    edustatAppData.forEach(record => {
      const h = parseFloat(record.hours) || 0;
      if (h <= 0) return;

      const procName = String(record.processName || '').trim();
      const isUpTime = procName.toLowerCase() === 'uptime';
      const isJguruji = procName.toLowerCase() === 'jguruji';

      devices.add(record.serial);
      if (record.udise) udises.add(record.udise);

      if (record.date) {
        if (record.date < minDate) minDate = record.date;
        if (record.date > maxDate) maxDate = record.date;
      }

      const cat = getCategory(procName);

      if (isUpTime) {
        totalUpTimeHours += h;
      } else {
        totalActiveAppHours += h;
        if (isJguruji) totalJgurujiHours += h;
        if (cat === 'educational') totalEduHours += h;
        else if (cat === 'nonEducational') totalNonEduHours += h;
        else totalSysHours += h;

        // App Usage breakdown (stores unique device serials per process)
        const appKey = procName || 'Unknown';
        if (!appUsage[appKey]) appUsage[appKey] = { name: appKey, hours: 0, category: cat, devices: new Set() };
        appUsage[appKey].hours += h;
        if (record.serial) appUsage[appKey].devices.add(record.serial);
      }

      // Daily Usage Trend (tracks activeApp hours & unique devices per date)
      if (record.date) {
        if (!dailyUsage[record.date]) {
          dailyUsage[record.date] = { date: record.date, educational: 0, nonEducational: 0, system: 0, uptime: 0, activeApp: 0, devices: new Set() };
        }
        if (isUpTime) {
          dailyUsage[record.date].uptime += h;
        } else {
          dailyUsage[record.date][cat] += h;
          dailyUsage[record.date].activeApp += h;
        }
        if (record.serial) dailyUsage[record.date].devices.add(record.serial);
      }

      // District Usage
      if (record.district) {
        if (!districtUsage[record.district]) districtUsage[record.district] = { district: record.district, educational: 0, nonEducational: 0, uptime: 0, activeApp: 0, jguruji: 0 };
        if (isUpTime) {
          districtUsage[record.district].uptime += h;
        } else {
          districtUsage[record.district][cat] += h;
          districtUsage[record.district].activeApp += h;
          if (isJguruji) districtUsage[record.district].jguruji += h;
        }
      }

      // School Stats
      if (record.udise && record.schoolName) {
        const schMeta = schoolLookup[record.udise] || {};
        const instList = manpowerLookup[record.udise] || [];

        if (!schoolStats[record.udise]) {
          schoolStats[record.udise] = {
            udise: record.udise,
            schoolName: record.schoolName,
            district: record.district || '-',
            block: record.block || '-',
            projectName: schMeta.projectName || record.project || '-',
            ccDef: schMeta.ccDef || record.visitor_name || '-',
            ictInstructor: instList.length > 0 ? instList.join(', ') : '-',
            devices: new Set(),
            upTimeHours: 0,
            activeAppHours: 0,
            jgurujiHours: 0,
            eduHours: 0,
            nonEduHours: 0,
            appCounts: {}
          };
        }
        schoolStats[record.udise].devices.add(record.serial);
        if (isUpTime) {
          schoolStats[record.udise].upTimeHours += h;
        } else {
          schoolStats[record.udise].activeAppHours += h;
          if (isJguruji) schoolStats[record.udise].jgurujiHours += h;
          if (cat === 'educational') schoolStats[record.udise].eduHours += h;
          else if (cat === 'nonEducational') schoolStats[record.udise].nonEduHours += h;

          if (!schoolStats[record.udise].appCounts[procName]) schoolStats[record.udise].appCounts[procName] = 0;
          schoolStats[record.udise].appCounts[procName] += h;
        }
      }

      // Device Stats
      if (record.serial) {
        const devKey = record.serial;
        const schMeta = schoolLookup[record.udise] || {};
        const instList = manpowerLookup[record.udise] || [];

        if (!deviceStats[devKey]) {
          deviceStats[devKey] = {
            serial: devKey,
            schoolName: record.schoolName || '-',
            udise: record.udise || '-',
            district: record.district || '-',
            block: record.block || '-',
            projectName: schMeta.projectName || record.project || '-',
            ccDef: schMeta.ccDef || record.visitor_name || '-',
            ictInstructor: instList.length > 0 ? instList.join(', ') : '-',
            upTimeHours: 0,
            activeAppHours: 0,
            jgurujiHours: 0,
            eduHours: 0,
            nonEduHours: 0,
            appCounts: {}
          };
        }
        if (isUpTime) {
          deviceStats[devKey].upTimeHours += h;
        } else {
          deviceStats[devKey].activeAppHours += h;
          if (isJguruji) deviceStats[devKey].jgurujiHours += h;
          if (cat === 'educational') deviceStats[devKey].eduHours += h;
          else if (cat === 'nonEducational') deviceStats[devKey].nonEduHours += h;

          if (!deviceStats[devKey].appCounts[procName]) deviceStats[devKey].appCounts[procName] = 0;
          deviceStats[devKey].appCounts[procName] += h;
        }
      }
    });

    const totalIdleHours = Math.max(0, totalUpTimeHours - totalActiveAppHours);
    const overallActiveUtilPerc = totalUpTimeHours > 0 ? Math.min(100, (totalActiveAppHours / totalUpTimeHours) * 100) : 0;
    const overallIdlePerc = totalUpTimeHours > 0 ? Math.min(100, (totalIdleHours / totalUpTimeHours) * 100) : 0;
    const overallEduPerc = totalActiveAppHours > 0 ? (totalEduHours / totalActiveAppHours) * 100 : 0;
    const overallNonEduPerc = totalActiveAppHours > 0 ? (totalNonEduHours / totalActiveAppHours) * 100 : 0;
    const overallJgurujiPerc = totalActiveAppHours > 0 ? (totalJgurujiHours / totalActiveAppHours) * 100 : 0;

    const appUsageList = Object.values(appUsage)
      .sort((a, b) => b.hours - a.hours)
      .map((app, i) => {
        let colorList = COLORS[app.category] || COLORS.system;
        const appSharePerc = totalActiveAppHours > 0 ? (app.hours / totalActiveAppHours) * 100 : 0;
        return {
          ...app,
          totalDevices: app.devices.size,
          displayName: `${app.name} Usage`,
          appSharePerc,
          fill: colorList[i % colorList.length]
        };
      });

    const maxAppHours = appUsageList.length > 0 ? appUsageList[0].hours : 1;

    const dailyTrendList = Object.values(dailyUsage)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        activeDevicesCount: d.devices.size
      }));

    const districtList = Object.values(districtUsage).sort((a, b) => b.uptime - a.uptime);

    // School Table Data
    const schoolTableData = Object.values(schoolStats).map(school => {
      const idleHours = Math.max(0, school.upTimeHours - school.activeAppHours);
      const activeUtilPerc = school.upTimeHours > 0 ? Math.min(100, (school.activeAppHours / school.upTimeHours) * 100) : 0;
      const eduPerc = school.activeAppHours > 0 ? (school.eduHours / school.activeAppHours) * 100 : 0;
      const nonEduPerc = school.activeAppHours > 0 ? (school.nonEduHours / school.activeAppHours) * 100 : 0;
      const jgurujiPerc = school.activeAppHours > 0 ? (school.jgurujiHours / school.activeAppHours) * 100 : 0;
      
      const topAppEntries = Object.entries(school.appCounts).sort((a, b) => b[1] - a[1]);
      const topApp = topAppEntries.length > 0 ? topAppEntries[0][0] : '-';

      return {
        ...school,
        deviceCount: school.devices.size,
        idleHours,
        activeUtilPerc,
        eduPerc,
        nonEduPerc,
        jgurujiPerc,
        topAppName: topApp
      };
    });

    // Device Table Data
    const deviceTableData = Object.values(deviceStats).map(dev => {
      const idleHours = Math.max(0, dev.upTimeHours - dev.activeAppHours);
      const activeUtilPerc = dev.upTimeHours > 0 ? Math.min(100, (dev.activeAppHours / dev.upTimeHours) * 100) : 0;
      const eduPerc = dev.activeAppHours > 0 ? (dev.eduHours / dev.activeAppHours) * 100 : 0;
      const jgurujiPerc = dev.activeAppHours > 0 ? (dev.jgurujiHours / dev.activeAppHours) * 100 : 0;

      const topAppEntries = Object.entries(dev.appCounts).sort((a, b) => b[1] - a[1]);
      const topApp = topAppEntries.length > 0 ? topAppEntries[0][0] : '-';

      let statusTag = 'High Edu';
      if (dev.nonEduHours > dev.eduHours) statusTag = 'Non-Edu Misuse';
      else if (idleHours > dev.activeAppHours * 2) statusTag = 'Idle Heavy';

      return {
        ...dev,
        idleHours,
        activeUtilPerc,
        eduPerc,
        jgurujiPerc,
        topAppName: topApp,
        statusTag
      };
    });

    // Project-wise Usage Breakdown for J-Guruji Comparison
    const projectUsageMap = {};
    schoolTableData.forEach(sch => {
      const pName = sch.projectName && sch.projectName !== '-' ? sch.projectName : 'Other Projects';
      if (!projectUsageMap[pName]) {
        projectUsageMap[pName] = {
          name: pName,
          jgurujiHours: 0,
          activeAppHours: 0,
          upTimeHours: 0,
          schoolCount: 0,
          deviceCount: 0
        };
      }
      projectUsageMap[pName].jgurujiHours += sch.jgurujiHours;
      projectUsageMap[pName].activeAppHours += sch.activeAppHours;
      projectUsageMap[pName].upTimeHours += sch.upTimeHours;
      projectUsageMap[pName].schoolCount += 1;
      projectUsageMap[pName].deviceCount += sch.deviceCount;
    });

    const projectList = Object.values(projectUsageMap)
      .map((p, i) => {
        const jgurujiPerc = p.activeAppHours > 0 ? (p.jgurujiHours / p.activeAppHours) * 100 : 0;
        const palette = ['#0284c7', '#059669', '#7c3aed', '#db2777', '#ea580c', '#2563eb', '#d97706', '#0d9488'];
        return {
          ...p,
          jgurujiPerc,
          fill: palette[i % palette.length],
          labelText: `${jgurujiPerc.toFixed(1)}% (${formatHours(p.jgurujiHours)})`
        };
      })
      .sort((a, b) => b.jgurujiPerc - a.jgurujiPerc);

    // AI Insights Generator & District Leader Project Mapping
    const zeroJgurujiSchoolsCount = schoolTableData.filter(s => s.jgurujiHours === 0).length;
    const idleHeavySchoolsCount = schoolTableData.filter(s => s.idleHours > s.activeAppHours).length;
    const bestDistrict = districtList.length > 0 ? [...districtList].sort((a, b) => (b.jguruji / (b.activeApp || 1)) - (a.jguruji / (a.activeApp || 1)))[0] : null;

    let bestDistrictProjects = '';
    if (bestDistrict) {
      const projSet = new Set();
      schoolTableData.forEach(s => {
        if (s.district.toLowerCase() === bestDistrict.district.toLowerCase() && s.projectName && s.projectName !== '-') {
          projSet.add(s.projectName);
        }
      });
      bestDistrictProjects = Array.from(projSet).join(', ') || '-';
    }

    return {
      kpi: {
        devices: devices.size,
        schools: udises.size,
        totalUpTimeHours,
        totalActiveAppHours,
        totalIdleHours,
        totalJgurujiHours,
        totalEduHours,
        totalNonEduHours,
        totalSysHours,
        overallActiveUtilPerc,
        overallIdlePerc,
        overallEduPerc,
        overallNonEduPerc,
        overallJgurujiPerc,
        dateRange: minDate !== '9999-12-31' ? `${minDate} to ${maxDate}` : 'N/A',
        zeroJgurujiSchoolsCount,
        idleHeavySchoolsCount,
        bestDistrict,
        bestDistrictProjects
      },
      appUsageList,
      maxAppHours,
      dailyTrendList,
      districtList,
      projectList,
      schoolTableData,
      deviceTableData,
      topApps: appUsageList.slice(0, 10)
    };

  }, [edustatAppData, schoolLookup, manpowerLookup]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleDeviceSort = (key) => {
    let direction = 'asc';
    if (deviceSortConfig.key === key && deviceSortConfig.direction === 'asc') direction = 'desc';
    setDeviceSortConfig({ key, direction });
  };

  const sortedAndFilteredSchools = useMemo(() => {
    if (!processedData) return [];
    let items = [...processedData.schoolTableData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(s =>
        s.schoolName.toLowerCase().includes(term) ||
        s.udise.includes(term) ||
        s.district.toLowerCase().includes(term) ||
        s.block.toLowerCase().includes(term) ||
        s.projectName.toLowerCase().includes(term) ||
        s.ccDef.toLowerCase().includes(term) ||
        s.ictInstructor.toLowerCase().includes(term)
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

  const sortedAndFilteredDevices = useMemo(() => {
    if (!processedData) return [];
    let items = [...processedData.deviceTableData];

    if (deviceSearchTerm) {
      const term = deviceSearchTerm.toLowerCase();
      items = items.filter(d =>
        d.serial.toLowerCase().includes(term) ||
        d.schoolName.toLowerCase().includes(term) ||
        d.udise.includes(term) ||
        d.district.toLowerCase().includes(term) ||
        d.block.toLowerCase().includes(term) ||
        d.projectName.toLowerCase().includes(term) ||
        d.ccDef.toLowerCase().includes(term) ||
        d.ictInstructor.toLowerCase().includes(term)
      );
    }

    if (deviceSortConfig.key) {
      items.sort((a, b) => {
        const aVal = a[deviceSortConfig.key];
        const bVal = b[deviceSortConfig.key];
        if (aVal < bVal) return deviceSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return deviceSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [processedData, deviceSearchTerm, deviceSortConfig]);

  const paginatedDevices = useMemo(() => {
    if (deviceRowsPerPage === 'All') return sortedAndFilteredDevices;
    const start = (deviceCurrentPage - 1) * deviceRowsPerPage;
    return sortedAndFilteredDevices.slice(start, start + deviceRowsPerPage);
  }, [sortedAndFilteredDevices, deviceCurrentPage, deviceRowsPerPage]);

  // Export School Report
  const exportSchoolData = () => {
    if (!processedData) return;
    const exportRows = processedData.schoolTableData.map(s => ({
      'School Name': s.schoolName,
      'UDISE': s.udise,
      'District': s.district,
      'Block': s.block,
      'Project Name': s.projectName,
      'CC / DEF Details': s.ccDef,
      'Name of ICT Instructor': s.ictInstructor,
      'Devices Count': s.deviceCount,
      'Total UpTime (Hr)': s.upTimeHours.toFixed(2),
      'Active App Usage (Hr)': s.activeAppHours.toFixed(2),
      'Idle Unused Time (Hr)': s.idleHours.toFixed(2),
      'Active Util %': s.activeUtilPerc.toFixed(1) + '%',
      'Educational %': s.eduPerc.toFixed(1) + '%',
      'Non-Educational %': s.nonEduPerc.toFixed(1) + '%',
      'J-Guruji Usage %': s.jgurujiPerc.toFixed(1) + '%',
      'J-Guruji Hours': s.jgurujiHours.toFixed(2),
      'Top App': s.topAppName
    }));
    downloadCSV(exportRows, `Edustat_School_Level_Report.csv`);
  };

  // Export Device-Wise Report
  const exportDeviceData = () => {
    if (!processedData) return;
    const exportRows = processedData.deviceTableData.map(d => ({
      'Serial Number': d.serial,
      'School Name': d.schoolName,
      'UDISE': d.udise,
      'District': d.district,
      'Block': d.block,
      'Project Name': d.projectName,
      'CC / DEF Details': d.ccDef,
      'Name of ICT Instructor': d.ictInstructor,
      'UpTime (Hr)': d.upTimeHours.toFixed(2),
      'Active App Usage (Hr)': d.activeAppHours.toFixed(2),
      'Idle Unused Time (Hr)': d.idleHours.toFixed(2),
      'Active Util %': d.activeUtilPerc.toFixed(1) + '%',
      'J-Guruji Hours': d.jgurujiHours.toFixed(2),
      'J-Guruji %': d.jgurujiPerc.toFixed(1) + '%',
      'Top App': d.topAppName,
      'Usage Tag': d.statusTag
    }));
    downloadCSV(exportRows, `Edustat_Device_Wise_Report.csv`);
  };

  // Export Drill-Down Data from Modal
  const exportDrillDownData = (type, rows) => {
    const exportRows = rows.map(s => ({
      'School Name': s.schoolName,
      'UDISE': s.udise,
      'District': s.district,
      'Block': s.block,
      'Project Name': s.projectName,
      'CC / DEF Details': s.ccDef,
      'Name of ICT Instructor': s.ictInstructor,
      'Total UpTime (Hr)': s.upTimeHours.toFixed(2),
      'Active App Usage (Hr)': s.activeAppHours.toFixed(2),
      'J-Guruji Hours': s.jgurujiHours.toFixed(2),
      'J-Guruji %': s.jgurujiPerc.toFixed(1) + '%',
      'Top App': s.topAppName
    }));
    downloadCSV(exportRows, `JGuruji_DrillDown_${type}_Report.csv`);
  };

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

  const { kpi, appUsageList, maxAppHours, dailyTrendList, projectList, schoolTableData } = processedData;

  const kpiCards = [
    { title: "Total Devices", value: kpi.devices, subtitle: "Active Units", icon: <MonitorIcon />, color: "from-blue-500 to-blue-600" },
    { title: "Schools Covered", value: kpi.schools, subtitle: "Unique UDISE", icon: <SchoolIcon />, color: "from-purple-500 to-purple-600" },
    { title: "Total Device UpTime", value: formatHours(kpi.totalUpTimeHours), subtitle: "Power ON Duration", icon: <ClockIcon />, color: "from-slate-600 to-slate-700" },
    { title: "Active App Usage", value: formatHours(kpi.totalActiveAppHours), subtitle: `${kpi.overallActiveUtilPerc.toFixed(1)}% of UpTime`, icon: <PlayIcon />, color: "from-emerald-500 to-emerald-600" },
    { title: "Idle / Unused Hours", value: formatHours(kpi.totalIdleHours), subtitle: `${kpi.overallIdlePerc.toFixed(1)}% of UpTime`, icon: <PauseIcon />, color: "from-amber-500 to-amber-600" },
    { title: "⭐ J-Guruji Adoption", value: formatHours(kpi.totalJgurujiHours), subtitle: `${kpi.overallJgurujiPerc.toFixed(1)}% of Active Apps`, icon: <StarIcon />, color: "from-sky-500 to-sky-600" }
  ];

  // Column Chart Data for Device UpTime Allocation (Calculated with respect to Total Device UpTime)
  const eduUpTimePerc = kpi.totalUpTimeHours > 0 ? (kpi.totalEduHours / kpi.totalUpTimeHours) * 100 : 0;
  const jgurujiUpTimePerc = kpi.totalUpTimeHours > 0 ? (kpi.totalJgurujiHours / kpi.totalUpTimeHours) * 100 : 0;
  const nonEduUpTimePerc = kpi.totalUpTimeHours > 0 ? (kpi.totalNonEduHours / kpi.totalUpTimeHours) * 100 : 0;
  const idleUpTimePerc = kpi.totalUpTimeHours > 0 ? (kpi.totalIdleHours / kpi.totalUpTimeHours) * 100 : 0;

  const uptimeColumnData = [
    { name: 'Educational Apps', hours: kpi.totalEduHours, perc: eduUpTimePerc, fill: '#059669', labelText: `${formatHours(kpi.totalEduHours)} (${eduUpTimePerc.toFixed(1)}%)` },
    { name: '⭐ J-Guruji', hours: kpi.totalJgurujiHours, perc: jgurujiUpTimePerc, fill: '#0284c7', labelText: `${formatHours(kpi.totalJgurujiHours)} (${jgurujiUpTimePerc.toFixed(1)}%)` },
    { name: 'Non-Educational', hours: kpi.totalNonEduHours, perc: nonEduUpTimePerc, fill: '#e11d48', labelText: `${formatHours(kpi.totalNonEduHours)} (${nonEduUpTimePerc.toFixed(1)}%)` },
    { name: 'Idle / Unused', hours: kpi.totalIdleHours, perc: idleUpTimePerc, fill: '#64748b', labelText: `${formatHours(kpi.totalIdleHours)} (${idleUpTimePerc.toFixed(1)}%)` }
  ];

  // Drill-down Modal Data filtering
  let modalFilteredList = [];
  if (drillModal) {
    let raw = drillModal.filterType === 'zero' ? schoolTableData.filter(s => s.jgurujiHours === 0) : schoolTableData;
    if (drillModal.searchTerm) {
      const q = drillModal.searchTerm.toLowerCase();
      raw = raw.filter(s =>
        s.schoolName.toLowerCase().includes(q) ||
        s.udise.includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.block.toLowerCase().includes(q) ||
        s.projectName.toLowerCase().includes(q) ||
        s.ccDef.toLowerCase().includes(q) ||
        s.ictInstructor.toLowerCase().includes(q)
      );
    }
    modalFilteredList = raw;
  }

  return (
    <div className="space-y-6">
      
      {/* Top KPI Cards (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="portal-card relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
              {card.icon}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">{card.title}</p>
            <p className="font-extrabold text-slate-800 dark:text-white text-base truncate">{card.value}</p>
            {card.subtitle && (
              <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Main Charts Row: Pic 4 App Usage Breakdown Table & Pic 2 Column Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PIC 4 FEATURE: Application Usage Breakdown Table (SHOWS TOP 5, EXPORT DOWNLOADS ALL) */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Application Usage Breakdown</span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">(Top 5 Active Apps)</span>
            </h3>
            <button
              onClick={() => downloadCSV(appUsageList.map((a, i) => ({
                'Sr No.': String(i + 1).padStart(2, '0'),
                'App Name': a.displayName,
                'Total Devices': a.totalDevices,
                'Hours': formatHours(a.hours),
                'Share %': a.appSharePerc.toFixed(1) + '%',
                'Category': a.category
              })), 'Full_Application_Usage_Breakdown.csv')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              title="Download complete list of all applications"
            >
              📥 Export All Apps (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-purple-50/70 dark:bg-slate-800 text-purple-900 dark:text-purple-300 font-bold border-b border-purple-100 dark:border-slate-700">
                  <th className="p-3 w-16">Sr No.</th>
                  <th className="p-3">App Name</th>
                  <th className="p-3 text-center">Total Devices</th>
                  <th className="p-3">Hours & % Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appUsageList.slice(0, 5).map((app, i) => {
                  const perc = Math.min(100, Math.max(5, (app.hours / maxAppHours) * 100));
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono text-slate-400 font-semibold">{String(i + 1).padStart(2, '0')}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">{app.displayName}</td>
                      <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">{app.totalDevices}</td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-700 dark:text-slate-300">{formatHours(app.hours)}</span>
                            <span className="text-[11px] font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded font-mono">
                              {app.appSharePerc.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${perc}%`, backgroundColor: app.fill || '#6366f1' }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {appUsageList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">No application usage data recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {appUsageList.length > 5 && (
            <p className="text-[10px] text-slate-400 italic text-right mt-2">
              Showing top 5 active apps on screen. Click "Export All Apps" to download complete list ({appUsageList.length} apps).
            </p>
          )}
        </div>

        {/* PIC 2 FEATURE: Device UpTime Allocation (Vertical Column Chart with % Labels) */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative flex flex-col justify-between">
          <ChartToolbar chartId="uptime-column-chart" csvData={uptimeColumnData} filename="uptime-allocation-column-chart" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>Device UpTime Allocation</span>
            <span className="text-[10px] text-slate-400 font-normal normal-case">(% of Total System UpTime)</span>
          </h3>
          <div className="h-[280px]" id="uptime-column-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uptimeColumnData} margin={{ top: 25, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tickFormatter={(v) => formatHours(v)} tick={{ fontSize: 10 }} />
                <Tooltip content={<PremiumChartTooltip />} />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                  {uptimeColumnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="labelText"
                    position="top"
                    style={{ fontSize: '11px', fontWeight: 'bold', fill: '#334155' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* PIC 1 FEATURE: Active Devices & UpTime Over Time (Smooth Area Chart - POSITIONED BELOW BREAKDOWN & ALLOCATION) */}
      <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative">
        <ChartToolbar chartId="active-devices-area-chart" csvData={dailyTrendList} filename="active-devices-trend" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>Active Usage & UpTime Over Time</span>
          <span className="text-[10px] text-slate-400 font-normal normal-case">(Daily Trend Analysis)</span>
        </h3>
        <div className="h-[280px]" id="active-devices-area-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrendList} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
              <defs>
                <linearGradient id="gradientUptime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="gradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                interval="preserveStartEnd"
              />
              <YAxis tickFormatter={(v) => formatHours(v)} tick={{ fontSize: 10 }} />
              <Tooltip content={<PremiumChartTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Area
                type="monotone"
                dataKey="uptime"
                name="Total Device UpTime"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientUptime)"
              />
              <Area
                type="monotone"
                dataKey="activeApp"
                name="Active App Usage"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientActive)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FEATURE: Project-Wise J-Guruji Adoption Comparison (Vertical Column Chart) */}
      <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative">
        <ChartToolbar chartId="project-jguruji-column-chart" csvData={projectList.map(p => ({
          'Project Name': p.name,
          'J-Guruji Adoption %': p.jgurujiPerc.toFixed(1) + '%',
          'J-Guruji Usage (Hr)': p.jgurujiHours.toFixed(2),
          'Total Active App Usage (Hr)': p.activeAppHours.toFixed(2),
          'Total UpTime (Hr)': p.upTimeHours.toFixed(2),
          'Schools Count': p.schoolCount,
          'Devices Count': p.deviceCount
        }))} filename="project-wise-jguruji-adoption" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1 uppercase tracking-wider flex items-center gap-2">
          <span>⭐ Project-Wise J-Guruji Adoption Comparison</span>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold normal-case">(% of Active App Usage)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Compares J-Guruji app adoption percentage across projects for the selected filter date range.
        </p>
        <div className="h-[280px]" id="project-jguruji-column-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectList} margin={{ top: 25, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
              <Tooltip content={<PremiumChartTooltip />} />
              <Bar dataKey="jgurujiPerc" name="J-Guruji Adoption %" radius={[8, 8, 0, 0]}>
                {projectList.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="labelText"
                  position="top"
                  style={{ fontSize: '11px', fontWeight: 'bold', fill: '#0284c7' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights & Operational Alerts Panel (CLICKABLE FOR DRILL-DOWN) */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold mb-3 uppercase tracking-wider flex items-center justify-between text-teal-400">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Smart AI Analytics & Operational Alerts
          </span>
          <span className="text-[10px] font-normal text-slate-400 lowercase">Click cards to drill-down details & export 🔍</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Card 1: J-Guruji Adoption Score (CLICKABLE DRILL DOWN) */}
          <div 
            onClick={() => setDrillModal({ filterType: 'zero', searchTerm: '' })}
            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500 rounded-lg p-3.5 shadow-sm cursor-pointer transition-all group relative"
            title="Click to view & export drill-down data of zero J-Guruji schools"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sky-400 font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1">
                <span>⭐ J-GURUJI ADOPTION SCORE</span>
              </span>
              <span className="text-[10px] font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">Drill Down 🔍</span>
            </div>
            <p className="leading-relaxed text-slate-200 font-medium">
              J-Guruji accounts for <strong className="text-sky-300 font-black bg-slate-900/80 px-1.5 py-0.5 rounded">{kpi.overallJgurujiPerc.toFixed(1)}%</strong> of active app usage across <strong className="text-white font-bold">{kpi.schools}</strong> schools. 
              {kpi.zeroJgurujiSchoolsCount > 0 ? (
                <span className="text-amber-300 font-bold block mt-1.5 bg-amber-950/60 border border-amber-800/50 p-1.5 rounded text-[11px]">
                  ⚠️ {kpi.zeroJgurujiSchoolsCount} schools have zero J-Guruji activity. <span className="underline font-extrabold ml-1">View List & Export →</span>
                </span>
              ) : <span className="text-emerald-300 font-bold block mt-1"> Great adoption rate!</span>}
            </p>
          </div>

          {/* Card 2: Idle Power Waste Warning */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5 shadow-sm">
            <span className="text-amber-400 font-extrabold uppercase text-[10px] tracking-wider block mb-1.5 flex items-center gap-1">
              <span>💤 IDLE POWER WASTE WARNING</span>
            </span>
            <p className="leading-relaxed text-slate-200 font-medium">
              Devices were ON but idle for <strong className="text-amber-300 font-black bg-slate-900/80 px-1.5 py-0.5 rounded">{formatHours(kpi.totalIdleHours)}</strong> ({kpi.overallIdlePerc.toFixed(1)}% of uptime). 
              <span className="text-white font-bold block mt-1">{kpi.idleHeavySchoolsCount} schools spend more time idle than active.</span>
            </p>
          </div>

          {/* Card 3: District & Project Leader (MENTIONS DISTRICT & PROJECT NAME) */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5 shadow-sm">
            <span className="text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider block mb-1.5 flex items-center gap-1">
              <span>🏆 DISTRICT & PROJECT LEADER</span>
            </span>
            <p className="leading-relaxed text-slate-200 font-medium">
              {kpi.bestDistrict ? (
                <>
                  District <strong className="text-emerald-300 font-black bg-slate-900/80 px-1.5 py-0.5 rounded">{kpi.bestDistrict.district}</strong>
                  {kpi.bestDistrictProjects && kpi.bestDistrictProjects !== '-' && (
                    <span className="text-teal-300 font-bold ml-1">({kpi.bestDistrictProjects})</span>
                  )} leads in J-Guruji adoption with <strong className="text-white font-bold">{formatHours(kpi.bestDistrict.jguruji)}</strong> usage.
                </>
              ) : 'Active data loaded.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-View Selector (School-Level vs Device-Wise Report) */}
      <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('school')}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'school'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <SchoolIcon /> 🏫 School-Level Analysis
            </button>
            <button
              onClick={() => setActiveTab('device')}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'device'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <MonitorIcon /> 💻 Device-Wise Detailed Report
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'school' ? (
              <button
                onClick={exportSchoolData}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                📥 Export School Report (Excel)
              </button>
            ) : (
              <button
                onClick={exportDeviceData}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                📥 Export Device-Wise Details (Excel)
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: SCHOOL-LEVEL TABLE */}
        {activeTab === 'school' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                School Usage & Efficiency Breakdown ({sortedAndFilteredSchools.length} schools)
              </h4>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search school, UDISE, project, CC, instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('schoolName')}>School Name</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('udise')}>UDISE</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('district')}>District / Block</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-400" onClick={() => handleSort('projectName')}>Project Name</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400" onClick={() => handleSort('ccDef')}>CC / DEF Details</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-400" onClick={() => handleSort('ictInstructor')}>ICT Instructor</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('deviceCount')}>Devices</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('upTimeHours')}>UpTime (Hr)</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400" onClick={() => handleSort('activeAppHours')}>Active App (Hr)</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400" onClick={() => handleSort('idleHours')}>Idle (Hr)</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('activeUtilPerc')}>Util %</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400" onClick={() => handleSort('jgurujiPerc')}>⭐ J-Guruji %</th>
                    <th className="p-3">Top App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedSchools.map((school, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 max-w-[180px] truncate" title={school.schoolName}>{school.schoolName}</td>
                      <td className="p-3 font-mono">{school.udise}</td>
                      <td className="p-3">{school.district} / {school.block}</td>
                      <td className="p-3 font-medium text-teal-600 dark:text-teal-400 max-w-[120px] truncate" title={school.projectName}>{school.projectName}</td>
                      <td className="p-3 font-medium text-sky-600 dark:text-sky-400 max-w-[130px] truncate" title={school.ccDef}>{school.ccDef}</td>
                      <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400 max-w-[140px] truncate" title={school.ictInstructor}>{school.ictInstructor}</td>
                      <td className="p-3 text-center font-bold">{school.deviceCount}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{formatHours(school.upTimeHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatHours(school.activeAppHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{formatHours(school.idleHours)}</td>
                      <td className="p-3 text-center font-bold">{school.activeUtilPerc.toFixed(1)}%</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {school.jgurujiPerc.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 font-medium max-w-[100px] truncate" title={school.topAppName}>{school.topAppName}</td>
                    </tr>
                  ))}
                  {paginatedSchools.length === 0 && (
                    <tr>
                      <td colSpan="13" className="p-6 text-center text-slate-500">No schools found matching the filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {rowsPerPage !== 'All' && sortedAndFilteredSchools.length > rowsPerPage && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                <span className="text-xs text-slate-500">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedAndFilteredSchools.length)} of {sortedAndFilteredSchools.length} schools
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
        )}

        {/* TAB 2: DEVICE-WISE DETAILED TABLE */}
        {activeTab === 'device' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Device Serial Wise Detailed Breakdown ({sortedAndFilteredDevices.length} devices)
              </h4>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search device serial, school, project, CC, instructor..."
                  value={deviceSearchTerm}
                  onChange={(e) => setDeviceSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <select
                  value={deviceRowsPerPage}
                  onChange={(e) => {
                    setDeviceRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                    setDeviceCurrentPage(1);
                  }}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value="All">All</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleDeviceSort('serial')}>Device Serial</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleDeviceSort('schoolName')}>School Name</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleDeviceSort('district')}>District / Block</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-400" onClick={() => handleDeviceSort('projectName')}>Project Name</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400" onClick={() => handleDeviceSort('ccDef')}>CC / DEF Details</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-400" onClick={() => handleDeviceSort('ictInstructor')}>ICT Instructor</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleDeviceSort('upTimeHours')}>UpTime (Hr)</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400" onClick={() => handleDeviceSort('activeAppHours')}>Active App (Hr)</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400" onClick={() => handleDeviceSort('idleHours')}>Idle (Hr)</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleDeviceSort('activeUtilPerc')}>Util %</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400" onClick={() => handleDeviceSort('jgurujiHours')}>J-Guruji (Hr)</th>
                    <th className="p-3">Top App</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedDevices.map((dev, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-100">{dev.serial}</td>
                      <td className="p-3 font-medium max-w-[180px] truncate" title={dev.schoolName}>{dev.schoolName}</td>
                      <td className="p-3">{dev.district} / {dev.block}</td>
                      <td className="p-3 font-medium text-teal-600 dark:text-teal-400 max-w-[120px] truncate" title={dev.projectName}>{dev.projectName}</td>
                      <td className="p-3 font-medium text-sky-600 dark:text-sky-400 max-w-[130px] truncate" title={dev.ccDef}>{dev.ccDef}</td>
                      <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400 max-w-[140px] truncate" title={dev.ictInstructor}>{dev.ictInstructor}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{formatHours(dev.upTimeHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatHours(dev.activeAppHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{formatHours(dev.idleHours)}</td>
                      <td className="p-3 text-center font-bold">{dev.activeUtilPerc.toFixed(1)}%</td>
                      <td className="p-3 text-right font-mono font-bold text-sky-600 dark:text-sky-400">{formatHours(dev.jgurujiHours)}</td>
                      <td className="p-3 font-medium max-w-[100px] truncate" title={dev.topAppName}>{dev.topAppName}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          dev.statusTag === 'High Edu' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          dev.statusTag === 'Non-Edu Misuse' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {dev.statusTag}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedDevices.length === 0 && (
                    <tr>
                      <td colSpan="13" className="p-6 text-center text-slate-500">No devices found matching the filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {deviceRowsPerPage !== 'All' && sortedAndFilteredDevices.length > deviceRowsPerPage && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                <span className="text-xs text-slate-500">
                  Showing {(deviceCurrentPage - 1) * deviceRowsPerPage + 1} to {Math.min(deviceCurrentPage * deviceRowsPerPage, sortedAndFilteredDevices.length)} of {sortedAndFilteredDevices.length} devices
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={deviceCurrentPage === 1}
                    onClick={() => setDeviceCurrentPage(prev => prev - 1)}
                    className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={deviceCurrentPage * deviceRowsPerPage >= sortedAndFilteredDevices.length}
                    onClick={() => setDeviceCurrentPage(prev => prev + 1)}
                    className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRILL-DOWN MODAL DIALOG */}
      {drillModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <h3 className="font-extrabold text-sm text-teal-400 uppercase tracking-wider">
                    J-Guruji Adoption Drill-Down Report
                  </h3>
                  <p className="text-xs text-slate-400">
                    {drillModal.filterType === 'zero' ? `Showing ${modalFilteredList.length} schools with zero J-Guruji activity` : `Showing all ${modalFilteredList.length} schools`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportDrillDownData(drillModal.filterType, modalFilteredList)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  📥 Export Drill-Down Data (Excel/CSV)
                </button>
                <button
                  onClick={() => setDrillModal(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrillModal({ ...drillModal, filterType: 'zero' })}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition ${
                    drillModal.filterType === 'zero'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  ⚠️ Zero J-Guruji Schools ({processedData.schoolTableData.filter(s => s.jgurujiHours === 0).length})
                </button>
                <button
                  onClick={() => setDrillModal({ ...drillModal, filterType: 'all' })}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition ${
                    drillModal.filterType === 'all'
                      ? 'bg-sky-600 text-white shadow'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  🏫 All Schools ({processedData.schoolTableData.length})
                </button>
              </div>

              <input
                type="text"
                placeholder="Search school, UDISE, project, CC, instructor..."
                value={drillModal.searchTerm}
                onChange={(e) => setDrillModal({ ...drillModal, searchTerm: e.target.value })}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Modal Table */}
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">School Name</th>
                    <th className="p-2.5">UDISE</th>
                    <th className="p-2.5">District / Block</th>
                    <th className="p-2.5 text-teal-700 dark:text-teal-400">Project Name</th>
                    <th className="p-2.5 text-sky-700 dark:text-sky-400">CC / DEF Details</th>
                    <th className="p-2.5 text-indigo-700 dark:text-indigo-400">ICT Instructor</th>
                    <th className="p-2.5 text-right">UpTime (Hr)</th>
                    <th className="p-2.5 text-right text-emerald-700 dark:text-emerald-400">Active App (Hr)</th>
                    <th className="p-2.5 text-right text-sky-700 dark:text-sky-400">J-Guruji (Hr)</th>
                    <th className="p-2.5 text-center">J-Guruji %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {modalFilteredList.map((school, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-100 max-w-[180px] truncate" title={school.schoolName}>{school.schoolName}</td>
                      <td className="p-2.5 font-mono">{school.udise}</td>
                      <td className="p-2.5">{school.district} / {school.block}</td>
                      <td className="p-2.5 font-medium text-teal-600 dark:text-teal-400">{school.projectName}</td>
                      <td className="p-2.5 font-medium text-sky-600 dark:text-sky-400">{school.ccDef}</td>
                      <td className="p-2.5 font-medium text-indigo-600 dark:text-indigo-400">{school.ictInstructor}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{formatHours(school.upTimeHours)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatHours(school.activeAppHours)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-sky-600 dark:text-sky-400">{formatHours(school.jgurujiHours)}</td>
                      <td className="p-2.5 text-center font-extrabold">
                        <span className={`px-2 py-0.5 rounded ${school.jgurujiHours === 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'}`}>
                          {school.jgurujiPerc.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {modalFilteredList.length === 0 && (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-500">No schools found matching the filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span>Showing {modalFilteredList.length} schools</span>
              <button
                onClick={() => setDrillModal(null)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EduStatApplication;
