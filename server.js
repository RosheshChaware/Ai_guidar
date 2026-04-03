import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const app = express();
app.use(cors());
app.use(express.json());

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Needs to be App Password
  },
});

app.post('/send-login-alert', async (req, res) => {
  console.log('\n[Backend] ---> Received POST to /send-login-alert');
  console.log('[Backend] Request body:', req.body);
  
  const { email, displayName, userAgent } = req.body;

  if (!email) {
    console.error('[Backend] Error: Email address was completely missing from request body!');
    return res.status(400).json({ error: 'Email is required' });
  }

  const nameToUse = displayName || 'User';
  const currentDate = new Date().toLocaleString();
  console.log(`[Backend] Preparing email for: ${email} (Name: ${nameToUse})`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Security Alert: New Login to CareerPath',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">New Login Detected</h2>
        <p>Hi <b>${nameToUse}</b>,</p>
        <p>You have successfully logged in to your CareerPath account.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${currentDate}</p>
          <p style="margin: 0;"><strong>Device/Browser Info:</strong> ${userAgent || 'Unknown device'}</p>
        </div>
        <p>If this was you, you can safely ignore this email.</p>
        <p>If you did not log in, please reset your password immediately and contact support.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Login alert email sent successfully:', info.response);
    res.status(200).json({ message: 'Login alert email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send login alert email', details: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  console.log('\n[Backend] ---> Received POST to /api/analyze');
  try {
    const { inputData } = req.body;
    if (!inputData) return res.status(400).json({ error: 'Input data is required' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API is not configured' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    // Build enriched context string from all input fields
    const buildContext = (d) => {
      const lines = [];
      lines.push(`CLASS: ${d.currentClass || 'N/A'}`);
      lines.push(`STREAM: ${d.stream || 'N/A'}`);
      lines.push(`GOAL / PURSUIT: ${d.targetGoal || 'N/A'}`);
      lines.push(`LANGUAGE: ${d.language || 'English'}`);
      lines.push(`ADAPTIVE SUBJECTS FOR GOAL: ${(d.adaptiveSubjects || []).join(', ') || 'General'}`);

      // Strengths
      const strong = (d.strongSubjectsAll || d.strongSubjects || []);
      lines.push(`STRONG SUBJECTS: ${strong.join(', ') || 'Not specified'}`);

      // Weaknesses
      const weak = (d.weakSubjectsAll || d.weakSubjects || []);
      lines.push(`WEAK SUBJECTS: ${weak.join(', ') || 'Not specified'}`);

      if (d.biggestChallenge) lines.push(`BIGGEST CHALLENGE (student's own words): "${d.biggestChallenge}"`);
      lines.push(`CONFIDENCE LEVEL: ${d.confidence || 'N/A'}`);

      // Study habits
      lines.push(`DAILY STUDY HOURS: ${d.studyHours || 'N/A'}`);
      lines.push(`PREFERRED STUDY TIME: ${d.studyTime || 'N/A'}`);
      lines.push(`STUDY METHOD: ${d.practiceStyleAll || d.practiceStyle || 'N/A'}`);
      if (d.resources?.length) lines.push(`RESOURCES USED: ${d.resources.join(', ')}`);

      // Multi-subject performance
      if (d.subjectEntries?.length) {
        lines.push('PERFORMANCE DATA (multi-subject):');
        d.subjectEntries.forEach((e, i) => {
          if (e.subject) {
            lines.push(`  ${i + 1}. Subject: ${e.subject} | Score: ${e.score || 'N/A'}% | Correct: ${e.correctQ || 'N/A'} | Wrong: ${e.incorrectQ || 'N/A'}`);
          }
        });
      } else {
        // legacy single subject
        lines.push(`TEST SUBJECT: ${d.perfSubject || 'N/A'} | SCORE: ${d.testScore || 'N/A'}% | CORRECT: ${d.correctQ || 'N/A'} | WRONG: ${d.incorrectQ || 'N/A'}`);
      }

      // Weak topics
      const weakTopics = (d.weakTopicsAll || d.weakTopics || []);
      lines.push(`WEAK TOPICS: ${weakTopics.join(', ') || 'Not specified'}`);
      lines.push(`MISTAKE TYPE: ${d.mistakeTypeAll || d.mistakeType || 'N/A'}`);

      if (d.hasFileUpload) lines.push('NOTE: Student uploaded a test result image. Factor this into your analysis as additional performance evidence.');

      return lines.join('\n');
    };

    const SYSTEM_PROMPT = `You are ShikshaSetu AI — an advanced academic and career intelligence system built for Indian students.

Your role: Think like a REAL MENTOR who deeply understands this student. Do NOT repeat their inputs mechanically. INFER patterns, habits, and hidden issues from the data.

IMPORTANT INTELLIGENCE RULES:
1. Use ONLY the subjects relevant to the student's goal and stream (given in ADAPTIVE SUBJECTS).
2. infer subject scores using: test scores, correct/wrong ratio, confidence, study hours, mistake type, weak topics.
3. Do NOT give the same score to all subjects. Show realistic variation (e.g. 45, 67, 82, 71).
4. If student mentions custom "Other:" subjects or topics, include them in your analysis.
5. Read the BIGGEST CHALLENGE field carefully — it reveals real pain points beyond structured options.
6. learningStyle: "visual" | "practice-based" | "theory-based" | "mixed"
7. consistencyLevel: "low" | "moderate" | "high"
8. focusLevel: "low" | "medium" | "high"
9. Return EXACTLY 3 career suggestions suited to Indian context.
10. actionPlan steps must be concrete (5–7 words each), not generic.
11. insights must sound like a mentor speaking to the student directly.
12. Output STRICT VALID JSON only. No markdown, no extra text.

OUTPUT FORMAT:
{
  "strongSubjects": [{"subject": "", "confidence": 0, "reason": ""}],
  "weakSubjects": [{"subject": "", "confidence": 0, "reason": ""}],
  "subjectScores": [{"subject": "", "score": 0}],
  "learningProfile": {
    "learningStyle": "",
    "consistencyLevel": "",
    "focusLevel": ""
  },
  "learningIssues": [{"type": "", "severity": "low|medium|high", "reason": ""}],
  "recommendedFocus": [{
    "subject": "",
    "priority": "high|medium|low",
    "reason": "",
    "actionPlan": ["step 1", "step 2", "step 3"]
  }],
  "careerSuggestions": [{"career": "", "matchScore": 0, "reason": ""}],
  "insights": {
    "strengthSummary": "",
    "weaknessSummary": "",
    "overallAnalysis": ""
  }
}`;

    const studentContext = buildContext(inputData);
    const prompt = `${SYSTEM_PROMPT}\n\n--- STUDENT PROFILE DATA ---\n${studentContext}`;

    console.log('[Backend] Sending to Gemini...');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonOutput = JSON.parse(responseText);

    console.log('[Backend] AI response received, subjects:', jsonOutput.subjectScores?.map(s => s.subject));
    res.status(200).json(jsonOutput);

  } catch (error) {
    console.error('[Backend] Error in /api/analyze:', error.message);
    res.status(500).json({ error: 'Failed to generate insights', details: error.message });
  }
});
app.post('/api/roadmap/update', async (req, res) => {
  console.log('\n[Backend] ---> Received POST to /api/roadmap/update');
  try {
    const { currentRoadmap, newProgress, userContext } = req.body;
    if (!newProgress) return res.status(400).json({ error: 'New progress data is required' });
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are an AI Mentor updating a student's dynamic learning roadmap.
    
CURRENT CONTEXT: 
${JSON.stringify(userContext || {})}

CURRENT ROADMAP: 
${JSON.stringify(currentRoadmap || {})}

NEW USER PROGRESS / UPDATE:
Experience: "${newProgress.experience || 'None'}"
New Test Score: ${newProgress.testScore || 'N/A'}% in ${newProgress.subject || 'N/A'}

TASK: Based on this new update, update the action steps, priorities, and sequence of the roadmap.
1. If they struggled (e.g., low score or complaining about a topic), inject remedial immediate steps.
2. If they did well, advance the roadmap schedule.
3. Keep the output strictly in the original JSON format, returning a new array of roadmap milestones.

OUTPUT STRICT JSON ARRAY FORMAT:
[
  {
    "id": "1",
    "title": "Topic or Goal",
    "status": "pending|in-progress|completed",
    "priority": "high|medium|low",
    "tasks": [
      { "id": "t1", "desc": "Concrete task", "completed": false }
    ],
    "aiAdvice": "Short contextual advice"
  }
]`;

    const result = await model.generateContent(prompt);
    res.status(200).json({ roadmap: JSON.parse(result.response.text()) });
  } catch (error) {
    console.error('Error in /api/roadmap/update:', error);
    res.status(500).json({ error: 'Failed to update roadmap' });
  }
});

app.post('/api/roadmap/chat', async (req, res) => {
  console.log('\n[Backend] ---> Received POST to /api/roadmap/chat');
  try {
    const { message, context, history } = req.body;
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an intelligent AI mentor for students.

You help with:
* academic doubts
* study strategies
* roadmap guidance
* career advice

You have access to student data:
* class
* stream
* goal
* weak subjects
* performance

Instructions:
1. Always give clear, simple explanations
2. If user asks a doubt:
   * explain concept step-by-step
   * give example
   * suggest practice method
3. If user says "I am struggling":
   * identify problem
   * give solution
   * suggest study technique
4. If roadmap related:
   * guide based on user's goal
5. Keep answers:
   * short but helpful
   * actionable
   * student-friendly
6. Do NOT give generic answers
7. If needed:
   * break answer into steps
   * give tips`,
    });

    let chatHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Gemini API STRICT RULE: History MUST start with a 'user' message and alternate.
    // We must strip out the fake initial greeting from the frontend.
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }
    
    // Also remove the very last message because that's the one we are actually sending via sendMessage!
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
      chatHistory.pop();
    }

    const chat = model.startChat({
      history: chatHistory
    });

    const contextPrefix = context ? `[SYSTEM: Current User Context: Focus=${context.focus}, Weakness=${context.weakness}] ` : '';
    const result = await chat.sendMessage(contextPrefix + message);
    
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error('Error in /api/roadmap/chat:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});
app.post('/api/career/details', async (req, res) => {
  console.log('\n[Backend] ---> Received POST to /api/career/details');
  try {
    const { career, userContext } = req.body;
    if (!career) return res.status(400).json({ error: 'Career name is required' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are an expert Career Counselor for Indian students. The user wants deep details on the career: "${career}".
    
USER CONTEXT (To personalize advice):
${JSON.stringify(userContext || {})}

Generate a very detailed career profile in STRICT JSON. Include realistic statistics for the Indian market.
JSON FORMAT MUST BE EXACTLY:
{
  "overview": "Detailed explanation of the role.",
  "successRate": "e.g. 65%",
  "failureRate": "e.g. 35%",
  "competition": "High/Medium/Low",
  "averageSalary": "e.g. ₹8LPA - ₹15LPA",
  "growthPotential": "Description of industry growth.",
  "topCompanies": ["Company 1", "Company 2"],
  "roadmapSteps": ["Step 1", "Step 2", "Step 3"],
  "technicalSkills": ["Skill 1", "Skill 2"],
  "softSkills": ["Skill A", "Skill B"],
  "learningResources": ["Resource 1", "Resource 2"]
}`;

    const result = await model.generateContent(prompt);
    res.status(200).json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error('Error in /api/career/details:', error);
    res.status(500).json({ error: 'Failed to fetch career details' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
