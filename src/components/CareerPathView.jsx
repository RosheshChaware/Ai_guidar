import React, { useState } from 'react';
import { 
  Briefcase, ChevronRight, Loader2, ArrowLeft, TrendingUp, AlertTriangle, 
  Building2, Target, BookOpen, Layers, ChevronDown, ChevronUp, CheckCircle, 
  Zap, MonitorPlay, Library, Video, BookText
} from 'lucide-react';

const Accordion = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#1C1C24] border border-[#ffffff05] rounded-xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5 bg-[#1C1C24] hover:bg-[#ffffff0a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-white font-bold text-[15px] tracking-wide">{title}</h3>
        </div>
        <div className="text-gray-500">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="p-5 border-t border-[#ffffff05] bg-[#111116]/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const CareerPathView = ({ aiResult }) => {
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  const careers = aiResult?.careerSuggestions || [
    { career: 'Undecided / Exploring', matchScore: 100, reason: 'Take a few subjects to see what sticks!' }
  ];

  const handleSelectCareer = async (careerName) => {
    setSelectedCareer(careerName);
    setLoading(true);
    setDetailData(null);
    try {
      const res = await fetch('http://localhost:5000/api/v1/career/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: careerName, userContext: aiResult })
      });
      
      const DEV_MODE = true;
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`[API ERROR /career/details] Status: ${res.status}`, errorData);
        if (DEV_MODE) {
           console.warn("DEV_MODE active: Using fallback mock career data.");
           setDetailData({
             overview: "This is a highly demanding role involving logic, architecture, and deployment pipelines. (DEV_MODE FALLBACK)",
             successRate: "65%", failureRate: "35%", competition: "High", averageSalary: "₹10LPA - ₹25LPA", growthPotential: "20% YoY",
             topCompanies: ["TechCorp", "Innovate.io", "CloudSystems"],
             roadmapSteps: ["Learn Fundamentals", "Build Portfolios", "Apply for internships"],
             technicalSkills: ["Programming", "System Design"], softSkills: ["Communication", "Agile"],
             learningResources: ["YouTube Tech Channel", "Coursera Dev Certificate", "Cracking the Code Interview Book"]
           });
           return;
        }
        window.alert(`Error: ${errorData.error || 'Something went wrong. Check console.'}`);
        return;
      }
      
      const data = await res.json();
      setDetailData(data);
    } catch (err) {
      console.error('[Network/Parsing Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const sortResources = (resources) => {
    const vids = [], courses = [], books = [];
    (resources || []).forEach(r => {
      const l = r.toLowerCase();
      if(l.includes('youtube') || l.includes('video') || l.includes('channel')) vids.push(r);
      else if(l.includes('course') || l.includes('certificat') || l.includes('coursera') || l.includes('udemy')) courses.push(r);
      else books.push(r);
    });
    return { vids, courses, books };
  };

  if (selectedCareer) {
    const rSorted = detailData ? sortResources(detailData.learningResources) : null;
    const shortOverview = detailData?.overview?.length > 180 ? detailData.overview.substring(0, 180) + "..." : detailData?.overview;

    return (
      <div className="flex flex-col gap-6 min-h-[calc(100vh-140px)] animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => setSelectedCareer(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Back to Career Paths
        </button>

        <div className="bg-[#111116] border border-[#ffffff0A] rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{selectedCareer}</h2>
            {!loading && detailData && (
              <div className="w-14 h-14 rounded-full border-2 border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.1)] bg-indigo-500/10">
                <Briefcase size={24} className="text-indigo-400" />
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-gray-400 flex flex-col items-center justify-center py-20 gap-4 animate-pulse bg-[#1C1C24] rounded-xl border border-[#ffffff05]">
              <Loader2 size={24} className="animate-spin text-indigo-400" /> 
              <span>Analyzing industry data & generating detailed structure...</span>
            </p>
          ) : detailData && (
            <div className="space-y-6">

              {/* Quick Summary Card */}
              <div className="bg-gradient-to-br from-[#1C1C24] to-[#111116] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-indigo-500/5">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2 text-sm"><Zap size={16}/> Quick Insights</h3>
                <p className="text-gray-300 text-[15px] leading-relaxed mb-6 max-w-3xl">{shortOverview}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-[#ffffff0A]">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={12}/> Avg Salary</p>
                    <p className="text-white font-bold text-sm md:text-base">{detailData.averageSalary}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Competition</p>
                    <p className="text-white font-bold text-sm md:text-base capitalize">{detailData.competition}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Target size={12}/> Success Rate</p>
                    <p className="text-white font-bold text-sm md:text-base">{detailData.successRate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Building2 size={12}/> Top Companies</p>
                    <p className="text-white font-bold text-sm md:text-base truncate max-w-[120px]" title={detailData.topCompanies?.join(', ')}>{detailData.topCompanies?.[0] || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Accordions Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Col 1 */}
                <div className="space-y-5">
                  <Accordion title="Roadmap to Achieve" icon={Layers} defaultOpen={true}>
                    <ul className="space-y-5 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/50 before:to-transparent">
                      {detailData.roadmapSteps?.map((step, idx) => (
                        <li key={idx} className="relative flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-[#111116] border-2 border-indigo-400 flex items-center justify-center shrink-0 z-10 mt-0.5 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                          </div>
                          <p className="text-[14px] text-gray-300 leading-snug">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </Accordion>

                  <Accordion title="Full Overview & Growth" icon={Briefcase}>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Detailed Profile</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{detailData.overview}</p>
                      </div>
                      <div className="pt-4 border-t border-[#ffffff0A]">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Industry Growth</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{detailData.growthPotential}</p>
                      </div>
                      <div className="pt-4 border-t border-[#ffffff0A]">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Top Hiring Companies</p>
                        <div className="flex flex-wrap gap-2">
                          {detailData.topCompanies?.map((comp, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 shadow-sm">{comp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Accordion>
                </div>

                {/* Col 2 */}
                <div className="space-y-5">
                  <Accordion title="Skills Required" icon={Target} defaultOpen={true}>
                    <div className="mb-6">
                      <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><MonitorPlay size={14}/> Core Technical Skills</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detailData.technicalSkills?.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-gray-300 bg-[#1C1C24] px-3 py-2.5 rounded-lg border border-[#ffffff0A]"><CheckCircle size={16} className="text-green-400 shrink-0 mt-px"/> {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[11px] text-purple-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Target size={14}/> Essential Soft Skills</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detailData.softSkills?.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-gray-300 bg-[#1C1C24] px-3 py-2.5 rounded-lg border border-[#ffffff0A]"><CheckCircle size={16} className="text-purple-400 shrink-0 mt-px"/> {s}</li>
                        ))}
                      </ul>
                    </div>
                  </Accordion>

                  <Accordion title="Learning Resources" icon={BookOpen} defaultOpen={true}>
                    <div className="space-y-5">
                      {rSorted?.vids?.length > 0 && (
                        <div>
                          <p className="text-[11px] text-red-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Video size={14}/> YouTube & Video Channels</p>
                          <ul className="space-y-2">
                            {rSorted.vids.map((v, i) => <li key={i} className="text-[13px] text-gray-300 flex items-start gap-2 bg-[#1C1C24] p-2 rounded-lg border border-red-500/10"><span className="text-red-400 mt-0.5">•</span><span>{v}</span></li>)}
                          </ul>
                        </div>
                      )}
                      {rSorted?.courses?.length > 0 && (
                        <div>
                          <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Library size={14}/> Top Courses & Certifications</p>
                          <ul className="space-y-2">
                            {rSorted.courses.map((v, i) => <li key={i} className="text-[13px] text-gray-300 flex items-start gap-2 bg-[#1C1C24] p-2 rounded-lg border border-blue-500/10"><span className="text-blue-400 mt-0.5">•</span><span>{v}</span></li>)}
                          </ul>
                        </div>
                      )}
                      {rSorted?.books?.length > 0 && (
                        <div>
                          <p className="text-[11px] text-green-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><BookText size={14}/> Books & Other Materials</p>
                          <ul className="space-y-2">
                            {rSorted.books.map((v, i) => <li key={i} className="text-[13px] text-gray-300 flex items-start gap-2 bg-[#1C1C24] p-2 rounded-lg border border-green-500/10"><span className="text-green-400 mt-0.5">•</span><span>{v}</span></li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Accordion>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-140px)]">
      <div className="bg-[#111116] border border-[#ffffff0A] rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="text-indigo-400" size={24} />
          <h2 className="text-2xl font-black text-white">Recommended Career Paths</h2>
        </div>
        <p className="text-gray-400 mb-8">AI has matched your current performance, subjects, and study habits with the following high-potential career tracks in the Indian market.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleSelectCareer(item.career)}
              className="bg-[#1C1C24] border border-[#ffffff05] rounded-2xl p-6 group cursor-pointer hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <Briefcase size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">AI Match</p>
                  <p className="text-lg font-black text-green-400">{item.matchScore}%</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{item.career}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1 line-clamp-3">
                {item.reason}
              </p>

              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-400 pt-4 border-t border-[#ffffff0A]">
                <span>View Details & Roadmap</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerPathView;
