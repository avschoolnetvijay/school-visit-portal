import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icons } from './Icons';
import { parseDateRobust, formatDate } from '../utils';

const levenshteinDistance = (str1, str2) => {
  const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
};

const isFuzzyMatch = (t, kw) => {
  if (t === kw) return true;
  if (kw.length <= 3 || t.length <= 3) return t === kw;
  if (t.length >= 4 && (t.includes(kw) || kw.includes(t))) return true;
  const limit = kw.length <= 4 ? 1 : 2;
  const dist = levenshteinDistance(t, kw);
  return dist <= limit;
};

const tokenizeAndClean = (text) => {
  if (!text) return [];
  const cleaned = text.toLowerCase()
    .replace(/[^a-z0-9\s\u0900-\u097F]/g, ' ')
    .split(/\s+/);
  
  const stopwords = new Set([
    'show', 'me', 'the', 'list', 'please', 'kya', 'hai', 'ko', 'ki', 'ka', 'ke', 'de', 'do', 'karo', 
    'is', 'on', 'in', 'at', 'this', 'for', 'with', 'about', 'of', 'and', 'or', 'a', 'an', 'are', 'was',
    'were', 'be', 'been', 'being', 'to', 'from', 'by', 'se', 'tha', 'thi', 'the', 'batao', 'dikhaye',
    'dikhao', 'kijiye', 'krna', 'chahiye', 'hai'
  ]);

  return cleaned.filter(t => t.length > 0 && !stopwords.has(t));
};

const SYNONYMS = {
  best: ['best', 'top', 'good', 'achha', 'leader', 'ranking', 'highest', 'no1', 'no 1', 'super', 'first', 'behter', 'behtar', 'badiya', 'badhiya'],
  poor: ['poor', 'worst', 'kharab', 'low', 'weak', 'kamjor', 'kamzore', 'lazzy', 'lazy', 'inactive', 'slow', 'improvement', 'niche', 'bad', 'down', 'bekar'],
  smart: ['smart', 'tv', 'projector', 'smarttv', 'television', 'digital'],
  school: ['school', 'schools', 'shcool', 'scholl', 'ums', 'hs', 'ms', 'vidyalaya', 'schoo', 'schll'],
  cc: ['cc', 'def', 'coordinator', 'coordinators', 'instructor', 'instructors', 'visitor', 'visitors', 'manpower', 'personnel', 'staff', 'cc name', 'cc list'],
  urgent: ['urgent', 'priority', 'visiting', 'visit', 'immediate', 'emergency', 'jaldi', 'important', 'jaruri', 'zaroori']
};

