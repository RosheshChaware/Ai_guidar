import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCards from './components/FeatureCards';
import Statistics from './components/Statistics';
import Tools from './components/Tools';
import SubjectAdvisorPage from './components/SubjectAdvisorPage';
import CollegeExplorerPage from './components/CollegeExplorerPage';
import AuthPage from './components/auth/AuthPage';
import { useAuth } from './context/AuthContext';
import CareerOutcomesPage from './components/CareerOutcomesPage';

function App() {
  const { user } = useAuth();

  const [showAssessment, setShowAssessment] = useState(false);
  const [showCollegeExplorer, setShowCollegeExplorer] = useState(false);
  const [showCareerOutcomes, setShowCareerOutcomes] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  const openAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const closeAuth = () => setShowAuth(false);

  // If user clicks "Start Assessment", require login first
  const openAssessment = () => {
    if (user) {
      setShowAssessment(true);
    } else {
      openAuth('signin');
    }
  };

  const closeAssessment = () => setShowAssessment(false);

  const openCollegeExplorer = () => setShowCollegeExplorer(true);
  const closeCollegeExplorer = () => setShowCollegeExplorer(false);

  const openCareerOutcomes = () => setShowCareerOutcomes(true);
  const closeCareerOutcomes = () => setShowCareerOutcomes(false);

  if (showAssessment) {
    return <SubjectAdvisorPage onClose={closeAssessment} />;
  }

  if (showCollegeExplorer) {
    return <CollegeExplorerPage onClose={closeCollegeExplorer} />;
  }

  if (showCareerOutcomes) {
    return <CareerOutcomesPage onClose={closeCareerOutcomes} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <Navbar
        onStartAssessment={openAssessment}
        onOpenExplorer={openCollegeExplorer}
        onOpenCareerOutcomes={openCareerOutcomes}
        onOpenSignIn={() => openAuth('signin')}
        onOpenSignUp={() => openAuth('signup')}
      />
      <Hero onStartAssessment={openAssessment} />
      <FeatureCards onStartAssessment={openAssessment} />
      <Statistics />
      <Tools onOpenExplorer={openCollegeExplorer} onOpenCareerOutcomes={openCareerOutcomes} />

      {/* Auth modal */}
      {showAuth && (
        <AuthPage
          defaultMode={authMode}
          onSuccess={() => {
            closeAuth();
          }}
          onClose={closeAuth}
        />
      )}
    </div>
  );
}

export default App;
