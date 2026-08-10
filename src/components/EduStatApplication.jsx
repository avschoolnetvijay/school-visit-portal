import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend
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
const PlayIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PauseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

const EduStatApplication = ({ edustatAppData = [], schools = [] }) => {
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

        // App Usage breakdown (excluding UpTime from App Breakdown chart)
        const appKey = procName || 'Unknown';
        if (!appUsage[appKey]) appUsage[appKey] = { name: appKey, hours: 0, category: cat };
        appUsage[appKey].hours += h;
      }

      // Daily Usage Trend
      if (record.date) {
        if (!dailyUsage[record.date]) dailyUsage[record.date] = { date: record.date, educational: 0, nonEducational: 0, system: 0, uptime: 0 };
        if (isUpTime) dailyUsage[record.date].uptime += h;
        else dailyUsage[record.date][cat] += h;
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
        if (!schoolStats[record.udise]) {
          schoolStats[record.udise] = {
            udise: record.udise,
            schoolName: record.schoolName,
            district: record.district || '-',
            block: record.block || '-',
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
        if (!deviceStats[devKey]) {
          deviceStats[devKey] = {
            serial: devKey,
            schoolName: record.schoolName || '-',
            udise: record.udise || '-',
            district: record.district || '-',
            block: record.block || '-',
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
        return { ...app, fill: colorList[i % colorList.length] };
      });

    const dailyTrendList = Object.values(dailyUsage).sort((a, b) => a.date.localeCompare(b.date));
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

    // AI Insights Generator
    const zeroJgurujiSchoolsCount = schoolTableData.filter(s => s.jgurujiHours === 0).length;
    const idleHeavySchoolsCount = schoolTableData.filter(s => s.idleHours > s.activeAppHours).length;
    const bestDistrict = districtList.length > 0 ? [...districtList].sort((a, b) => (b.jguruji / (b.activeApp || 1)) - (a.jguruji / (a.activeApp || 1)))[0] : null;

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
        bestDistrict
      },
      appUsageList,
      dailyTrendList,
      districtList,
      schoolTableData,
      deviceTableData,
      topApps: appUsageList.slice(0, 10)
    };

  }, [edustatAppData]);

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
        s.district.toLowerCase().includes(term)
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
        d.district.toLowerCase().includes(term)
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

  const exportSchoolData = () => {
    if (!processedData) return;
    const exportRows = processedData.schoolTableData.map(s => ({
      'School Name': s.schoolName,
      'UDISE': s.udise,
      'District': s.district,
      'Block': s.block,
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

  const exportDeviceData = () => {
    if (!processedData) return;
    const exportRows = processedData.deviceTableData.map(d => ({
      'Serial Number': d.serial,
      'School Name': d.schoolName,
      'UDISE': d.udise,
      'District': d.district,
      'Block': d.block,
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

  const { kpi, appUsageList, dailyTrendList, districtList } = processedData;

  const kpiCards = [
    { title: "Total Devices", value: kpi.devices, icon: <MonitorIcon />, color: "from-blue-500 to-blue-600" },
    { title: "Schools Covered", value: kpi.schools, icon: <SchoolIcon />, color: "from-purple-500 to-purple-600" },
    { title: "Total Device UpTime", value: formatHours(kpi.totalUpTimeHours), icon: <ClockIcon />, color: "from-slate-600 to-slate-700" },
    { title: "Active App Usage", value: `${formatHours(kpi.totalActiveAppHours)} (${kpi.overallActiveUtilPerc.toFixed(1)}%)`, icon: <PlayIcon />, color: "from-emerald-500 to-emerald-600" },
    { title: "Idle / Unused Hours", value: `${formatHours(kpi.totalIdleHours)} (${kpi.overallIdlePerc.toFixed(1)}%)`, icon: <PauseIcon />, color: "from-amber-500 to-amber-600" },
    { title: "⭐ J-Guruji Adoption", value: `${formatHours(kpi.totalJgurujiHours)} (${kpi.overallJgurujiPerc.toFixed(1)}%)`, icon: <StarIcon />, color: "from-sky-500 to-sky-600" }
  ];

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
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{card.title}</p>
            <p className="font-extrabold text-slate-800 dark:text-white text-base truncate">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Breakdown Chart (Excludes UpTime process) */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative lg:col-span-1">
          <ChartToolbar chartId="app-donut-chart" csvData={appUsageList} filename="app-usage-breakdown" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>Application Usage Breakdown</span>
            <span className="text-[10px] text-slate-400 font-normal normal-case">(Active Apps)</span>
          </h3>
          <div className="h-[300px]" id="app-donut-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appUsageList}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
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

        {/* Usage Category Analysis: Active Apps vs Idle Time */}
        <div className="portal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm relative lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Device UpTime Allocation (Active vs Idle)</h3>
          <div className="flex flex-col md:flex-row h-[300px] gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Educational Apps', value: kpi.totalEduHours, fill: COLORS.educational[0] },
                      { name: '⭐ J-Guruji', value: kpi.totalJgurujiHours, fill: COLORS.jguruji },
                      { name: 'Non-Educational Apps', value: kpi.totalNonEduHours, fill: COLORS.nonEducational[0] },
                      { name: 'Idle / Unused UpTime', value: kpi.totalIdleHours, fill: COLORS.system[0] }
                    ]}
                    cx="50%" cy="50%" outerRadius={95} dataKey="value"
                  >
                    <Cell fill={COLORS.educational[0]} />
                    <Cell fill={COLORS.jguruji} />
                    <Cell fill={COLORS.nonEducational[0]} />
                    <Cell fill={COLORS.system[0]} />
                  </Pie>
                  <Tooltip content={<PremiumChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-4 text-xs font-semibold">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>⭐ J-Guruji Usage</span>
                  <span className="font-extrabold text-sky-600">{kpi.overallJgurujiPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full" style={{ width: `${Math.min(100, kpi.overallJgurujiPerc)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatHours(kpi.totalJgurujiHours)} of Active App Usage</p>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>Other Educational Apps</span>
                  <span className="font-extrabold text-emerald-600">{kpi.overallEduPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(100, kpi.overallEduPerc)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatHours(kpi.totalEduHours)}</p>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>Non-Educational Apps</span>
                  <span className="font-extrabold text-rose-600">{kpi.overallNonEduPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full" style={{ width: `${Math.min(100, kpi.overallNonEduPerc)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatHours(kpi.totalNonEduHours)}</p>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>Idle / Unused UpTime</span>
                  <span className="font-extrabold text-slate-500">{kpi.overallIdlePerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full" style={{ width: `${Math.min(100, kpi.overallIdlePerc)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatHours(kpi.totalIdleHours)} of Total UpTime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Alerts Panel */}
      <div className="portal-card bg-gradient-to-r from-teal-900/90 to-slate-900 text-white rounded-xl p-5 shadow-md">
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2 text-teal-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Smart AI Analytics & Operational Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-3">
            <span className="text-sky-300 font-bold uppercase text-[10px] block mb-1">⭐ J-Guruji Adoption Score</span>
            <p className="leading-relaxed">
              J-Guruji accounts for <strong className="text-white font-black">{kpi.overallJgurujiPerc.toFixed(1)}%</strong> of active app usage across <strong className="text-white">{kpi.schools}</strong> schools. 
              {kpi.zeroJgurujiSchoolsCount > 0 ? ` ⚠️ ${kpi.zeroJgurujiSchoolsCount} schools have zero J-Guruji activity.` : ' Great adoption!'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-3">
            <span className="text-amber-300 font-bold uppercase text-[10px] block mb-1">💤 Idle Power Waste Warning</span>
            <p className="leading-relaxed">
              Devices were ON but idle for <strong className="text-amber-200 font-black">{formatHours(kpi.totalIdleHours)}</strong> ({kpi.overallIdlePerc.toFixed(1)}% of total uptime). 
              <strong className="text-white font-bold">{kpi.idleHeavySchoolsCount}</strong> schools spend more time idle than active.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-3">
            <span className="text-emerald-300 font-bold uppercase text-[10px] block mb-1">🏆 District Leader</span>
            <p className="leading-relaxed">
              {kpi.bestDistrict ? (
                <>District <strong className="text-emerald-200 font-black">{kpi.bestDistrict.district}</strong> leads in J-Guruji adoption with {formatHours(kpi.bestDistrict.jguruji)} usage.</>
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
                School Usage & Efficiency Breakdown
              </h4>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search school, UDISE or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                    <th className="p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('district')}>District</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('deviceCount')}>Devices</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('upTimeHours')}>UpTime (Hr)</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400" onClick={() => handleSort('activeAppHours')}>Active App (Hr)</th>
                    <th className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400" onClick={() => handleSort('idleHours')}>Idle / Unused (Hr)</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('activeUtilPerc')}>Util %</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('eduPerc')}>Edu %</th>
                    <th className="p-3 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400" onClick={() => handleSort('jgurujiPerc')}>⭐ J-Guruji %</th>
                    <th className="p-3">Top App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedSchools.map((school, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 max-w-[200px] truncate" title={school.schoolName}>{school.schoolName}</td>
                      <td className="p-3 font-mono">{school.udise}</td>
                      <td className="p-3">{school.district}</td>
                      <td className="p-3 text-center font-bold">{school.deviceCount}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{formatHours(school.upTimeHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatHours(school.activeAppHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{formatHours(school.idleHours)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {school.activeUtilPerc.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          school.eduPerc >= 70 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          school.eduPerc >= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                          {school.eduPerc.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {school.jgurujiPerc.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 font-medium max-w-[120px] truncate" title={school.topAppName}>{school.topAppName}</td>
                    </tr>
                  ))}
                  {paginatedSchools.length === 0 && (
                    <tr>
                      <td colSpan="11" className="p-6 text-center text-slate-500">No schools found matching the filter criteria.</td>
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
                  placeholder="Search device serial, school or district..."
                  value={deviceSearchTerm}
                  onChange={(e) => setDeviceSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                      <td className="p-3 font-medium max-w-[200px] truncate" title={dev.schoolName}>{dev.schoolName}</td>
                      <td className="p-3">{dev.district} / {dev.block}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{formatHours(dev.upTimeHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatHours(dev.activeAppHours)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{formatHours(dev.idleHours)}</td>
                      <td className="p-3 text-center font-bold">{dev.activeUtilPerc.toFixed(1)}%</td>
                      <td className="p-3 text-right font-mono font-bold text-sky-600 dark:text-sky-400">{formatHours(dev.jgurujiHours)}</td>
                      <td className="p-3 font-medium max-w-[120px] truncate" title={dev.topAppName}>{dev.topAppName}</td>
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
                      <td colSpan="10" className="p-6 text-center text-slate-500">No devices found matching the filter criteria.</td>
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

    </div>
  );
};

export default EduStatApplication;
