import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Target, 
  Briefcase, 
  Settings, 
  Search, 
  Bell, 
  Trophy, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  LogOut,
  Sparkles,
  Bot
} from 'lucide-react';
import AdaptiveRoadmap from './AdaptiveRoadmap';
import CareerPathView from './CareerPathView';
import AITutorChat from './AITutorChat';
import SettingsView from './SettingsView';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const PersonalizedLearningPage = ({ onClose, onReanalyze, aiResult: freshResult }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(!freshResult);
  const [data, setData] = useState(freshResult || null);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  useEffect(() => {
    if (freshResult || !user) return;
    (async () => {
      try {
        const sessionsRef = collection(db, 'results', user.uid, 'sessions');
        const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setData(snap.docs[0].data());
        } else {
          onReanalyze?.();
        }
      } catch (e) {
        console.error('[Dashboard] Firestore fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, freshResult, onReanalyze]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.aiOutput) return null;

  const ai = data.aiOutput;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const avgScore = ai.subjectScores?.length 
    ? Math.round(ai.subjectScores.reduce((a, b) => a + (Number(b.score) || 0), 0) / ai.subjectScores.length)
    : 0;

  // Process data for Mistake Distribution Pie Chart
  const mistakeData = ai.learningIssues?.length > 0 
    ? ai.learningIssues.map(iss => ({
        name: iss.type,
        value: iss.severity === 'high' ? 3 : iss.severity === 'medium' ? 2 : 1
      }))
    : [{ name: 'No Major Issues', value: 1 }];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200 font-sans flex text-sm selection:bg-indigo-500/30">
      
      {/* ── LEFT SIDEBAR (FIXED) ── */}
      <aside className="w-64 bg-[#111116] border-r border-[#ffffff0A] flex flex-col hidden md:flex sticky top-0 h-screen z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Zap size={18} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">Smart AI</span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          {[
            { id: 'Dashboard', icon: LayoutDashboard },
            { id: 'Roadmap', icon: Target },
            { id: 'Career Path', icon: Briefcase },
            { id: 'AI Tutor', icon: Sparkles },
            { id: 'Settings', icon: Settings },
          ].map(m => (
            <button 
              key={m.id} 
              onClick={() => setActiveMenu(m.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeMenu === m.id ? 'bg-[#1C1C24] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-[#ffffff05]'
              }`}>
              <m.icon size={18} className={activeMenu === m.id ? 'text-indigo-400' : ''} /> 
              {m.id}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#ffffff0A]">
          <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium">
            <LogOut size={18} /> Exit Dashboard
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        
        {/* ── TOP SECTION ── */}
        <header className="px-8 py-6 flex items-end justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-10 border-b border-[#ffffff0A]">
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Hello, {displayName}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {activeMenu === 'Roadmap' ? "Here is your adaptive learning sequencer designed by AI." : "Here's your learning intelligence overview."}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 bg-[#111116] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-[#ffffff0A] placeholder-gray-500 transition-all" 
              />
            </div>
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0A0A0F]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md border border-[#ffffff10] cursor-pointer hover:opacity-90 transition-opacity">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          
          {activeMenu === 'Roadmap' ? (
            <AdaptiveRoadmap aiResult={data.aiOutput} user={user} />
          ) : activeMenu === 'Career Path' ? (
            <CareerPathView aiResult={data.aiOutput} />
          ) : activeMenu === 'AI Tutor' ? (
            <AITutorChat aiResult={data.aiOutput} />
          ) : activeMenu === 'Settings' ? (
            <SettingsView user={user} inputData={data.inputData} />
          ) : (
            <>
              {/* ── ROW 1: SUMMARY CARDS ── */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#111116] rounded-2xl p-5 border border-[#ffffff0A] flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                    <Trophy size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Overall Score</p>
                    <p className="text-xl font-bold text-white">{avgScore}%</p>
                  </div>
                </div>
                <div className="bg-[#111116] rounded-2xl p-5 border border-[#ffffff0A] flex items-center gap-4 hover:border-green-500/30 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center shrink-0">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Strong Area</p>
                    <p className="text-xl font-bold text-white truncate max-w-[140px]">{ai.strongSubjects?.[0]?.subject || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-[#111116] rounded-2xl p-5 border border-[#ffffff0A] flex items-center gap-4 hover:border-orange-500/30 transition-colors">
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Weak Area</p>
                    <p className="text-xl font-bold text-white truncate max-w-[140px]">{ai.weakSubjects?.[0]?.subject || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-[#111116] rounded-2xl p-5 border border-[#ffffff0A] flex items-center gap-4 hover:border-purple-500/30 transition-colors">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                    <Zap size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Learning Pace</p>
                    <p className="text-xl font-bold text-white capitalize">{ai.learningProfile?.consistencyLevel || 'Moderate'}</p>
                  </div>
                </div>
              </section>

              {/* ── ROW 2: CHART SECTION ── */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111116] rounded-2xl p-6 border border-[#ffffff0A]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-white">Subject Performance</h2>
                    <button onClick={onReanalyze} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">Update Data</button>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ai.subjectScores || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#1C1C24', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={24}>
                          {(ai.subjectScores || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#111116] rounded-2xl p-6 border border-[#ffffff0A] flex flex-col">
                  <h2 className="font-bold text-white mb-6">Mistake Distribution</h2>
                  <div className="flex-1 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mistakeData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {mistakeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1C1C24', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-white">{ai.learningIssues?.length || 0}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Issues</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── ROW 3: AI INSIGHTS ── */}
              <section className="bg-[#111116] rounded-2xl p-8 border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="text-indigo-400" size={20} />
                  <h2 className="font-bold text-white text-lg">AI Insights</h2>
                </div>
                <p className="text-gray-300 leading-relaxed max-w-5xl text-[15px]">
                  {ai.insights?.overallAnalysis || "We are still gathering enough data to provide deep insights. Complete more sessions to unlock comprehensive intelligence."}
                </p>
              </section>

              {/* ── ROW 4: ACTION PLAN ── */}
              <section>
                <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                  <Target size={18} className="text-purple-400" /> Action Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(ai.recommendedFocus || []).slice(0, 3).map((plan, idx) => (
                    <div key={idx} className="bg-[#111116] rounded-2xl p-6 border border-[#ffffff0A] hover:-translate-y-1 transition-transform duration-300">
                      <div className="w-8 h-8 rounded-full bg-[#1C1C24] flex items-center justify-center text-xs font-bold text-white mb-4 border border-[#ffffff10]">
                        0{idx + 1}
                      </div>
                      <h3 className="font-bold text-white mb-2">{plan.subject}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed border-b border-[#ffffff0A] pb-4 mb-4">
                        {plan.reason}
                      </p>
                      <ul className="space-y-2">
                        {(plan.actionPlan || ['Review standard syllabus', 'Practice weak areas']).map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2 text-[11px] text-gray-300">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── ROW 5: SMART RECOMMENDATIONS ── */}
              <section className="pb-8">
                <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                  <BookOpen size={18} className="text-green-400" /> Smart Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#111116] rounded-2xl p-6 border border-[#ffffff0A]">
                    <h3 className="font-bold text-white mb-1">Study Materials</h3>
                    <p className="text-xs text-gray-400 mb-4">Curated based on your learning style.</p>
                    <button className="w-full py-2.5 rounded-lg bg-[#1C1C24] hover:bg-[#252530] text-sm font-medium transition-colors border border-[#ffffff0A]">
                      View Resources
                    </button>
                  </div>
                  <div className="bg-[#111116] rounded-2xl p-6 border border-[#ffffff0A]">
                    <h3 className="font-bold text-white mb-1">Practice Questions</h3>
                    <p className="text-xs text-gray-400 mb-4">Targeting your key weakness: {ai.weakSubjects?.[0]?.subject || 'N/A'}</p>
                    <button className="w-full py-2.5 rounded-lg bg-[#1C1C24] hover:bg-[#252530] text-sm font-medium transition-colors border border-[#ffffff0A]">
                      Start Practice
                    </button>
                  </div>
                  <div className="bg-[#111116] rounded-2xl p-6 border border-[#ffffff0A]">
                    <h3 className="font-bold text-white mb-1">Career Alignments</h3>
                    <p className="text-xs text-gray-400 mb-4">Matching: {ai.careerSuggestions?.[0]?.career || 'Discover roles'}</p>
                    <button className="w-full py-2.5 rounded-lg bg-[#1C1C24] hover:bg-[#252530] text-sm font-medium transition-colors border border-[#ffffff0A]">
                      Explore Careers
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default PersonalizedLearningPage;
