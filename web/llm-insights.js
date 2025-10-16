// ============= NARRATIVE INSIGHTS (LLM) =============
let currentPostsData = null; // Store posts data globally for LLM analysis

// Store posts data when rendering (called from renderAll)
function storePostsData(posts) {
  currentPostsData = posts;
}

async function generateNarrativeInsights() {
  const btn = document.getElementById('generateInsightsBtn');
  const btnText = document.getElementById('btnText');
  const content = document.getElementById('narrativeInsightsContent');
  
  // Check if we have posts data
  if (!currentPostsData || currentPostsData.length === 0) {
    content.innerHTML = `
      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        ⚠️ Please upload your LinkedIn data first before generating insights.
      </div>
    `;
    return;
  }
  
  // Disable button and show loading state
  btn.disabled = true;
  btnText.textContent = '⏳ Generating...';
  
  content.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <div class="text-sm text-blue-800">
        Analyzing ${currentPostsData.length} posts with AI... This may take 10-15 seconds.
      </div>
    </div>
  `;
  
  try {
    // Call Flask API
    const response = await fetch('http://127.0.0.1:5000/generate-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posts: currentPostsData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate insights');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      displayNarrativeInsights(result.data);
    } else {
      throw new Error(result.error || 'Invalid response from server');
    }
    
  } catch (error) {
    console.error('Error generating insights:', error);
    
    let errorMessage = error.message;
    let troubleshooting = '';
    
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the insights server.';
      troubleshooting = `
        <div class="mt-2 text-xs space-y-1">
          <strong>Troubleshooting:</strong>
          <ol class="list-decimal pl-4 space-y-1 mt-1">
            <li>Make sure the API server is running: <code class="bg-gray-100 px-1 rounded">python linkedin_analysis_api.py</code></li>
            <li>Ensure your <code class="bg-gray-100 px-1 rounded">.env</code> file contains <code class="bg-gray-100 px-1 rounded">GEMINI_API_KEY</code></li>
            <li>Check that the server is running on <code class="bg-gray-100 px-1 rounded">http://127.0.0.1:5000</code></li>
          </ol>
        </div>
      `;
    }
    
    content.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-2">
          <div class="text-red-600 font-bold">❌</div>
          <div class="flex-1">
            <div class="text-sm font-medium text-red-800">${errorMessage}</div>
            ${troubleshooting}
          </div>
        </div>
      </div>
    `;
  } finally {
    // Re-enable button
    btn.disabled = false;
    btnText.textContent = '✨ Generate Insights';
  }
}

