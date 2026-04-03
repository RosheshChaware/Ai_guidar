export const getNodeDetails = (nodeId, nodeLabel) => {
  const label = typeof nodeLabel === 'string' ? nodeLabel.toLowerCase() : '';

  // Academic Nodes
  if (label.includes("eligibility")) {
    return {
      type: "academic",
      title: "Eligibility Criteria",
      description: "The foundational academic requirements needed to pursue this pathway. Ensures you have the necessary prerequisite knowledge.",
      skills: ["Academic Foundation", "Entrance Exam Prep", "Analytical Thinking"],
      duration: "Foundational (Pre-UG)",
      focus: "Passing required 10+2 examinations with specific subject combinations.",
      next: "Undergraduate Program (UG)",
    };
  }

  if (label.includes("ug: ")) {
    return {
      type: "academic",
      title: "Undergraduate (UG)",
      description: "A comprehensive bachelor's degree program focusing on core domain knowledge and fundamental practical skills.",
      skills: ["Core Domain Knowledge", "Lab & Practical Skills", "Project Management"],
      duration: "3-5 Years (Depending on course)",
      focus: "Building a strong technical or theoretical foundation.",
      next: "Postgraduate (PG) or Entry-level Career Roles",
    };
  }

  if (label.includes("pg: ")) {
    return {
      type: "academic",
      title: "Postgraduate (PG)",
      description: "Advanced specialization program for deeper knowledge, research, and mastery in a specific sub-field.",
      skills: ["Advanced Analysis", "Research Methodologies", "Leadership", "Specialized Tech"],
      duration: "2 Years",
      focus: "Niche specialization and thesis/project work.",
      next: "Doctoral Programs or Senior Industry Roles",
    };
  }

  if (label.includes("doctoral: ")) {
    return {
      type: "academic",
      title: "Doctoral / PhD",
      description: "The highest academic degree focusing on original research, publishing, and contributing new knowledge to the field.",
      skills: ["Independent Research", "Academic Writing", "Critical Evaluation", "Data Modeling"],
      duration: "3-5+ Years",
      focus: "Original research, thesis defense, and academic contribution.",
      next: "Academia, R&D, or High-Level Consulting",
    };
  }

  // Career Nodes - Substring matching dictionary
  const careerDictionary = [
    {
      keywords: ["engineer", "developer", "architect", "programmer"],
      salary: "₹6–30 LPA",
      companies: "Google, Amazon, Microsoft, TCS, L&T, Infosys",
      scope: "High demand across tech, manufacturing, and IT product sectors. Rapid growth driven by digital transformation.",
      skills: ["System Design", "Problem Solving", "Coding/CAD", "Project Execution"]
    },
    {
      keywords: ["scientist", "researcher", "physicist", "chemist", "biologist"],
      salary: "₹8–25 LPA",
      companies: "ISRO, DRDO, Govt Laboratories, BioTech Firms, Research Institutes",
      scope: "Steady demand for R&D. Highly respected positions with government and top-tier private lab opportunities.",
      skills: ["Data Analysis", "Experimentation", "Statistical Modeling", "Scientific Writing"]
    },
    {
      keywords: ["manager", "administrator", "director", "officer", "planner", "head"],
      salary: "₹10–40 LPA",
      companies: "McKinsey, Reliance, Deloitte, HUL, Tata Group, Govt sectors",
      scope: "Universal demand across all industries. Pathway to executive leadership.",
      skills: ["Leadership", "Operations", "Strategic Planning", "Communication"]
    },
    {
      keywords: ["analyst", "consultant", "adviser"],
      salary: "₹7–25 LPA",
      companies: "BCG, KPMG, EY, PwC, MuSigma, Financial Firms",
      scope: "Excellent growth in fintech, management consulting, and strategic advisory roles.",
      skills: ["Data Review", "Client Management", "Business Strategy", "Financial Modeling"]
    },
    {
      keywords: ["doctor", "physician", "surgeon", "specialist"],
      salary: "₹12–50+ LPA",
      companies: "Apollo Hospitals, Fortis, AIIMS, Max Healthcare",
      scope: "Extremely high and perennial societal demand. Expansive opportunities for private practice.",
      skills: ["Clinical Diagnosis", "Patient Care", "Surgical Precision", "Decision Making"]
    },
    {
      keywords: ["accountant", "auditor", "tax", "actuary"],
      salary: "₹6–25 LPA",
      companies: "Big 4 (EY, PwC, Deloitte, KPMG), Banks, Corporate Finance",
      scope: "Backbone of corporate finance. High stability and excellent independent practice possibilities.",
      skills: ["Financial Reporting", "Tax Law", "Auditing", "Numerical Fluency"]
    },
    {
      keywords: ["designer", "artist", "animator", "curator"],
      salary: "₹5–20 LPA",
      companies: "Ogilvy, Adobe, Design Studios, Media Houses, MNCs",
      scope: "Booming digital design era ensures constant demand for UX, UI, and creative branding.",
      skills: ["Visual Design", "Creative Thinking", "Software Tools", "Prototyping"]
    },
    {
       keywords: ["lawyer", "attorney", "judge", "magistrate", "advocate"],
       salary: "₹6–30+ LPA",
       companies: "Top Law Firms, Corporate Legal Teams, Government Judiciary",
       scope: "High status and critical for corporate compliance, civil rights, and governance.",
       skills: ["Legal Knowledge", "Argumentation", "Negotiation", "Drafting"]
    }
  ];

  // Default Career profile
  let profile = {
    type: "career",
    title: nodeLabel,
    description: `As a ${nodeLabel}, professionals typically apply specialized domain knowledge to solve complex industry problems, manage systems, and drive growth.`,
    skills: ["Domain Expertise", "Team Collaboration", "Problem Solving", "Adaptability"],
    salary: "₹5–18 LPA (Industry Average)",
    companies: "Top tier corporations, Government Agencies, and Specialized Startups",
    scope: "Moderate to high growth with increasing specialization opportunities."
  };

  // Enhance profile if matched
  for (const entry of careerDictionary) {
    if (entry.keywords.some(kw => label.includes(kw))) {
      profile.skills = entry.skills;
      profile.salary = entry.salary;
      profile.companies = entry.companies;
      profile.scope = entry.scope;
      break;
    }
  }

  return profile;
};