const getBestTokenMatch = (token) => {
  let bestCat = null;
  let maxScore = 0;

  Object.keys(SYNONYMS).forEach(cat => {
    SYNONYMS[cat].forEach(kw => {
      let score = 0;
      if (token === kw) {
        score = 3;
      } else if (token.length >= 4 && (token.includes(kw) || kw.includes(token))) {
        score = 2;
      } else if (kw.length > 3 && token.length > 3) {
        const limit = kw.length <= 4 ? 1 : 2;
        const dist = levenshteinDistance(token, kw);
        if (dist <= limit) {
          score = 1;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestCat = cat;
      }
    });
  });

  return { category: bestCat, score: maxScore };
};

const classifyQuery = (queryText) => {
  const tokens = tokenizeAndClean(queryText);

  let limit = 10;
  for (const t of tokens) {
    const num = parseInt(t, 10);
    if (!isNaN(num) && num > 0) {
      limit = num;
      break;
    }
  }

  const score = {
    bestSchool: 0,
    poorSchool: 0,
    bestCC: 0,
    poorCC: 0,
    urgentVisit: 0,
    bestSmartClass: 0
  };

  let hasBest = false;
  let hasPoor = false;
  let hasSmart = false;
  let hasSchool = false;
  let hasCC = false;
  let hasUrgent = false;

  tokens.forEach(t => {
    const match = getBestTokenMatch(t);
    if (match.score > 0) {
      if (match.category === 'best') hasBest = true;
      if (match.category === 'poor') hasPoor = true;
      if (match.category === 'smart') hasSmart = true;
      if (match.category === 'school') hasSchool = true;
      if (match.category === 'cc') hasCC = true;
      if (match.category === 'urgent') hasUrgent = true;
    }
  });

  if (hasBest && hasSchool && hasSmart) {
    score.bestSmartClass = 5;
  } else if (hasBest && hasSchool) {
    score.bestSchool = 4;
  } else if (hasPoor && hasSchool) {
    score.poorSchool = 4;
  } else if (hasBest && hasCC) {
    score.bestCC = 4;
  } else if (hasPoor && hasCC) {
    score.poorCC = 4;
  } else if (hasUrgent && (hasSchool || hasCC)) {
    score.urgentVisit = 4;
  } else if (hasUrgent) {
    score.urgentVisit = 2;
  }

  let bestCat = 'unknown';
  let maxVal = 0;
  Object.keys(score).forEach(cat => {
    if (score[cat] > maxVal) {
      maxVal = score[cat];
      bestCat = cat;
    }
  });

  return { category: bestCat, limit };
};

function Chatbot({
  schools = [],
  visits = [],
  jhpmsLab = [],
  edustat = [],
  manpower = [],
  startDate,
  endDate,
  selZones = [],
  selProjects = [],
  selDistricts = [],
  selBlocks = [],
  selCCs = [],
  ccNameMapping = {},
  workingDays,
  darkMode = false
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI Copilot. I analyze the portal database directly in your browser. All calculations are completely free, secure, and run locally.\n\nWhat would you like to know today?',
      timestamp: new Date(),
      chips: [
        'Show critical schools list',
        'Analyze visit coverage',
        'Total hardware usage hours',
        'Academic classes conducted',
        'List active CC/DEFs'
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean and parse helper functions
  const cleanUdise = (u) => {
    if (!u) return '';
    let s = String(u).trim();
    if (s.endsWith('.0')) {
      s = s.substring(0, s.length - 2);
    }
    return s;
  };

  const parseHours = (v) => {
    if (!v) return 0;
    const s = String(v);
    if (s.includes(':')) {
      const [h, m] = s.split(':');
      return (parseInt(h) || 0) + (parseInt(m) || 0) / 60;
    }
    return parseFloat(s) || 0;
  };

  // Compile base active weights and parameters
  const validWdays = Number(workingDays) > 0 ? Number(workingDays) : 22;
  const isJhpmsActive = jhpmsLab && jhpmsLab.length > 0;
  const isEdustatActive = edustat && edustat.length > 0;
  const isVisitActive = visits && visits.length > 0;
  const isManpowerActive = manpower && manpower.length > 0;

  // Active filters applied dataset (Filtered Data)
  const filteredSchools = useMemo(() => {
    let list = schools || [];
    if (selZones?.length) list = list.filter((s) => selZones.includes(s.zone));
    if (selProjects?.length) list = list.filter((s) => selProjects.includes(s.project_name));
    if (selDistricts?.length) list = list.filter((s) => selDistricts.includes(s.district));
    if (selBlocks?.length) list = list.filter((s) => selBlocks.includes(s.block));
    if (selCCs?.length) {
      list = list.filter((s) => {
        const name = s.visitor_name || s.visitorName || '';
        const resolved = ccNameMapping[name] || name;
        return selCCs.includes(resolved) || selCCs.includes(name);
      });
    }
    return list;
  }, [schools, selZones, selProjects, selDistricts, selBlocks, selCCs, ccNameMapping]);

  const activeUdises = useMemo(() => new Set(filteredSchools.map(s => cleanUdise(s.udise_code)).filter(Boolean)), [filteredSchools]);

  // Helper date parsed boundaries
  const parsedStartDate = useMemo(() => parseDateRobust(startDate), [startDate]);
  const parsedEndDate = useMemo(() => parseDateRobust(endDate), [endDate]);

  // Pre-index collections for performance
  const jhpmsIndexed = useMemo(() => {
    const map = {};
    const splitMap = {};
    jhpmsLab.forEach(row => {
      const udise = cleanUdise(row.udise || row.udise_code);
      if (!udise) return;
      
      const rawDate = row.visit_date || row.date;
      const d = parseDateRobust(rawDate);
      if (parsedStartDate && parsedEndDate && d) {
        if (d < parsedStartDate || d > parsedEndDate) return;
      }

      const cls = Number(row.no_of_classes || row.classes || 1) || 1;
      map[udise] = (map[udise] || 0) + cls;

      if (!splitMap[udise]) splitMap[udise] = { total: 0, ict: 0, smart: 0, mis: 0 };
      splitMap[udise].total += cls;

      const labType = String(row.labType || row.lab_type || '').toUpperCase();
      const subject = String(row.subject || '').toUpperCase();

      if (subject.split(/[^A-Z0-9]+/).includes('MIS')) {
        splitMap[udise].mis += cls;
      } else if (labType.includes('ICT') && subject.includes('COMPUTER')) {
        splitMap[udise].ict += cls;
      } else if (labType.includes('SMART')) {
        splitMap[udise].smart += cls;
      }
    });
    return { overall: map, splits: splitMap };
  }, [jhpmsLab, parsedStartDate, parsedEndDate]);

  const edustatIndexed = useMemo(() => {
    const map = {};
    edustat.forEach(e => {
      const udise = cleanUdise(e.udise_code || e.udise);
      if (!udise) return;

      const rawDate = e.date;
      const d = parseDateRobust(rawDate);
      if (parsedStartDate && parsedEndDate && d) {
        if (d < parsedStartDate || d > parsedEndDate) return;
      }

      const hrs = parseHours(e.total_used_hours || e.used_hours || e.hours || e.used);
      map[udise] = (map[udise] || 0) + hrs;
    });
    return map;
  }, [edustat, parsedStartDate, parsedEndDate]);

  const visitsIndexed = useMemo(() => {
    const map = {};
    visits.forEach(v => {
      const udise = cleanUdise(v.udise_code);
      if (!udise) return;

      const d = parseDateRobust(v.visit_date);
      if (parsedStartDate && parsedEndDate && d) {
        if (d < parsedStartDate || d > parsedEndDate) return;
      }

      const type = (v.visit_type || '').toLowerCase();
      if (!map[udise]) map[udise] = { total: 0, ict: 0, smart: 0, dates: new Set() };
      
      const dateStr = (v.visit_date || '').split('T')[0];
      if (dateStr && !map[udise].dates.has(dateStr)) {
        map[udise].dates.add(dateStr);
        map[udise].total++;
        if (type.includes('smart')) {
          map[udise].smart++;
        } else {
          map[udise].ict++; // fallback to ict visit count
        }
      }
    });
    return map;
  }, [visits, parsedStartDate, parsedEndDate]);

  const manpowerIndexed = useMemo(() => {
    const map = {};
    manpower.forEach(m => {
      const udise = cleanUdise(m.udise_code || m.udise);
      if (udise) map[udise] = m;
    });
    return map;
  }, [manpower]);

  // Compute school score averages for the filtered list (Filtered Context)
  const enrichedSchools = useMemo(() => {
    const maxJhpms = Math.max(1, ...Object.values(jhpmsIndexed.overall));
    const maxEdustat = Math.max(1, ...Object.values(edustatIndexed));

    return filteredSchools.map(s => {
      const udise = cleanUdise(s.udise_code);
      const schoolName = s.school_name || s.school || udise;
      
      const jClasses = jhpmsIndexed.overall[udise] || 0;
      const ictCls = jhpmsIndexed.splits[udise]?.ict || 0;
      const smartCls = jhpmsIndexed.splits[udise]?.smart || 0;
      const misCls = jhpmsIndexed.splits[udise]?.mis || 0;
      const edHours = edustatIndexed[udise] || 0;
      
      const vis = visitsIndexed[udise] || { total: 0, ict: 0, smart: 0 };
      const fVisits = vis.total;
      const monthlyTarget = s.monthly_target || 1;
      const targetVisits = monthlyTarget * 1; // standard scale

      const mp = manpowerIndexed[udise] || { status: 'Vacant', instructorName: '-' };
      const resolvedCC = ccNameMapping[s.visitor_name] || s.visitor_name || 'Unassigned';

      // Scores
      const jScore = isJhpmsActive ? Math.min(100, (jClasses / maxJhpms) * 100) : 0;
      const eScore = isEdustatActive ? Math.min(100, (edHours / maxEdustat) * 105) : 0;
      const vScore = isVisitActive ? (targetVisits > 0 ? Math.min(100, (fVisits / targetVisits) * 100) : 0) : 0;
      const mScore = isManpowerActive ? (mp.status === 'Active' || mp.status === 'WORKING' ? 100 : mp.status === 'Pending' ? 40 : 0) : 0;

      // Base composite 30-25-25-20 weights
      const compositeScore = (jScore * 0.3) + (eScore * 0.25) + (vScore * 0.25) + (mScore * 0.2);

      return {
        udise,
        schoolName,
        district: s.district || '-',
        block: s.block || '-',
        project: s.project_name || '-',
        visitorName: resolvedCC,
        jhpmsClasses: jClasses,
        ictClasses: ictCls,
        smartClasses: smartCls,
        misClasses: misCls,
        eduHours: edHours,
        fieldVisits: fVisits,
        ictVisits: vis.ict,
        smartVisits: vis.smart,
        targetVisits,
        compositeScore,
        instructorName: mp.instructorName || mp.instructor_name || mp.instructor || '-',
        instructorStatus: mp.status || 'Vacant'
      };
    });
  }, [filteredSchools, jhpmsIndexed, edustatIndexed, visitsIndexed, manpowerIndexed, ccNameMapping, isJhpmsActive, isEdustatActive, isVisitActive, isManpowerActive]);

  // NLP Parser Engine (Option A)
  const parseLocalQuery = (queryText) => {
    const q = queryText.toLowerCase().trim();
    const tokens = tokenizeAndClean(queryText);
    
    const isGlobalScope = q.includes('overall') || q.includes('pure') || q.includes('raw') || q.includes('total') || q.includes('database') || q.includes(' झारखंड') || q.includes('jharkhand');

    // 1. SPECIFIC SCHOOL UDISE OR NAME LOOKUP
    const udiseMatch = q.match(/\d{11}/);
    let targetSchool = null;

    if (udiseMatch) {
      const udiseStr = udiseMatch[0];
      targetSchool = enrichedSchools.find(s => cleanUdise(s.udise) === udiseStr);
    } else {
      const nameTokens = tokens.filter(t => 
        !SYNONYMS.best.some(kw => isFuzzyMatch(t, kw)) &&
        !SYNONYMS.poor.some(kw => isFuzzyMatch(t, kw)) &&
        !SYNONYMS.cc.some(kw => isFuzzyMatch(t, kw)) &&
        !SYNONYMS.school.some(kw => isFuzzyMatch(t, kw)) &&
        !SYNONYMS.urgent.some(kw => isFuzzyMatch(t, kw)) &&
        !SYNONYMS.smart.some(kw => isFuzzyMatch(t, kw))
      );

      if (nameTokens.length > 0) {
        let bestSchool = null;
        let maxOverlap = 0;
        enrichedSchools.forEach(s => {
          const sName = s.schoolName.toLowerCase();
          const overlap = nameTokens.filter(t => sName.includes(t)).length;
          if (overlap > maxOverlap) {
            maxOverlap = overlap;
            bestSchool = s;
          }
        });

        if (maxOverlap >= 1) {
          targetSchool = bestSchool;
        }
      }
    }

    if (targetSchool) {
      const totalIct = targetSchool.ictClasses || 0;
      const practicalPct = totalIct > 0 ? Math.round((targetSchool.practicalClasses / totalIct) * 100) : 0;
      const theoryPct = totalIct > 0 ? Math.round((targetSchool.theoryClasses / totalIct) * 100) : 0;

      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-teal-850 dark:text-teal-400 uppercase text-[10px] tracking-wider">🏫 School Report Card: {targetSchool.schoolName}</p>
          <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
            <div className="flex justify-between border-b dark:border-slate-800 pb-1.5 font-bold">
              <span>UDISE: <span className="font-mono text-gray-500 font-medium">{targetSchool.udise}</span></span>
              <span>Health Score: <span className={`font-black ${targetSchool.compositeScore >= 70 ? 'text-green-600' : targetSchool.compositeScore >= 40 ? 'text-amber-500' : 'text-rose-505'}`}>{Math.round(targetSchool.compositeScore)}%</span></span>
            </div>
            <div className="grid grid-cols-2 gap-2 leading-relaxed">
              <div><strong>Instructor:</strong> {targetSchool.instructorName}</div>
              <div><strong>Status:</strong> {targetSchool.instructorStatus}</div>
              <div><strong>Block:</strong> {targetSchool.block}</div>
              <div><strong>District:</strong> {targetSchool.district}</div>
            </div>
            <div className="border-t dark:border-slate-800 pt-2 grid grid-cols-2 gap-2 leading-relaxed text-[11px]">
              <div>🖥️ <strong>JHPMS Classes:</strong> {targetSchool.jhpmsClasses} (ICT: {targetSchool.ictClasses} | Smart: {targetSchool.smartClasses})</div>
              <div>📝 <strong>Theory/Practical:</strong> {theoryPct}% / {practicalPct}%</div>
              <div>💻 <strong>EduStat Hours:</strong> {targetSchool.eduHours.toFixed(1)} hrs</div>
              <div>👥 <strong>Field Visits:</strong> {targetSchool.fieldVisits} completed</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal italic">
            *Tip: Visit this school profile in School Search tab to check or submit its audit checklist!*
          </p>
        </div>
      );
    }

    // 2. SPECIFIC COORDINATOR (CC/DEF) LOOKUP
    const ccTokens = tokens.filter(t => 
      !SYNONYMS.best.some(kw => isFuzzyMatch(t, kw)) &&
      !SYNONYMS.poor.some(kw => isFuzzyMatch(t, kw)) &&
      !SYNONYMS.cc.some(kw => isFuzzyMatch(t, kw)) &&
      !SYNONYMS.school.some(kw => isFuzzyMatch(t, kw)) &&
      !SYNONYMS.urgent.some(kw => isFuzzyMatch(t, kw)) &&
      !SYNONYMS.smart.some(kw => isFuzzyMatch(t, kw))
    );

    let targetCC = null;
    if (ccTokens.length > 0) {
      const activeCCs = new Set(enrichedSchools.map(s => s.visitorName).filter(Boolean));
      let bestCC = null;
      let maxOverlap = 0;

      activeCCs.forEach(cc => {
        const ccLower = cc.toLowerCase();
        const overlap = ccTokens.filter(t => ccLower.includes(t)).length;
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          bestCC = cc;
        }
      });

      if (maxOverlap >= 1) {
        targetCC = bestCC;
      }
    }

    if (targetCC) {
      const ccSchools = enrichedSchools.filter(s => s.visitorName === targetCC);
      let sumClasses = 0;
      let sumHours = 0;
      let sumVisits = 0;
      let sumScores = 0;
      ccSchools.forEach(s => {
        sumClasses += s.jhpmsClasses;
        sumHours += s.eduHours;
        sumVisits += s.fieldVisits;
        sumScores += s.compositeScore;
      });
      const avgScore = ccSchools.length > 0 ? Math.round(sumScores / ccSchools.length) : 0;

      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-teal-850 dark:text-teal-400 uppercase text-[10px] tracking-wider">👤 Coordinator Report Card: {targetCC}</p>
          <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
            <div className="flex justify-between border-b dark:border-slate-800 pb-1.5 font-bold">
              <span>Schools Managed: {ccSchools.length}</span>
              <span>Avg Score: <span className={`font-black ${avgScore >= 70 ? 'text-green-600' : avgScore >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{avgScore}%</span></span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li>🎓 <strong>Classes Conducted:</strong> {sumClasses} classes</li>
              <li>💻 <strong>Total Device Sync Runtimes:</strong> {Math.round(sumHours)} Hours</li>
              <li>👥 <strong>Field Monitoring Visits:</strong> {sumVisits} completed</li>
            </ul>
            <div className="pt-1.5 border-t dark:border-slate-800">
              <span className="text-[9px] font-black uppercase text-gray-400 block mb-1">Constituent Schools List:</span>
              <div className="flex flex-wrap gap-1">
                {ccSchools.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-medium font-mono">{s.schoolName.substring(0, 15)}...</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. SEMANTIC QUERY CLASSIFICATIONS
    const classification = classifyQuery(q);
    const limit = classification.limit;

    // A. CATEGORY: BEST SMART CLASS SCHOOL
    if (classification.category === 'bestSmartClass') {
      const sorted = [...enrichedSchools].sort((a, b) => b.smartClasses - a.smartClasses);
      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-blue-700 dark:text-blue-400 uppercase text-[10px] tracking-wider">📺 Top {limit} Smart Class Schools</p>
          <div className="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
            <table className="min-w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 font-bold border-b dark:border-slate-800">
                  <th className="p-2.5">School Name</th>
                  <th className="p-2.5 text-center">Smart Classes</th>
                  <th className="p-2.5 text-center">CC Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {sorted.slice(0, limit).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-2.5 truncate max-w-[150px] font-medium">{s.schoolName}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-blue-600 dark:text-blue-400">{s.smartClasses}</td>
                    <td className="p-2.5 text-center truncate max-w-[100px]">{s.visitorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // B. CATEGORY: BEST SCHOOL
    if (classification.category === 'bestSchool') {
      const sorted = [...enrichedSchools].sort((a, b) => b.compositeScore - a.compositeScore);
      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-green-700 dark:text-green-400 uppercase text-[10px] tracking-wider">🥇 Top {limit} Best Performing Schools</p>
          <div className="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
            <table className="min-w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 font-bold border-b dark:border-slate-800">
                  <th className="p-2.5">School Name</th>
                  <th className="p-2.5 text-center">Health Score</th>
                  <th className="p-2.5 text-center">CC Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {sorted.slice(0, limit).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-2.5 truncate max-w-[150px] font-medium">{s.schoolName}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-green-600 dark:text-green-450">{Math.round(s.compositeScore)}%</td>
                    <td className="p-2.5 text-center truncate max-w-[100px]">{s.visitorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // C. CATEGORY: POOR SCHOOL
    if (classification.category === 'poorSchool') {
      const sorted = [...enrichedSchools].sort((a, b) => a.compositeScore - b.compositeScore);
      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-red-750 dark:text-rose-450 uppercase text-[10px] tracking-wider">📉 Weakest / Need Improvement Schools</p>
          <div className="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
            <table className="min-w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 font-bold border-b dark:border-slate-800">
                  <th className="p-2.5">School Name</th>
                  <th className="p-2.5 text-center">Health Score</th>
                  <th className="p-2.5 text-center">CC Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {sorted.slice(0, limit).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-2.5 truncate max-w-[150px] font-medium">{s.schoolName}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-red-600 dark:text-red-400">{Math.round(s.compositeScore)}%</td>
                    <td className="p-2.5 text-center truncate max-w-[100px]">{s.visitorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // D. CATEGORY: BEST CC
    if (classification.category === 'bestCC') {
      const ccMap = {};
      enrichedSchools.forEach(s => {
        const cc = s.visitorName;
        if (!ccMap[cc]) ccMap[cc] = { name: cc, totalScore: 0, count: 0 };
        ccMap[cc].totalScore += s.compositeScore;
        ccMap[cc].count++;
      });
      const sortedCC = Object.values(ccMap)
        .map(cc => ({ name: cc.name, avgScore: Math.round(cc.totalScore / cc.count) }))
        .sort((a, b) => b.avgScore - a.avgScore);

      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-green-700 dark:text-green-400 uppercase text-[10px] tracking-wider">🏆 Best Performing Coordinators (CC/DEF)</p>
          <div className="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
            <table className="min-w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 font-bold border-b dark:border-slate-800">
                  <th className="p-2.5">Coordinator Name</th>
                  <th className="p-2.5 text-center">Average Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {sortedCC.slice(0, limit).map((cc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-2.5 font-medium">👤 {cc.name}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-green-600 dark:text-green-455">{cc.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // E. CATEGORY: POOR CC
    if (classification.category === 'poorCC') {
      const ccMap = {};
      enrichedSchools.forEach(s => {
        const cc = s.visitorName;
        if (!ccMap[cc]) ccMap[cc] = { name: cc, totalScore: 0, count: 0 };
        ccMap[cc].totalScore += s.compositeScore;
        ccMap[cc].count++;
      });
      const sortedCC = Object.values(ccMap)
        .map(cc => ({ name: cc.name, avgScore: Math.round(cc.totalScore / cc.count) }))
        .sort((a, b) => a.avgScore - b.avgScore);

      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-red-750 dark:text-rose-400 uppercase text-[10px] tracking-wider">🚨 Weakest Performing Coordinators (CC/DEF)</p>
          <div className="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
            <table className="min-w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 font-bold border-b dark:border-slate-800">
                  <th className="p-2.5">Coordinator Name</th>
                  <th className="p-2.5 text-center">Average Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {sortedCC.slice(0, limit).map((cc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-2.5 font-medium">👤 {cc.name}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-red-600 dark:text-red-405">{cc.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // F. CATEGORY: PRIORITY / URGENT VISIT
    if (classification.category === 'urgentVisit') {
      const prioritySchools = enrichedSchools.map(s => {
        let pScore = 0;
        const schoolDevices = edustatMaster.filter(d => String(d.udise).trim() === s.udise);
        const deviceHoursMap = {};
        const schoolEdustatLogs = filteredEdustatRange.filter(e => String(e.udise).trim() === s.udise);
        schoolEdustatLogs.forEach(e => {
          const hours = e.hours !== undefined ? Number(e.hours) : parseFloat(getVal(e, 'hours') || 0);
          const serial = String(e.serial || '').trim();
          if (serial) deviceHoursMap[serial] = (deviceHoursMap[serial] || 0) + hours;
        });
        const unsyncedCount = schoolDevices.filter(d => (deviceHoursMap[d.serial] || 0) === 0).length;

        if (unsyncedCount > 0) pScore += 3;
        if (s.compositeScore < 30) pScore += 3;
        if (s.jhpmsClasses === 0) pScore += 2;

        return { ...s, priorityScore: pScore, offlineCount: unsyncedCount };
      }).sort((a, b) => b.priorityScore - a.priorityScore);

      return (
        <div className="space-y-3 font-sans text-xs">
          <p className="font-extrabold text-amber-700 dark:text-amber-400 uppercase text-[10px] tracking-wider">⚠️ Priority / Urgent Visit Recommended List</p>
          <div className="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
            <table className="min-w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-855 font-bold border-b dark:border-slate-800">
                  <th className="p-2.5">School Name</th>
                  <th className="p-2.5 text-center">Offline CPUs</th>
                  <th className="p-2.5 text-center">Score</th>
                  <th className="p-2.5 text-center">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {prioritySchools.slice(0, limit).map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-2.5 truncate max-w-[150px] font-medium">{s.schoolName}</td>
                    <td className="p-2.5 text-center font-bold text-rose-600 font-mono">{s.offlineCount}</td>
                    <td className="p-2.5 text-center font-mono">{Math.round(s.compositeScore)}%</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${s.priorityScore >= 5 ? 'bg-red-105 text-red-700 dark:bg-red-950/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'}`}>
                        {s.priorityScore >= 5 ? '🚨 High' : '⚡ Medium'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // G. OLD RUNTIME HANDLERS (UNCHANGED KEYWORD MATCHERS AS FALLBACK)
    if (q.includes('visit') || q.includes('monitoring') || q.includes(' cc ') || q.includes('def') || classification.category === 'visitAnalysis') {
      let totalCompleted = 0;
      let totalTarget = 0;
      let visitedCount = 0;

      if (isGlobalScope) {
        schools.forEach(s => {
          totalTarget += (s.monthly_target || 1);
          if (s.uniqueVisits > 0) visitedCount++;
        });
        totalCompleted = visits.length;
      } else {
        enrichedSchools.forEach(s => {
          totalTarget += s.targetVisits || 0;
          totalCompleted += s.fieldVisits || 0;
          if (s.fieldVisits > 0) visitedCount++;
        });
      }

      const percent = totalTarget > 0 ? Math.round((visitedCount / (isGlobalScope ? schools.length : enrichedSchools.length)) * 100) : 0;
      
      return (
        <div className="space-y-2">
          <p className="font-bold text-teal-800 dark:text-teal-400 uppercase text-[10px] tracking-wider">📈 Field Visit & Monitoring Summary</p>
          <p>Based on the **{isGlobalScope ? 'Global Portal Roster' : 'Active Filtered Scope'}**:</p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>**Total Schools Evaluated:** {isGlobalScope ? schools.length : enrichedSchools.length} schools</li>
            <li>**Schools Visited (≥ 1 Visit):** {visitedCount} ({percent}% Coverage)</li>
            <li>**Total Completed Visits:** {totalCompleted} visits</li>
            <li>**Estimated Targets:** {totalTarget} target visits</li>
          </ul>
        </div>
      );
    }

    if (q.includes('hour') || q.includes('runtime') || q.includes('edustat') || q.includes('device') || q.includes('computer') || classification.category === 'deviceHours') {
      let sumHours = 0;
      if (isGlobalScope) {
        edustat.forEach(e => {
          sumHours += parseHours(e.total_used_hours || e.used_hours || e.hours || e.used);
        });
      } else {
        enrichedSchools.forEach(s => {
          sumHours += s.eduHours || 0;
        });
      }

      return (
        <div className="space-y-2">
          <p className="font-bold text-[#d97706] uppercase text-[10px] tracking-wider">💻 Hardware Usage Summary (EduStat)</p>
          <p>The total recorded computer runtimes in the **{isGlobalScope ? 'Entire Uploaded Database' : 'Active Filtered Scope'}** is:</p>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{Math.round(sumHours).toLocaleString('en-IN')} <span className="text-sm font-semibold">Hours</span></p>
        </div>
      );
    }

    if (q.includes('class') || q.includes('conduct') || q.includes('jhpms') || q.includes('teaching') || q.includes('lecture') || classification.category === 'classesConducted') {
      let sumICT = 0;
      let sumSmart = 0;
      let sumMIS = 0;

      if (isGlobalScope) {
        jhpmsLab.forEach(row => {
          const cls = Number(row.no_of_classes || row.classes || 1) || 1;
          const labType = String(row.labType || row.lab_type || '').toUpperCase();
          const subject = String(row.subject || '').toUpperCase();

          if (subject.split(/[^A-Z0-9]+/).includes('MIS')) {
            sumMIS += cls;
          } else if (labType.includes('ICT') && subject.includes('COMPUTER')) {
            sumICT += cls;
          } else if (labType.includes('SMART')) {
            sumSmart += cls;
          }
        });
      } else {
        enrichedSchools.forEach(s => {
          sumICT += s.ictClasses || 0;
          sumSmart += s.smartClasses || 0;
          sumMIS += s.misClasses || 0;
        });
      }

      const totalCls = sumICT + sumSmart + sumMIS;

      return (
        <div className="space-y-2.5">
          <p className="font-bold text-teal-800 dark:text-teal-400 uppercase text-[10px] tracking-wider">🏫 JHPMS Classes Conducted Summary</p>
          <p>Total academic classes conducted in the **{isGlobalScope ? 'Overall database' : 'Active Filtered Scope'}**:</p>
          <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
            <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-xs text-slate-400 block uppercase font-bold">ICT (Comp)</span>
              <strong className="text-lg font-black text-teal-800 dark:text-teal-400">{sumICT}</strong>
            </div>
            <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-xs text-slate-400 block uppercase font-bold">Smart Class</span>
              <strong className="text-lg font-black text-blue-600 dark:text-blue-400">{sumSmart}</strong>
            </div>
            <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-xs text-slate-400 block uppercase font-bold">MIS Work</span>
              <strong className="text-lg font-black text-amber-700 dark:text-amber-500">{sumMIS}</strong>
            </div>
          </div>
          <p className="text-xs font-semibold text-right text-slate-600 dark:text-slate-400">Total Sum: {totalCls} Classes</p>
        </div>
      );
    }

    if (q.includes('cc') || q.includes('def') || q.includes('manpower') || q.includes('coordinator') || q.includes('team') || classification.category === 'manpowerList') {
      const activeCCSet = new Set();
      const vacantCCSet = new Set();

      manpower.forEach(m => {
        const name = m.instructorName || m.instructor_name || m.instructor || 'Unassigned';
        const resolved = ccNameMapping[name] || name;
        if (m.status === 'Active' || m.status === 'WORKING') {
          activeCCSet.add(resolved);
        } else {
          vacantCCSet.add(resolved);
        }
      });

      return (
        <div className="space-y-2">
          <p className="font-bold text-teal-800 dark:text-teal-400 uppercase text-[10px] tracking-wider">👥 CC/DEF Manpower Status</p>
          <p>Based on the current Roster Directory:</p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>**Total Active CC/DEFs:** {activeCCSet.size} unique members</li>
            <li>**Vacant/Pending CC Positions:** {vacantCCSet.size} posts</li>
          </ul>
        </div>
      );
    }

    let matchedBlock = null;
    let matchedProject = null;

    const allBlocksInDataset = new Set(schools.map(s => s.block).filter(Boolean));
    for (const block of allBlocksInDataset) {
      if (q.includes(block.toLowerCase())) {
        matchedBlock = block;
        break;
      }
    }

    const allProjectsInDataset = new Set(schools.map(s => s.project_name).filter(Boolean));
    for (const proj of allProjectsInDataset) {
      if (q.includes(proj.toLowerCase())) {
        matchedProject = proj;
        break;
      }
    }

    if (matchedBlock) {
      const blockSchools = enrichedSchools.filter(s => s.block === matchedBlock);
      if (blockSchools.length === 0) {
        return <p>📍 **Block found: "{matchedBlock}"**, but no schools match the current sidebar filter scope.</p>;
      }

      let sumClasses = 0;
      let sumHours = 0;
      let sumVisits = 0;
      let sumScores = 0;
      blockSchools.forEach(s => {
        sumClasses += s.jhpmsClasses;
        sumHours += s.eduHours;
        sumVisits += s.fieldVisits;
        sumScores += s.compositeScore;
      });

      const avgScore = Math.round(sumScores / blockSchools.length);

      return (
        <div className="space-y-2">
          <p className="font-bold text-teal-800 dark:text-teal-400 uppercase text-[10px] tracking-wider">📍 Block Report Card: {matchedBlock}</p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>**Total Schools in Block:** {blockSchools.length} schools</li>
            <li>**Academic Classes Conducted:** {sumClasses} classes</li>
            <li>**Total EduStat Runtime:** {Math.round(sumHours)} Hours</li>
            <li>**Field Monitoring Visits:** {sumVisits} completed</li>
            <li>**Composite Block Score:** <strong className={avgScore >= 70 ? 'text-green-600' : avgScore >= 40 ? 'text-amber-500' : 'text-red-500'}>{avgScore}%</strong></li>
          </ul>
        </div>
      );
    }

    if (matchedProject) {
      const projSchools = enrichedSchools.filter(s => s.project === matchedProject);
      if (projSchools.length === 0) {
        return <p>💼 **Project found: "{matchedProject}"**, but no schools match the current sidebar filter scope.</p>;
      }

      let sumClasses = 0;
      let sumHours = 0;
      let sumVisits = 0;
      let sumScores = 0;
      projSchools.forEach(s => {
        sumClasses += s.jhpmsClasses;
        sumHours += s.eduHours;
        sumVisits += s.fieldVisits;
        sumScores += s.compositeScore;
      });

      const avgScore = Math.round(sumScores / projSchools.length);

      return (
        <div className="space-y-2">
          <p className="font-bold text-teal-800 dark:text-teal-400 uppercase text-[10px] tracking-wider">💼 Project Performance Card: {matchedProject}</p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>**Total Schools in Project:** {projSchools.length} schools</li>
            <li>**Academic Classes Conducted:** {sumClasses} classes</li>
            <li>**Total EduStat Runtime:** {Math.round(sumHours)} Hours</li>
            <li>**Field Monitoring Visits:** {sumVisits} completed</li>
            <li>**Average Project Score:** <strong className={avgScore >= 70 ? 'text-green-600' : avgScore >= 40 ? 'text-amber-500' : 'text-red-500'}>{avgScore}%</strong></li>
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p>🤔 **I am not sure I understand that query.** I run locally in your browser. </p>
        <p className="text-xs text-slate-500 font-medium">Try asking queries like:</p>
        <div className="flex flex-wrap gap-1.5 py-1">
          {['top 10 schools', 'best cc', 'poor def list', 'priority visit school', 'UMS Mohra stats', 'Vijay Kumar CC summary'].map((kw, i) => (
            <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-teal-850 dark:text-teal-400">{kw}</span>
          ))}
        </div>
      </div>
    );
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const newMessages = [
      ...messages,
      { sender: 'user', text, timestamp: new Date() }
    ];

    setMessages(newMessages);
    setInputVal('');

    // Trigger local NLP calculations after brief bot thinking state delay
    setTimeout(() => {
      const parsedAns = parseLocalQuery(text);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: parsedAns,
          timestamp: new Date()
        }
      ]);
    }, 350);
  };

  return (
    <div className={`p-4 md:p-6 space-y-5 font-sans select-none animate-fade-in ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold font-serif text-teal-900 dark:text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Icons.Robot className="w-6 h-6 animate-bounce" /> AI Copilot Analytics Chatbot
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Query the active dashboard database using local Natural Language Processing (NLP). Safe, private, and zero API costs.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 font-mono tracking-wider">
          Local Engine Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        
        {/* LEFT WORKSTATION STATUS SIDEBAR */}
        <div className="lg:col-span-1 space-y-4 font-sans no-print">
          
          <div className="portal-card bg-slate-50/50 dark:bg-slate-900/50 p-4 border border-slate-200/50 dark:border-slate-800/50 rounded-xl space-y-3 shadow-inner">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Icons.Reports className="w-3.5 h-3.5" /> Database Index
            </h3>
            <div className="space-y-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-350">
              <div className="flex justify-between">
                <span>Schools Indexed:</span>
                <span className="font-mono text-teal-700">{schools.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Scope:</span>
                <span className="font-mono text-blue-600">{enrichedSchools.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Visits Logged:</span>
                <span className="font-mono text-purple-600">{visits.length}</span>
              </div>
              <div className="flex justify-between">
                <span>JHPMS Classes:</span>
                <span className="font-mono text-emerald-600">{jhpmsLab.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Hardware Logins:</span>
                <span className="font-mono text-amber-600">{edustat.length}</span>
              </div>
            </div>
          </div>

          <div className="portal-card bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Icons.Plan className="w-3.5 h-3.5" /> Suggested Questions
            </h3>
            <div className="flex flex-col gap-1.5 text-left text-xs">
              {[
                'Show critical schools list',
                'What are overall visits?',
                'Academic classes conducted',
                'Device usage runtimes',
                'Jamua block stats'
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/20 dark:hover:bg-slate-850 border dark:border-slate-800/40 text-left font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
                >
                  ❓ {q}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT MAIN CHAT AREA */}
        <div className="lg:col-span-3 portal-card bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 flex flex-col h-[520px] rounded-2xl justify-between shadow-xl">
          
          {/* MESSAGES LOG WORKSPACE */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start animate-fade-in ${
                  msg.sender === 'user' ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border select-none ${
                  msg.sender === 'user'
                    ? 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-950/30'
                    : 'bg-teal-100 border-teal-200 text-teal-800 dark:bg-teal-950/30'
                }`}>
                  {msg.sender === 'user' ? <Icons.Users className="w-4 h-4" /> : <Icons.Robot className="w-4 h-4" />}
                </div>

                {/* Bubble box */}
                <div className="max-w-[75%] space-y-2">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border font-sans ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white border-blue-700 rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm'
                  }`}>
                    {typeof msg.text === 'string' ? (
                      <p className="whitespace-pre-line font-sans">{msg.text}</p>
                    ) : (
                      msg.text
                    )}
                  </div>
                  
                  {/* Assistant Suggested Quick Chips */}
                  {msg.chips && (
                    <div className="flex flex-wrap gap-1.5 pt-1 justify-start">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[10px] bg-teal-800/10 hover:bg-teal-800/25 border border-teal-800/15 text-teal-900 dark:text-teal-400 font-bold px-2.5 py-1 rounded-full transition-all duration-150 animate-fade-in hover:scale-105"
                        >
                          ⚡ {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 font-mono block select-none px-1">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR PANEL */}
          <div className="border-t border-slate-150 dark:border-slate-800 pt-3.5 mt-2.5 flex items-center gap-2 no-print">
            <input
              type="text"
              placeholder="Ask me something about critical schools, class status, or CC visits..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputVal);
              }}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-sans text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            <button
              onClick={() => handleSendMessage(inputVal)}
              className="bg-teal-700 hover:bg-teal-800 text-white p-2.5 rounded-xl shadow-md border border-teal-600 transition hover:scale-105 active:scale-95"
              title="Send Prompt"
            >
              <Icons.Home className="w-4 h-4 rotate-90" /> {/* rotated home acts as send arrow */}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default React.memo(Chatbot);