function displayNarrativeInsights(data) {
  const content = document.getElementById('narrativeInsightsContent');
  
  const insights = data.insights || [];
  const keyFinding = data.key_finding || '';
  const recommendation = data.recommendation || '';
  
  let html = '';
  
  // Key Finding (if available)
  if (keyFinding) {
    html += `
      <div class="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border-l-4 border-blue-500 rounded-lg">
        <div class="flex items-start gap-2">
          <div class="text-2xl">🎯</div>
          <div class="flex-1">
            <div class="font-semibold text-gray-800 mb-1">Key Finding</div>
            <div class="text-sm text-gray-700">${keyFinding}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Insights List
  if (insights.length > 0) {
    html += `
      <div class="space-y-2">
        <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Observations</div>
    `;
    
    insights.forEach((insight, idx) => {
      html += `
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-xs font-semibold text-blue-600">
            ${idx + 1}
          </div>
          <div class="flex-1 text-sm text-gray-700 leading-relaxed">${insight}</div>
        </div>
      `;
    });
    
    html += `</div>`;
  }
  
  // Recommendation section removed as requested
  
  // If no data
  if (!html) {
    html = `
      <div class="text-sm text-gray-500 italic">
        No insights generated. Please try again.
      </div>
    `;
  }
  
  content.innerHTML = html;
}

// ============= TOPIC ANALYSIS WITH LLM =============
async function analyzeTopicsWithLLM() {
  const btn = document.getElementById('analyzeTopicsBtn');
  const btnText = document.getElementById('topicBtnText');
  const resultsDiv = document.getElementById('llmTopicResults');
  
  // Check if we have posts data
  if (!currentPostsData || currentPostsData.length === 0) {
    resultsDiv.innerHTML = `
      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        ⚠️ Please upload your LinkedIn data first.
      </div>
    `;
    resultsDiv.style.display = 'block';
    return;
  }
  
  // Disable button and show loading state
  btn.disabled = true;
  btnText.textContent = '⏳ Analyzing...';
  
  resultsDiv.innerHTML = `
    <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
      <div class="text-xs text-purple-800">
        Analyzing topics in ${currentPostsData.length} posts... This may take 10-15 seconds.
      </div>
    </div>
  `;
  resultsDiv.style.display = 'block';
  
  try {
    // Call Flask API
    const response = await fetch('http://127.0.0.1:5000/analyze-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posts: currentPostsData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze topics');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      displayTopicAnalysis(result.data);
    } else {
      throw new Error(result.error || 'Invalid response from server');
    }
    
  } catch (error) {
    console.error('Error analyzing topics:', error);
    
    let errorMessage = error.message;
    let troubleshooting = '';
    
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server.';
      troubleshooting = `
        <div class="mt-2 text-xs">
          Make sure the API server is running.
        </div>
      `;
    }
    
    resultsDiv.innerHTML = `
      <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-2">
          <div class="text-red-600 font-bold text-sm">❌</div>
          <div class="flex-1">
            <div class="text-xs font-medium text-red-800">${errorMessage}</div>
            ${troubleshooting}
          </div>
        </div>
      </div>
    `;
  } finally {
    // Re-enable button
    btn.disabled = false;
    btnText.textContent = '🎯 Analyze with AI';
  }
}

function displayTopicAnalysis(data) {
  const resultsDiv = document.getElementById('llmTopicResults');
  
  const summary = data.summary || '';
  const topicStats = data.topic_stats || {};
  
  let html = '';
  
  // Summary
  if (summary) {
    html += `
      <div class="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-lg mb-3">
        <div class="text-xs font-semibold text-purple-900 mb-1">🤖 AI Analysis</div>
        <div class="text-xs text-purple-800">${summary}</div>
      </div>
    `;
  }
  
  // Topic breakdown with bars
  if (Object.keys(topicStats).length > 0) {
    html += `<div class="space-y-2">`;
    
    // Sort topics by count (descending)
    const sortedTopics = Object.entries(topicStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);  // Show top 10
    
    const maxCount = sortedTopics[0][1].count;
    
    sortedTopics.forEach(([topic, stats]) => {
      const percentage = Math.round((stats.count / maxCount) * 100);
      const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
      
      html += `
        <div class="space-y-1">
          <div class="flex justify-between items-baseline text-xs">
            <span class="font-medium text-gray-700">${topicLabel}</span>
            <span class="text-gray-500">${stats.count} posts • avg: ${Math.round(stats.avg_engagement)}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  }
  
  if (!html) {
    html = `
      <div class="text-xs text-gray-500 italic">
        No topic analysis available.
      </div>
    `;
  }
  
  resultsDiv.innerHTML = html;
  resultsDiv.style.display = 'block';
}

