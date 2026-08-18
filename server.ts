import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Project Technical Depth AI Audit
app.post('/api/analyze-project', async (req, res) => {
  try {
    const {
      projectId,
      projectTitle,
      description,
      techStack,
      githubUrl,
      liveUrl,
      role,
      difficulty,
      status,
      githubEvidence,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        useFallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Principal Engineering Architect and Tech Hiring Lead evaluating a candidate's portfolio project for technical depth and production readiness.

PROJECT DETAILS:
- Project ID: ${projectId || 'N/A'}
- Title: ${projectTitle || 'Engineering Project'}
- Description: ${description || 'No detailed architecture description provided.'}
- Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : 'None listed'}
- Role: ${role || 'Developer'}
- Self-Reported Difficulty: ${difficulty || 'Intermediate'}
- Project Status: ${status || 'In Progress'}
- GitHub Repository URL: ${githubUrl || 'None'}
- Live Deployment URL: ${liveUrl || 'None'}
- Verified GitHub Data: ${JSON.stringify(githubEvidence || {})}

EVALUATION CRITERIA:
1. Category Scoring (Total must equal the sum of these 8 items, max 100):
   - Architecture & System Design (0 - 20)
   - Technical Complexity (0 - 20)
   - Technology Stack (0 - 15)
   - Data / Backend / Database Design (0 - 15)
   - Security & Authentication (0 - 10)
   - Scalability & Performance (0 - 10)
   - Testing & Reliability (0 - 5)
   - Deployment & DevOps (0 - 5)
2. Rules:
   - Base scores strictly on actual evidence. Do not hallucinate databases, testing, CI/CD, or authentication if they are not in the tech stack/description.
   - If no database is mentioned or evident, score dataBackendDatabase <= 3.
   - If no authentication is mentioned, score securityAuthentication <= 2.
   - If no tests or README are evident, score testingReliability <= 1.
   - If no live URL or CI/CD is present, score deploymentDevops <= 1.
   - Technical Depth Score must equal the sum of the 8 category scores (0 to 100).
   - Complexity Rating: 'Foundational' (<50), 'Moderate' (50-67), 'Production-Ready' (68-81), 'Advanced Systems' (>=82).
   - Resume Impact Rating: 'Needs Improvement' (<50), 'Moderate Impact' (50-64), 'Strong Impact' (65-79), 'High Impact' (>=80).
   - Missing Production Upgrades: ONLY recommend upgrades that are genuinely missing from this specific project.
   - Actionable Recommendations: 3 specific, project-tailored action items.
   - Architecture Strengths: 2-3 specific architectural strengths based on the project's actual tools and domain.

Return ONLY valid JSON matching this structure:
{
  "technicalDepthScore": number,
  "complexityRating": "Foundational" | "Moderate" | "Production-Ready" | "Advanced Systems",
  "rating": "Needs Improvement" | "Moderate Impact" | "Strong Impact" | "High Impact",
  "realWorldValue": "string describing real-world deployment and utility",
  "resumeImpact": "string describing resume value and interview talking points",
  "resumeImpactValue": "same string as resumeImpact",
  "categoryScores": {
    "architectureSystemDesign": number,
    "technicalComplexity": number,
    "technologyStack": number,
    "dataBackendDatabase": number,
    "securityAuthentication": number,
    "scalabilityPerformance": number,
    "testingReliability": number,
    "deploymentDevops": number
  },
  "technologiesEvaluated": [
    { "name": "string", "relevance": "string", "industryDemand": "string" }
  ],
  "architectureStrengths": ["string", "string"],
  "missingProductionUpgrades": ["string", "string", "string"],
  "missingImprovements": ["string", "string", "string"],
  "actionableRecommendations": ["string", "string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Gemini API project audit error:', err);
    return res.status(500).json({
      error: err?.message || 'AI project audit failed',
      useFallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Digital Twin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
