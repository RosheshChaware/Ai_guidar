import React, { useState, useEffect } from 'react';
import { Briefcase, ChevronRight, Loader2, ArrowLeft, TrendingUp, AlertTriangle, Building2, Target, BookOpen, Layers } from 'lucide-react';

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
      const res = await fetch('http://localhost:5000/api/career/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career: careerName, userContext: aiResult })
      });
      const data = await res.json();
      setDetailData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCareer) {
    return (
      <div className="flex flex-col gap-6 min-h-[calc(100vh-140px)]">
        <button 
          onClick={() => setSelectedCareer(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Back to Career Paths
        </button>

        <div className="bg-[#111116] border border-[#ffffff0A] rounded-2xl p-8 shadow-xl">
          <div className="flex items-start justify-between mb-8 pb-8 border-b border-[#ffffff0A]">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{selectedCareer}</h2>
              {loading ? (
                <p className="text-gray-400 flex items-center gap-2 animate-pulse mt-2"><Loader2 size={16} className="animate-spin" /> Analyzing industry data & aligning with your skills...</p>
              ) : (
                <p className="text-gray-400 max-w-3xl leading-relaxed text-[15px]">{detailData?.overview}</p>
              )}
            </div>
            {!loading && detailData && (
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Briefcase size={24} className="text-indigo-400" />
              </div>
            )}
          </div>

          {!loading && detailData && (
            <div className="space-y-10">
              {/* Row 1: Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#1C1C24] p-5 rounded-xl border border-[#ffffff05]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2"><Target size={14} className="text-green-400"/> Success Rate</p>
                  <p className="text-xl font-bold text-white">{detailData.successRate}</p>
                </div>
                <div className="bg-[#1C1C24] p-5 rounded-xl border border-[#ffffff05]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2"><AlertTriangle size={14} className="text-orange-400"/> Competition</p>
                  <p className="text-xl font-bold text-white capitalize">{detailData.competition}</p>
                </div>
                <div className="bg-[#1C1C24] p-5 rounded-xl border border-[#ffffff05]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-indigo-400"/> Avg Salary</p>
                  <p className="text-xl font-bold text-white">{detailData.averageSalary}</p>
                </div>
                <div className="bg-[#1C1C24] p-5 rounded-xl border border-[#ffffff05]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-purple-400"/> Growth</p>
                  <p className="text-[13px] text-white leading-snug">{detailData.growthPotential}</p>
                </div>
              </div>

              {/* Row 2: Grid for text stuff */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Roadmap */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#ffffff05]">
                    <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><Layers size={18} className="text-indigo-400"/> Roadmap to Achieve</h3>
                    <div className="space-y-4">
                      {detailData.roadmapSteps?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-[#111116] border border-[#ffffff10] flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#ffffff05]">
                    <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2"><Building2 size={18} className="text-blue-400"/> Top Companies Hiring</h3>
                    <div className="flex flex-wrap gap-3">
                      {detailData.topCompanies?.map((comp, idx) => (
                        <span key={idx} className="px-4 py-2 rounded-lg bg-[#111116] border border-[#ffffff10] text-sm text-white">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills & Resources sidebar */}
                <div className="space-y-6">
                  <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#ffffff05]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Target size={16} className="text-green-400"/> Skills Required</h3>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-2">Technical</p>
                      <div className="flex flex-wrap gap-2">
                        {detailData.technicalSkills?.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-2">Soft Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {detailData.softSkills?.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1C1C24] p-6 rounded-xl border border-[#ffffff05]">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><BookOpen size={16} className="text-purple-400"/> Learning Resources</h3>
                    <ul className="space-y-3">
                      {detailData.learningResources?.map((res, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">•</span> {res}
                        </li>
                      ))}
                    </ul>
                  </div>
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