// ============= POST EVALUATION WITH LLM =============
async function evaluatePostsWithLLM() {
  const btn = document.getElementById('evaluatePostsBtn');
  const btnText = document.getElementById('evalBtnText');
  const content = document.getElementById('postEvaluationContent');
  
  // Check if we have posts data
  if (!currentPostsData || currentPostsData.length === 0) {
    content.innerHTML = `
      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        ⚠️ Please upload your LinkedIn data first before evaluating posts.
      </div>
    `;
    return;
  }
  
  // Disable button and show loading state
  btn.disabled = true;
  btnText.textContent = '⏳ Evaluating...';
  
  content.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
      <div class="text-sm text-green-800">
        Evaluating ${currentPostsData.length} posts with AI... This may take 10-15 seconds.
      </div>
    </div>
  `;
  
  try {
    // Call Flask API
    const response = await fetch('http://127.0.0.1:5000/evaluate-posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posts: currentPostsData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to evaluate posts');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      displayPostEvaluation(result.data);
    } else {
      throw new Error(result.error || 'Invalid response from server');
    }
    
  } catch (error) {
    console.error('Error evaluating posts:', error);
    
    let errorMessage = error.message;
    let troubleshooting = '';
    
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the evaluation server.';
      troubleshooting = `
        <div class="mt-2 text-xs space-y-1">
          <strong>Troubleshooting:</strong>
          <ol class="list-decimal pl-4 space-y-1 mt-1">
            <li>Make sure the API server is running: <code class="bg-gray-100 px-1 rounded">python linkedin_analysis_api.py</code></li>
            <li>Ensure your <code class="bg-gray-100 px-1 rounded">.env</code> file contains <code class="bg-gray-100 px-1 rounded">GEMINI_API_KEY</code></li>
            <li>Check that the server is running on <code class="bg-gray-100 px-1 rounded">http://127.0.0.1:5000</code></li>
          </ol>
        </div>
      `;
    }
    
    content.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-2">
          <div class="text-red-600 font-bold">❌</div>
          <div class="flex-1">
            <div class="text-sm font-medium text-red-800">${errorMessage}</div>
            ${troubleshooting}
          </div>
        </div>
      </div>
    `;
  } finally {
    // Re-enable button
    btn.disabled = false;
    btnText.textContent = '🎯 Evaluate Posts';
  }
}

