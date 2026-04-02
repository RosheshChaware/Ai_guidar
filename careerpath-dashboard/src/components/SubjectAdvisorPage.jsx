import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import ProgressBar from './ProgressBar';
import QuestionStep from './QuestionStep';
import RecommendationCard from './RecommendationCard';

const STREAM_DATA = {
  pcm: {
    title: "Science (PCM)",
    badge: "Best Match",
    description: "Ideal for students with a strong aptitude for mathematics and physical sciences, aiming for engineering or technology careers.",
    coreSubjects: ["Physics", "Chemistry", "Mathematics"],
    careerOptions: ["Engineering", "Architecture", "Pilot", "Data Science", "Research"],
    entranceExams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE"]
  },
  pcb: {
    title: "Science (PCB)",
    badge: "Medical Path",
    description: "Perfect for students interested in biology and healthcare, focusing on medicine, dental, or life sciences research.",
    coreSubjects: ["Physics", "Chemistry", "Biology"],
    careerOptions: ["Medicine", "Dentistry", "Pharmacy", "Biotechnology", "Nursing"],
    entranceExams: ["NEET", "AIIMS", "State medical exams"]
  },
  commerce: {
    title: "Commerce",
    badge: "Business Match",
    description: "Best suited for students interested in finance, trade, business management, and the global economy.",
    coreSubjects: ["Economics", "Accountancy", "Business Studies", "Mathematics"],
    careerOptions: ["Chartered Accountant", "Investment Banker", "Marketing Manager", "Entrepreneur", "Economist"],
    entranceExams: ["CA Foundation", "CUET", "IPMAT", "SET"]
  },
  arts: {
    title: "Arts & Humanities",
    badge: "Creative Path",
    description: "Ideal for students interested in understanding human society, history, psychology, and creative expression.",
    coreSubjects: ["History", "Geography", "Psychology", "Political Science", "Economics"],
    careerOptions: ["Civil Services (IAS/IPS)", "Journalism", "Fashion Design", "Law", "Psychologist"],
    entranceExams: ["CLAT", "CUET", "NIFT", "UPSC (Later)"]
  }
};

