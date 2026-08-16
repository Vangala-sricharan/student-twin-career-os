import React, { useState, useRef, useEffect } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { generateAICareerInsights } from '../../lib/aiCareerEngine';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AICareerAssistant: React.FC = () => {
  const { profile, skills, projects, achievements, careerGoal, readinessScore } = useStudentTwin();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${profile.fullName || 'there'}! I am your AI Career Twin Assistant. I've analyzed your ${skills.length} skills, ${projects.length} projects, and career goal targeting ${careerGoal.targetRole || 'Engineering Roles'} (Readiness: ${readinessScore.overall}%). How can I guide your preparation or interview strategy today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const starterPrompts = [
    `How ready am I for ${careerGoal.targetRole || 'AI/ML Engineer'} placements?`,
    'What are my top 3 skill gaps right now?',
    'What project should I build next to maximize my resume value?',
    'Create a 2-week DSA sprint plan for me.',
  ];

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input.trim();
    if (!query || isThinking) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsThinking(true);
    setErrorState(null);

    // Profile-aware AI generation
    try {
      setTimeout(() => {
        const insights = generateAICareerInsights(
          profile,
          skills,
          projects,
          achievements,
          careerGoal,
          readinessScore
        );

        let reply = '';
        const qLower = query.toLowerCase();

        if (qLower.includes('readiness') || qLower.includes('how ready') || qLower.includes('placement')) {
          reply = `### Career Readiness Evaluation for ${profile.fullName || 'You'}:
**Overall Readiness Score:** **${readinessScore.overall}%** (${readinessScore.level})
**Target Role:** ${careerGoal.targetRole || 'Software / AI Engineer'}
**Target Compensation:** ${careerGoal.targetCompensationINR || '₹18,00,000 / yr'}

**Current Breakdown:**
- **Skills Coverage:** ${readinessScore.breakdown.skillsCoverage}% (${skills.length} skills logged)
- **Project Portfolio:** ${readinessScore.breakdown.projectPortfolio}% (${projects.length} repository projects)
- **Goal Alignment:** ${readinessScore.breakdown.industryAlignment}%
- **Verifications:** ${readinessScore.breakdown.verifications}%

**Forecast:** ${insights.placementForecast}`;
        } else if (qLower.includes('gap') || qLower.includes('missing') || qLower.includes('improve')) {
          reply = `### Identified Skill & Experience Gaps:
Based on your profile targeting **${careerGoal.targetRole || 'Target Role'}**, here are your priority gaps:

1. **${insights.needsImprovement[0] || 'Data Structures & Algorithms problem-solving depth'}**
2. **${insights.needsImprovement[1] || 'Cloud deployment and containerization (Docker/AWS)'}**
3. **${insights.needsImprovement[2] || 'Production performance metrics & unit tests'}**

**Highest Impact Recommendation:**
${insights.highestImpactAction}`;
        } else if (qLower.includes('project') || qLower.includes('build next') || qLower.includes('portfolio')) {
          reply = `### Recommended Next Engineering Project:
To elevate your twin beyond your current ${projects.length} projects, build:

**"Production Distributed ${careerGoal.targetRole.includes('AI') ? 'Model Inference Gateway' : 'High-Throughput Task Service'}"**
- **Recommended Stack:** ${skills.map(s => s.name).slice(0, 4).join(', ') || 'Python, TypeScript, Docker, Redis'}
- **Core Architecture:** Implement asynchronous job processing, Redis caching layer, and automated Docker deployment.
- **Resume Impact:** Will boost your Project Portfolio metric from **${readinessScore.breakdown.projectPortfolio}%** to **${Math.min(100, readinessScore.breakdown.projectPortfolio + 18)}%**.`;
        } else if (qLower.includes('dsa') || qLower.includes('sprint') || qLower.includes('algorithm')) {
          reply = `### 2-Week Intensive DSA Sprint Plan:
- **Days 1–3 (Two Pointers & Sliding Window):** Solve 10 LeetCode Mediums (e.g., 3Sum, Minimum Window Substring).
- **Days 4–7 (Trees & Binary Search):** Master Tree Traversals, Invert Tree, and Search in Rotated Array.
- **Days 8–11 (Graphs BFS/DFS):** Implement Number of Islands, Course Schedule, and Dijkstra shortest path.
- **Days 12–14 (Dynamic Programming):** Classic 0/1 Knapsack, Coin Change, and Longest Increasing Subsequence.

*Goal: Increase DSA score from ${readinessScore.categories.dsa}% to 85%+.*`;
        } else {
          reply = `### Career Assistant Insights for ${profile.fullName || 'Candidate'}:
**Profile Context:** ${profile.degree || 'B.Tech'} in ${profile.major || 'Computer Science'} at ${profile.institution || 'University'} (Target: ${careerGoal.targetRole || 'Engineering'}).

**Key Guidance for your query:**
- **Recommended Action:** ${insights.recommendedNextStep}
- **Immediate Focus:** ${insights.highestImpactAction}
- **Career Risk to Mitigate:** ${insights.careerRisk}

Feel free to ask for a specific code review, interview question drill, or customized roadmap step!`;
        }

        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsThinking(false);
      }, 700);
    } catch (err) {
      setIsThinking(false);
      setErrorState('Failed to generate career assistant response. Please retry.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: `Chat session refreshed! Ready to assist you, ${profile.fullName || 'Student'}. What would you like to explore next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorState(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-[650px] shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Career Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                PROFILE-AWARE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized to {profile.fullName || 'Active Student'} • {careerGoal.targetRole || 'Target Role'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] opacity-75">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="hover:opacity-100 inline-flex items-center gap-1 cursor-pointer"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                Analyzing twin data...
              </span>
            </div>
          </div>
        )}

        {errorState && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorState}</span>
            </div>
            <button
              onClick={() => handleSend(messages[messages.length - 1]?.text)}
              className="font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Suggestions:</span>
        {starterPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <input
          id="ai-assistant-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${careerGoal.targetRole || 'career prep'}, interview strategy, or skill gaps...`}
          disabled={isThinking}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
        />
        <button
          id="ai-assistant-send-btn"
          type="submit"
          disabled={!input.trim() || isThinking}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