function displayPostEvaluation(data) {
  const content = document.getElementById('postEvaluationContent');
  const strengthsContent = document.getElementById('postEvaluationStrengthsContent');
  
  const score = data.score_100 || 0;
  const rubric = data.rubric_breakdown || {};
  const strengths = data.strengths || [];
  const improvements = data.improvements || [];
  const summary = data.one_line_summary || '';
  const analysis = data.overall_analysis || '';
  
  // Update the section title to show the score
  const sectionTitle = document.querySelector('#postEvaluationSection .section-title');
  if (sectionTitle) {
    sectionTitle.innerHTML = `📝 Post Quality Evaluation • ${score}/100`;
  }
  
  // Part 1: Summary and Rubric
  let html = '';
  
  // Summary Header (without letter grade)
  html += `
    <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg mb-4">
      <div class="text-sm text-green-700">${summary}</div>
    </div>
  `;
  
  // Rubric Breakdown
  if (Object.keys(rubric).length > 0) {
    html += `
      <div class="mb-4">
        <div class="text-sm font-semibold text-gray-700 mb-3">📋 Evaluation Rubric</div>
        
        <!-- Scoring Scale Note -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="text-xs text-blue-800">
            <strong>Note:</strong> Different parameters have different weightage and are scored on different scales. 
            Some parameters are scored on 10-point scales, others on 15, 20, or 25-point scales based on their importance in the evaluation rubric.
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    `;
    
    const rubricLabels = {
      depth_originality: 'Depth & Originality',
      hook_effectiveness: 'Hook Effectiveness',
      evidence_examples: 'Evidence & Examples',
      actionability: 'Actionability',
      conclusion_strength: 'Conclusion Strength',
      personal_story: 'Personal Story',
      emotional_resonance: 'Emotional Resonance'
    };
    
    const parameterDescriptions = {
      depth_originality: 'Non-obvious, earned thinking that explains mechanisms, tradeoffs, and edge cases rather than slogans',
      hook_effectiveness: 'Relevant, specific, and scroll-stopping content without clickbait',
      evidence_examples: 'Specific metrics, cases, or artifacts with uncertainty labeled and concrete examples',
      actionability: 'Concrete takeaways, patterns, checklists, or numeric guardrails readers can try soon',
      conclusion_strength: 'Crisp takeaway and/or question that invites discussion',
      personal_story: 'First-person or founder-level anecdote with concrete details tied back to the claim',
      emotional_resonance: 'Content that evokes appropriate emotion through stakes, specificity, tension, or vulnerability'
    };
    
    const maxScores = {
      depth_originality: 25,
      hook_effectiveness: 10,
      evidence_examples: 20,
      actionability: 15,
      conclusion_strength: 10,
      personal_story: 10,
      emotional_resonance: 10
    };
    
    Object.entries(rubric).forEach(([key, score]) => {
      const maxScore = maxScores[key] || 10;
      const percentage = (score / maxScore) * 100;
      const label = rubricLabels[key] || key.replace('_', ' ');
      
      let colorClass = 'bg-teal-200';
      if (percentage >= 80) colorClass = 'bg-gradient-to-r from-emerald-400 to-teal-500';
      else if (percentage >= 60) colorClass = 'bg-gradient-to-r from-blue-400 to-teal-400';
      else if (percentage >= 40) colorClass = 'bg-gradient-to-r from-cyan-400 to-blue-400';
      else colorClass = 'bg-gradient-to-r from-teal-400 to-cyan-400';
      
      const description = parameterDescriptions[key] || '';
      
      html += `
        <div class="p-3 bg-white rounded-lg border border-gray-200">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-medium text-gray-700">${label}</span>
            <span class="text-xs font-semibold text-gray-600">${score}/${maxScore}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div class="${colorClass} h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
          <div class="text-xs text-gray-600 leading-relaxed">${description}</div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  }
  
  content.innerHTML = html;
  
  // Part 2: Overall Analysis, Strengths and Areas for Improvement
  let strengthsHtml = '';
  
  // Overall Analysis
  if (analysis) {
    strengthsHtml += `
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div class="flex items-start gap-2">
          <div class="text-xl">📊</div>
          <div class="flex-1">
            <div class="font-semibold text-blue-800 mb-1">Overall Analysis</div>
            <div class="text-sm text-blue-700">${analysis}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Strengths
  if (strengths.length > 0) {
    strengthsHtml += `
      <div class="mb-4">
        <div class="text-sm font-semibold text-gray-700 mb-2">✅ Strengths</div>
        <div class="space-y-2">
    `;
    
    strengths.forEach(strength => {
      strengthsHtml += `
        <div class="flex items-start gap-2 p-2">
          <div class="text-green-600 text-sm">✓</div>
          <div class="text-sm text-gray-700">${strength}</div>
        </div>
      `;
    });
    
    strengthsHtml += `</div></div>`;
  }
  
  // Improvements
  if (improvements.length > 0) {
    strengthsHtml += `
      <div class="mb-4">
        <div class="text-sm font-semibold text-gray-700 mb-2">🔧 Areas for Improvement</div>
        <div class="space-y-2">
    `;
    
    improvements.forEach(improvement => {
      strengthsHtml += `
        <div class="flex items-start gap-2 p-2">
          <div class="text-blue-600 text-sm">→</div>
          <div class="text-sm text-gray-700">${improvement}</div>
        </div>
      `;
    });
    
    strengthsHtml += `</div></div>`;
  }
  
  strengthsContent.innerHTML = strengthsHtml;
}

// ============= POSITIONING ANALYSIS WITH LLM =============
async function analyzePositioningWithLLM() {
  const btn = document.getElementById('analyzePositioningBtn');
  const btnText = document.getElementById('positioningBtnText');
  const content = document.getElementById('positioningAnalysisContent');
  
  // Check if we have posts data
  if (!currentPostsData || currentPostsData.length === 0) {
    content.innerHTML = `
      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        ⚠️ Please upload your LinkedIn data first before analyzing positioning.
      </div>
    `;
    return;
  }
  
  // Disable button and show loading state
  btn.disabled = true;
  btnText.textContent = '⏳ Analyzing...';
  
  content.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      <div class="text-sm text-purple-800">
        Analyzing positioning in ${currentPostsData.length} posts with AI... This may take 10-15 seconds.
      </div>
    </div>
  `;
  
  try {
    // Call Flask API
    const response = await fetch('http://127.0.0.1:5000/analyze-positioning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posts: currentPostsData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze positioning');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      displayPositioningAnalysis(result.data);
    } else {
      throw new Error(result.error || 'Invalid response from server');
    }
    
  } catch (error) {
    console.error('Error analyzing positioning:', error);
    
    let errorMessage = error.message;
    let troubleshooting = '';
    
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the positioning analysis server.';
      troubleshooting = `
        <div class="mt-2 text-xs space-y-1">
          <strong>Troubleshooting:</strong>
          <ol class="list-decimal pl-4 space-y-1 mt-1">
            <li>Make sure the API server is running: <code class="bg-gray-100 px-1 rounded">python linkedin_analysis_api.py</code></li>
            <li>Ensure your <code class="bg-gray-100 px-1 rounded">.env</code> file contains <code class="bg-gray-100 px-1 rounded">GEMINI_API_KEY</code></li>
            <li>Check that the server is running on <code class="bg-gray-100 px-1 rounded">http://127.0.0.1:5000</code></li>
          </ol>
        </div>
      `;
    }
    
    content.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-2">
          <div class="text-red-600 font-bold">❌</div>
          <div class="flex-1">
            <div class="text-sm font-medium text-red-800">${errorMessage}</div>
            ${troubleshooting}
          </div>
        </div>
      </div>
    `;
  } finally {
    // Re-enable button
    btn.disabled = false;
    btnText.textContent = '🚀 Analyze Positioning';
  }
}

function displayPositioningAnalysis(data) {
  const content = document.getElementById('positioningAnalysisContent');
  
  const currentBranding = data.current_branding || {};
  const futureBranding = data.future_branding || {};
  const actionPlan = data.action_plan || {};
  
  let html = '';
  
  // Current Branding Section
  html += `
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-3 h-3 bg-orange-400 rounded-full"></div>
        <div class="text-lg font-semibold text-gray-800">Current Branding</div>
      </div>
      <div class="border border-gray-200 rounded-lg p-4">
  `;
  
  if (currentBranding.positioning_summary) {
    html += `
      <div class="mb-3">
        <div class="text-sm text-gray-700">${currentBranding.positioning_summary}</div>
      </div>
    `;
  }
  
  // Show only key themes and expertise areas in a compact format
  if (currentBranding.key_themes && currentBranding.key_themes.length > 0) {
    html += `
      <div class="mb-3">
        <div class="text-sm font-semibold text-gray-600 mb-1">Key Themes</div>
        <div class="flex flex-wrap gap-1">
          ${currentBranding.key_themes.slice(0, 5).map(theme => 
            `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${theme}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }
  
  if (currentBranding.expertise_areas && currentBranding.expertise_areas.length > 0) {
    html += `
      <div class="mb-3">
        <div class="text-sm font-semibold text-gray-600 mb-1">Expertise</div>
        <div class="flex flex-wrap gap-1">
          ${currentBranding.expertise_areas.slice(0, 4).map(area => 
            `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${area}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }
  
  html += `</div></div>`;
  
  
  content.innerHTML = html;
}

// ============= INITIALIZE LLM INSIGHTS =============
function initializeLLMInsights() {
  // Initialize narrative insights button
  const generateInsightsBtn = document.getElementById('generateInsightsBtn');
  if (generateInsightsBtn) {
    generateInsightsBtn.addEventListener('click', generateNarrativeInsights);
  }
  
  // Initialize topic analysis button
  const analyzeTopicsBtn = document.getElementById('analyzeTopicsBtn');
  if (analyzeTopicsBtn) {
    analyzeTopicsBtn.addEventListener('click', analyzeTopicsWithLLM);
  }
  
  // Initialize post evaluation button
  const evaluatePostsBtn = document.getElementById('evaluatePostsBtn');
  if (evaluatePostsBtn) {
    evaluatePostsBtn.addEventListener('click', evaluatePostsWithLLM);
  }
  
  // Initialize positioning analysis button
  const analyzePositioningBtn = document.getElementById('analyzePositioningBtn');
  if (analyzePositioningBtn) {
    analyzePositioningBtn.addEventListener('click', analyzePositioningWithLLM);
  }
}