const SubjectAdvisorPage = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [answers, setAnswers] = useState({
    subjects: [],
    career: [],
    strengths: [],
    learning: [],
  });

  const steps = [
    {
      id: 'subjects',
      title: "Subject Combination Advisor",
      question: "Which subjects do you find most interesting?",
      options: ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "History", "Geography", "English Literature", "Psychology", "Computer Science"],
      isMultiple: true,
      progress: 25,
    },
    {
      id: 'career',
      title: "Subject Combination Advisor",
      question: "What type of career are you most interested in?",
      options: ["Engineering & Technology", "Medical & Healthcare", "Business & Management", "Arts & Creative Fields", "Research & Academia", "Government & Civil Services", "Law & Legal Services", "Teaching & Education"],
      isMultiple: false,
      progress: 50,
    },
    {
      id: 'strengths',
      title: "Subject Combination Advisor",
      question: "What are your key strengths?",
      options: ["Analytical Thinking", "Creative Problem Solving", "Communication Skills", "Leadership Abilities", "Technical Aptitude", "Research Skills", "Teamwork", "Attention to Detail"],
      isMultiple: true,
      progress: 75,
    },
    {
      id: 'learning',
      title: "Subject Combination Advisor",
      question: "How do you prefer to learn?",
      options: ["Hands-on & Practical", "Theoretical & Conceptual", "Visual & Graphical", "Discussion & Debate"],
      isMultiple: false,
      progress: 100,
    }
  ];

  const calculateRecommendations = () => {
    setIsGenerating(true);
    
    // Weighted Scoring Algorithm
    const scores = { pcm: 0, pcb: 0, commerce: 0, arts: 0 };

    // Step 1: Subjects
    answers.subjects.forEach(s => {
      if (s === "Mathematics") { scores.pcm += 4; scores.commerce += 2; }
      if (s === "Physics") { scores.pcm += 3; scores.pcb += 2; }
      if (s === "Chemistry") { scores.pcm += 2; scores.pcb += 3; }
      if (s === "Biology") { scores.pcb += 5; }
      if (s === "Economics") { scores.commerce += 5; scores.arts += 2; }
      if (s === "History" || s === "Geography") { scores.arts += 4; }
      if (s === "Psychology" || s === "English Literature") { scores.arts += 3; }
      if (s === "Computer Science") { scores.pcm += 4; }
    });

    // Step 2: Career (Double weight)
    const c = answers.career[0];
    if (c === "Engineering & Technology") scores.pcm += 10;
    if (c === "Medical & Healthcare") scores.pcb += 10;
    if (c === "Business & Management") scores.commerce += 10;
    if (c === "Arts & Creative Fields") scores.arts += 10;
    if (c === "Research & Academia") { scores.pcm += 5; scores.pcb += 5; scores.arts += 5; }
    if (c === "Government & Civil Services") { scores.arts += 10; scores.commerce += 5; }
    if (c === "Law & Legal Services") { scores.arts += 10; scores.commerce += 5; }

    // Step 3: Strengths
    answers.strengths.forEach(s => {
      if (s === "Analytical Thinking") { scores.pcm += 2; scores.commerce += 2; }
      if (s === "Creative Problem Solving") { scores.arts += 3; scores.pcm += 1; }
      if (s === "Technical Aptitude") { scores.pcm += 3; }
      if (s === "Communication Skills") { scores.arts += 2; scores.commerce += 2; }
      if (s === "Leadership Abilities") { scores.commerce += 3; }
      if (s === "Research Skills") { scores.pcb += 2; scores.arts += 2; }
    });

    // Simulate AI Processing delay
    setTimeout(() => {
      // Sort scores and pick top 2
      const sorted = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2);

      const results = sorted.map(([id], index) => ({
        ...STREAM_DATA[id],
        badge: index === 0 ? "Best Match" : `Option ${index + 1}`
      }));

      setRecommendations(results);
      setIsGenerating(false);
      setStepIndex(steps.length + 1); // Move to final result view
    }, 2000);
  };

  const currentStep = steps[stepIndex];
  const isNextDisabled = !isGenerating && answers[currentStep?.id]?.length === 0;

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <BrainCircuit className="w-20 h-20 text-primary relative animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold mt-12 mb-4 animate-pulse">Personalizing Your Future...</h2>
        <p className="text-textMuted text-lg max-w-md text-center">
          Our AI is analyzing your interests, strengths, and goals to find the perfect educational path for you.
        </p>
        <div className="mt-12 flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  if (stepIndex > steps.length) {
    // Result Page
    return (
      <div className="min-h-screen bg-background p-8 md:p-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <button onClick={() => setStepIndex(3)} className="text-textMuted flex items-center gap-2 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Restart Assessment</span>
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 border border-white/10 transition-colors">
              Exit
            </button>
          </div>

          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Your Personalized Recommendations</h1>
            <p className="text-textMuted text-lg leading-relaxed max-w-2xl mx-auto">
              Based on your unique profile, these paths offer the best alignment with your potential and career aspirations.
            </p>
          </div>

          <div className="space-y-6">
            {recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} {...rec} />
            ))}
          </div>

          <div className="glass-card rounded-3xl p-8 text-center mt-12 bg-primary/5 border-primary/20">
             <h3 className="text-2xl font-bold mb-4">Need More Guidance?</h3>
             <p className="text-textMuted mb-8">Connect with our expert counselors for personalized advice and detailed career path analysis.</p>
             <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-xl transition-colors">Book Counseling Session</button>
                <button className="border border-white/10 hover:bg-white/5 font-medium px-8 py-3 rounded-xl transition-colors">Explore Colleges</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-16 flex flex-col items-center">
      <ProgressBar progress={currentStep.progress} stepTitle={currentStep.title} />
      
      <div className="w-full flex-grow flex flex-col items-center justify-center">
        <QuestionStep 
          question={currentStep.question}
          options={currentStep.options}
          isMultiple={currentStep.isMultiple}
          selections={answers[currentStep.id]}
          onSelect={(selectedOptions) => {
            setAnswers({ ...answers, [currentStep.id]: selectedOptions });
          }}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 flex justify-between">
        <button 
          onClick={() => stepIndex === 0 ? onClose() : setStepIndex(stepIndex - 1)}
          className="flex items-center gap-2 text-textMuted hover:text-white transition-colors py-3 px-6 rounded-xl border border-white/5 hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{stepIndex === 0 ? "Exit" : "Previous"}</span>
        </button>
        <button 
          onClick={() => stepIndex === steps.length - 1 ? calculateRecommendations() : setStepIndex(stepIndex + 1)}
          disabled={isNextDisabled}
          className={`flex items-center gap-2 font-medium py-3 px-8 rounded-xl transition-all duration-300 ${
            isNextDisabled 
              ? "bg-secondary text-textMuted cursor-not-allowed opacity-50" 
              : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          }`}
        >
          <span>{stepIndex === steps.length - 1 ? "Get Recommendations" : "Next"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SubjectAdvisorPage;
