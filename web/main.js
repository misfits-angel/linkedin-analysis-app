// ============= MAIN APPLICATION LOGIC =============

// Global variables for DOM elements
let m_posts, m_active, m_med, m_p90;

// Initialize DOM element references
function initializeDOMElements() {
  m_posts = document.getElementById('m_posts');
  m_active = document.getElementById('m_active');
  m_med = document.getElementById('m_med');
  m_p90 = document.getElementById('m_p90');
}

// ============= RENDERING FUNCTIONS =============
function renderSummary(d){
  document.getElementById('personName').textContent = d?.profile?.name || d?.summary?.name || 'LinkedIn Yearly Wrap';
  if (m_posts) m_posts.textContent = d?.summary?.posts_last_12m ?? '-';
  if (m_active) m_active.textContent = d?.summary?.active_months ?? '-';
  if (m_med) m_med.textContent = d?.summary?.median_engagement ?? '-';
  if (m_p90) m_p90.textContent = d?.summary?.p90_engagement ?? '-';
  
  // Set today's date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  document.getElementById('auditDate').textContent = dateString;
  
  // Calculate audit period based on data
  const auditPeriod = calculateAuditPeriod(d);
  document.getElementById('auditPeriod').textContent = auditPeriod;
}

function calculateAuditPeriod(data) {
  console.log('calculateAuditPeriod called with data:', data);
  
  if (!data || !data.summary) {
    console.log('No data or summary, returning 1 year');
    return '1 year';
  }
  
  // Use the full date range from the data processing
  if (data.fullDateRange && data.fullDateRange.firstDate && data.fullDateRange.lastDate) {
    console.log('Using full date range:', data.fullDateRange);
    
    const formatDate = (date) => {
      if (date instanceof Date) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric' 
        });
      } else if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric' 
          });
        }
      }
      return null;
    };
    
    const startDate = formatDate(data.fullDateRange.firstDate);
    const endDate = formatDate(data.fullDateRange.lastDate);
    
    if (startDate && endDate) {
      console.log('Formatted range:', startDate, '-', endDate);
      return `${startDate} - ${endDate}`;
    }
  }
  
  // Fallback to 1 year
  console.log('Falling back to 1 year');
  return '1 year';
}

function renderTopicBullets(d){
  const root = document.getElementById('topicBullets');
  root.innerHTML = '';
  const llmSummary = d?.topics?.llm_summary || '';
  
  // Only show LLM analysis results
  if(llmSummary) {
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100';
    summaryDiv.innerHTML = `
      <div class="flex items-start gap-2">
        <span style="font-size: 1.2rem;">🤖</span>
        <div>
          <div class="font-semibold text-blue-900 mb-1" style="font-size: 0.75rem;">AI Analysis</div>
          <div class="text-sm text-blue-900 leading-relaxed">${llmSummary}</div>
        </div>
      </div>
    `;
    root.appendChild(summaryDiv);
  } else {
    root.innerHTML = '<li>No topic analysis available. Click "🎯 Analyze with AI" to get AI-powered topic insights.</li>';
  }
}

function renderPostTypeBullets(d){
  const root = document.getElementById('postTypeBullets');
  root.innerHTML = '';
  const share = d?.mix?.type_share || {};
  const med = d?.mix?.type_median_engagement || {};
  const mean = d?.mix?.type_mean_engagement || {};
  const q1 = d?.mix?.type_q1_engagement || {};
  const q3 = d?.mix?.type_q3_engagement || {};
  const max = d?.mix?.type_max_engagement || {};
  const counts = d?.mix?.type_counts || {};
  const keys = Object.keys({...share, ...med});
  
  if(keys.length===0){ 
    root.innerHTML = '<li>No post type data available.</li>'; 
    return; 
  }
  
  // Sort by median engagement (highest to lowest)
  const sorted = keys.map(k=>({
    k, 
    med: med[k]||0, 
    mean: mean[k]||0,
    q1: q1[k]||0,
    q3: q3[k]||0,
    max: max[k]||0,
    share: share[k]||0, 
    count: counts[k]||0
  })).sort((a,b)=>b.med-a.med);
  
  sorted.forEach(t=>{
    const typeLabel = t.k.charAt(0).toUpperCase() + t.k.slice(1);
    const postLabel = t.count === 1 ? 'post' : 'posts';
    
    // Main summary line
    const li = document.createElement('li');
    li.innerHTML = `<strong>${typeLabel} ${postLabel}:</strong> ${t.count} ${postLabel} (${Math.round(t.share*100)}%)`;
    root.appendChild(li);
    
    // Statistical breakdown - indented
    const statsDiv = document.createElement('div');
    statsDiv.style.marginLeft = '1.5rem';
    statsDiv.style.marginTop = '0.25rem';
    statsDiv.style.fontSize = '0.875rem';
    statsDiv.style.color = '#4b5563';
    statsDiv.innerHTML = `
      <div style="line-height: 1.5;">
        • Median: <strong>${t.med}</strong> | Mean: <strong>${t.mean}</strong> | Peak: <strong>${t.max}</strong><br>
        • Bottom 25%: ${t.q1} | Top 25%: <strong>${t.q3}</strong>
      </div>
    `;
    root.appendChild(statsDiv);
  });
  
  // Add comprehensive insights
  if(sorted.length > 1) {
    const spacerDiv = document.createElement('div');
    spacerDiv.style.marginTop = '0.75rem';
    root.appendChild(spacerDiv);
    
    // 1. Performance comparison
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if(best.med > worst.med * 1.5) {
      const li = document.createElement('li');
      const bestLabel = best.k.charAt(0).toUpperCase() + best.k.slice(1);
      const worstLabel = worst.k.charAt(0).toUpperCase() + worst.k.slice(1);
      const improvement = Math.round((best.med / worst.med - 1) * 100);
      li.innerHTML = `<strong>💡 Performance Gap:</strong> ${bestLabel} posts outperform ${worstLabel} posts by ${improvement}% on median engagement`;
      li.style.color = '#157187';
      li.style.fontWeight = '500';
      root.appendChild(li);
    }
    
    // 2. Top quartile ceiling (growth potential)
    const bestQ3 = sorted[0];
    if(bestQ3.count >= 3) {
      const li = document.createElement('li');
      const bestLabel = bestQ3.k.charAt(0).toUpperCase() + bestQ3.k.slice(1);
      li.innerHTML = `<strong>🎯 High Ceiling:</strong> ${bestLabel} posts' top 25% achieve ${bestQ3.q3}+ engagement (${Math.round((bestQ3.q3/bestQ3.med - 1) * 100)}% above median)`;
      li.style.color = '#157187';
      li.style.fontWeight = '500';
      root.appendChild(li);
    }
    
    // 3. Consistency analysis
    let mostConsistent = null;
    let bestConsistencyScore = Infinity;
    sorted.forEach(t => {
      if(t.count >= 5) {
        const spread = t.q3 - t.q1;
        const relativeSpread = spread / t.med;
        if(relativeSpread < bestConsistencyScore) {
          bestConsistencyScore = relativeSpread;
          mostConsistent = t;
        }
      }
    });
    
    if(mostConsistent && bestConsistencyScore < 1) {
      const li = document.createElement('li');
      const label = mostConsistent.k.charAt(0).toUpperCase() + mostConsistent.k.slice(1);
      li.innerHTML = `<strong>📊 Most Consistent:</strong> ${label} posts show reliable performance (Q1: ${mostConsistent.q1} → Q3: ${mostConsistent.q3})`;
      li.style.color = '#7c3aed';
      li.style.fontWeight = '500';
      root.appendChild(li);
    }
    
    // 4. Sample size warning
    const smallSample = sorted.filter(t => t.count < 5 && t.count > 0);
    if(smallSample.length > 0) {
      const li = document.createElement('li');
      const types = smallSample.map(t => t.k.charAt(0).toUpperCase() + t.k.slice(1)).join(', ');
      const countLabels = smallSample.map(t => {
        const postLabel = t.count === 1 ? 'post' : 'posts';
        return `${t.count} ${postLabel}`;
      }).join(', ');
      li.innerHTML = `<strong>⚠️ Small Sample:</strong> ${types} (${countLabels}) - insights may vary with more data`;
      li.style.color = '#d97706';
      li.style.fontWeight = '500';
      li.style.fontSize = '0.8125rem';
      root.appendChild(li);
    }
    
    // 5. Outlier detection (mean vs median)
    const skewed = sorted.filter(t => t.count >= 5 && t.mean > t.med * 1.3);
    if(skewed.length > 0) {
      const t = skewed[0];
      const li = document.createElement('li');
      const label = t.k.charAt(0).toUpperCase() + t.k.slice(1);
      li.innerHTML = `<strong>🌟 Hidden Gems:</strong> ${label} posts have viral potential (mean: ${t.mean} vs median: ${t.med}) - some posts greatly outperform the rest`;
      li.style.color = '#dc2626';
      li.style.fontWeight = '500';
      root.appendChild(li);
    }
  }
}

function renderPostingRhythm(d){
  const root = document.getElementById('postingRhythm');
  root.innerHTML = '';
  const rhythm = d?.rhythm || {};
  
  if(!rhythm.posts_per_month_avg){ 
    root.innerHTML = '<div class="text-sm text-gray-600">Rhythm data not available.</div>'; 
    return; 
  }
  
  // Create a grid of metric cards
  const gridDiv = document.createElement('div');
  gridDiv.className = 'grid grid-cols-2 lg:grid-cols-4 gap-3';
  
  // Metric 1: Posts per month
  const metric1 = document.createElement('div');
  metric1.className = 'bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200';
  metric1.innerHTML = `
    <div class="text-xs text-gray-600 mb-1">Avg Posts/Month</div>
    <div class="text-2xl font-bold text-gray-800">${rhythm.posts_per_month_avg}</div>
  `;
  gridDiv.appendChild(metric1);
  
  // Metric 2: Longest gap
  const metric2 = document.createElement('div');
  metric2.className = 'bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200';
  
  let gapDateRange = '';
  if (rhythm.longest_gap_start && rhythm.longest_gap_end) {
    const startDate = new Date(rhythm.longest_gap_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(rhythm.longest_gap_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    gapDateRange = `<div class="text-xs text-gray-500 mt-1">${startDate} - ${endDate}</div>`;
  }
  
  metric2.innerHTML = `
    <div class="text-xs text-gray-600 mb-1">Longest Gap</div>
    <div class="text-2xl font-bold text-gray-800">${rhythm.longest_gap_days} <span class="text-sm">days</span></div>
    ${gapDateRange}
  `;
  gridDiv.appendChild(metric2);
  
  // Metric 3: Average gap
  const metric3 = document.createElement('div');
  metric3.className = 'bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200';
  metric3.innerHTML = `
    <div class="text-xs text-gray-600 mb-1">Avg Posting Gap</div>
    <div class="text-2xl font-bold text-gray-800">${rhythm.avg_gap_days} <span class="text-sm">days</span></div>
  `;
  gridDiv.appendChild(metric3);
  
  // Metric 4: Peak month
  const peakMonthDisplay = rhythm.peak_month ? new Date(rhythm.peak_month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A';
  const metric4 = document.createElement('div');
  metric4.className = 'bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200';
  const peakPostLabel = rhythm.peak_month_count === 1 ? 'post' : 'posts';
  metric4.innerHTML = `
    <div class="text-xs text-gray-600 mb-1">Peak Month</div>
    <div class="text-lg font-bold text-gray-800">${peakMonthDisplay}</div>
    <div class="text-xs text-gray-600">${rhythm.peak_month_count} ${peakPostLabel}</div>
  `;
  gridDiv.appendChild(metric4);
  
  root.appendChild(gridDiv);
}

function renderTimingInsights(d){
  const root = document.getElementById('timingInsights');
  root.innerHTML = '';
  const timing = d?.timingInsights || {};
  
  if(!timing.day_of_week || Object.keys(timing.day_of_week).length === 0){ 
    root.innerHTML = '<div class="text-sm text-gray-600">Timing data not available.</div>'; 
    return; 
  }
  
  // Day of Week section
  const dowSection = document.createElement('div');
  dowSection.className = 'mb-4';
  dowSection.innerHTML = `
    <div class="text-sm font-semibold text-gray-700 mb-2">📅 Performance by Day of Week</div>
    <div class="text-xs text-gray-500 mb-2">Shows: Posts count • Median engagement</div>
  `;
  
  const dowGrid = document.createElement('div');
  dowGrid.className = 'grid grid-cols-7 gap-2 text-center';
  
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbr = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
  
  dayOrder.forEach(day => {
    const stats = timing.day_of_week[day];
    const isActive = stats && stats.count > 0;
    const isBest = timing.best_day === day;
    
    const dayCard = document.createElement('div');
    dayCard.className = `p-2 rounded-lg text-xs ${isBest ? 'bg-blue-100 border-2 border-blue-500' : isActive ? 'bg-gray-100 border border-gray-300' : 'bg-gray-50 border border-gray-200 opacity-50'}`;
    
    if(isActive) {
      const postLabel = stats.count === 1 ? 'post' : 'posts';
      dayCard.innerHTML = `
        <div class="font-semibold text-gray-800">${dayAbbr[day]}</div>
        <div class="text-xs text-gray-600">${stats.count} ${postLabel}</div>
        <div class="font-bold text-blue-700">${stats.median}</div>
        ${isBest ? '<div class="text-xs mt-1">⭐</div>' : ''}
      `;
    } else {
      dayCard.innerHTML = `
        <div class="font-semibold text-gray-400">${dayAbbr[day]}</div>
        <div class="text-xs text-gray-400">-</div>
      `;
    }
    
    dowGrid.appendChild(dayCard);
  });
  
  dowSection.appendChild(dowGrid);
  root.appendChild(dowSection);
  
  // Best day insight
  if(timing.best_day) {
    const insightDiv = document.createElement('div');
    insightDiv.className = 'p-3 bg-blue-50 border border-blue-200 rounded-lg mt-3';
    const bestDayStats = timing.day_of_week[timing.best_day];
    const postLabel = bestDayStats.count === 1 ? 'post' : 'posts';
    insightDiv.innerHTML = `
      <div class="text-sm font-semibold text-blue-800 mb-1">🎯 Best Day to Post</div>
      <div class="text-sm text-blue-700">${timing.best_day}s show your highest median engagement (${bestDayStats.median} from ${bestDayStats.count} ${postLabel})</div>
    `;
    root.appendChild(insightDiv);
  }
}

function analyzePost(post, allPosts) {
  const hypotheses = [];
  const text = (post.content || '').toLowerCase();
  const avgEng = allPosts.length > 0 
    ? allPosts.reduce((sum, p) => sum + (p.eng || 0), 0) / allPosts.length 
    : 0;
  
  // Performance vs average
  if (avgEng > 0 && post.eng > avgEng * 2) {
    hypotheses.push('Significantly outperformed average engagement');
  }
  
  // Topic analysis
  if (text.match(/\b(ai|ml|automation|artificial intelligence)\b/i)) {
    hypotheses.push('AI/tech topics resonate with your audience');
  }
  if (text.match(/\b(hiring|job|career|opportunity)\b/i)) {
    hypotheses.push('Hiring/career content drives interest');
  }
  
  // Engagement pattern
  const commentRatio = (post.comments || 0) / (post.likes || 1);
  if (commentRatio > 0.3) {
    hypotheses.push('High comment-to-like ratio indicates strong conversation');
  }
  
  // Format analysis
  if (post.type === 'carousel') {
    hypotheses.push('Carousel format encourages swipe engagement and dwell time');
  }
  if (post.type === 'video') {
    hypotheses.push('Video format captures attention effectively');
  }
  if (post.type === 'image') {
    hypotheses.push('Visual content stops the scroll');
  }
  
  // Content structure
  if (text.length > 0 && text.length < 300) {
    hypotheses.push('Concise posts are easy to consume');
  }
  if (text.includes('?')) {
    hypotheses.push('Questions drive engagement and replies');
  }
  if (text.match(/\b(here's|here are|tips?|steps?|ways?)\b/i)) {
    hypotheses.push('Educational/actionable content provides value');
  }
  
  return hypotheses.length > 0 ? hypotheses : ['Clear value proposition and authentic voice likely helped'];
}

function renderTopPosts(d){
  const root = document.getElementById('topPosts');
  root.innerHTML = '';
  const posts = ensureArray(d?.posts);
  
  if(posts.length===0){ 
    root.innerHTML = '<div class="text-sm text-gray-500">No post-level data available. Upload CSV to enable this.</div>'; 
    return; 
  }
  
  const ranked = posts.map(p=>({ 
    ...p, 
    eng: (p.eng != null ? p.eng : (Number(p.likes||0) + Number(p.comments||0))) 
  })).sort((a,b)=>b.eng-a.eng);
  
  ranked.slice(0, CONFIG.topPostsCount).forEach((p,i)=>{
    const tile = document.createElement('div');
    tile.className='p-3 bg-gray-50 rounded-lg border border-gray-100';
    
    const fullContent = p.content || p.snippet || '';
    const truncatedContent = clip(fullContent, CONFIG.clipLength.post);
    const needsExpansion = fullContent.length > CONFIG.clipLength.post;
    const uniqueId = `post-${i}`;
    
    tile.innerHTML = `
      <div class="text-xs text-gray-600 mb-1">
        <span class="font-semibold">#${i+1}</span> • 
        ${(p.type||'text').toUpperCase()} • 
        ${p.eng} engagement
        ${p.likes ? `(${p.likes} likes, ${p.comments||0} comments)` : ''}
      </div>
      <div class="text-sm text-gray-800">
        <span class="post-content-preview">${truncatedContent}</span>
        ${needsExpansion ? `
          <div class="post-content-full" id="${uniqueId}">
            <div class="mt-2 pt-2 border-t border-gray-200">${fullContent}</div>
          </div>
        ` : ''}
      </div>
      <div class="text-xs text-gray-500 mt-1">Month: ${p.month?labelMonth(p.month):'-'}</div>
      <div class="flex items-baseline gap-3 mt-2">
        ${p.url ? `<a href="${p.url}" target="_blank" class="post-link">🔗 View on LinkedIn</a>` : ''}
        ${needsExpansion ? `<span class="toggle-content" onclick="togglePostContent('${uniqueId}', this)">📖 Read full post</span>` : ''}
      </div>
    `;
    root.appendChild(tile);
  });
}

function renderPeerComparison(d){
  const section = document.getElementById('peerComparisonSection');
  const content = document.getElementById('peerComparisonContent');
  
  if (!section || !content) return;
  
  // Show the section if we have main data
  if (d && d.summary) {
    section.style.display = 'block';
  }
  
  // Check if we have peer data
  const peerData = window.__PEER_DATA__;
  if (!peerData) {
    content.innerHTML = `
      <div class="text-sm text-gray-500 italic">
        Upload a similar LinkedIn CSV file to compare your performance metrics with a peer.
      </div>
    `;
    return;
  }
  
  // Render comparison
  content.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Your Metrics -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div class="font-semibold text-blue-800">You (${d.profile?.name || 'LinkedIn User'})</div>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Posts (12m):</span>
            <span class="font-semibold">${d.summary?.posts_last_12m || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Median Engagement:</span>
            <span class="font-semibold">${d.summary?.median_engagement || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">P90 Engagement:</span>
            <span class="font-semibold">${d.summary?.p90_engagement || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Active Months:</span>
            <span class="font-semibold">${d.summary?.active_months || 0}</span>
          </div>
        </div>
      </div>
      
      <!-- Peer Metrics -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
          <div class="font-semibold text-purple-800">Peer (${peerData.profile?.name || 'Peer User'})</div>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Posts (12m):</span>
            <span class="font-semibold">${peerData.summary?.posts_last_12m || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Median Engagement:</span>
            <span class="font-semibold">${peerData.summary?.median_engagement || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">P90 Engagement:</span>
            <span class="font-semibold">${peerData.summary?.p90_engagement || 0}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Active Months:</span>
            <span class="font-semibold">${peerData.summary?.active_months || 0}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Comparison Insights -->
    <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="text-sm font-semibold text-gray-700 mb-2">📊 Key Insights</div>
      <div class="space-y-1 text-sm text-gray-600">
        ${generateComparisonInsights(d, peerData)}
      </div>
    </div>
    
    <!-- Clear Peer Data Button -->
    <div class="mt-4 text-center">
      <button 
        onclick="clearPeerData()"
        class="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
        🗑️ Clear Peer Data
      </button>
    </div>
  `;
}

function generateComparisonInsights(you, peer) {
  const insights = [];
  
  // Posts comparison
  const yourPosts = you.summary?.posts_last_12m || 0;
  const peerPosts = peer.summary?.posts_last_12m || 0;
  if (yourPosts > 0 && peerPosts > 0) {
    const postDiff = Math.round(((yourPosts - peerPosts) / peerPosts) * 100);
    if (Math.abs(postDiff) > 10) {
      insights.push(`📝 ${postDiff > 0 ? 'You post' : 'Peer posts'} ${Math.abs(postDiff)}% more frequently`);
    }
  }
  
  // Engagement comparison
  const yourMedian = you.summary?.median_engagement || 0;
  const peerMedian = peer.summary?.median_engagement || 0;
  if (yourMedian > 0 && peerMedian > 0) {
    const engagementDiff = Math.round(((yourMedian - peerMedian) / peerMedian) * 100);
    if (Math.abs(engagementDiff) > 15) {
      insights.push(`🎯 ${engagementDiff > 0 ? 'Your' : 'Peer\'s'} median engagement is ${Math.abs(engagementDiff)}% higher`);
    }
  }
  
  // P90 comparison
  const yourP90 = you.summary?.p90_engagement || 0;
  const peerP90 = peer.summary?.p90_engagement || 0;
  if (yourP90 > 0 && peerP90 > 0) {
    const p90Diff = Math.round(((yourP90 - peerP90) / peerP90) * 100);
    if (Math.abs(p90Diff) > 20) {
      insights.push(`🚀 ${p90Diff > 0 ? 'Your' : 'Peer\'s'} top 10% posts perform ${Math.abs(p90Diff)}% better`);
    }
  }
  
  // Activity consistency
  const yourActive = you.summary?.active_months || 0;
  const peerActive = peer.summary?.active_months || 0;
  if (yourActive > 0 && peerActive > 0) {
    const activeDiff = yourActive - peerActive;
    if (Math.abs(activeDiff) > 2) {
      insights.push(`📅 ${activeDiff > 0 ? 'You are' : 'Peer is'} ${Math.abs(activeDiff)} months more consistent`);
    }
  }
  
  if (insights.length === 0) {
    insights.push('📊 Similar performance levels - both profiles show comparable metrics');
  }
  
  return insights.map(insight => `<div>${insight}</div>`).join('');
}

function clearPeerData() {
  window.__PEER_DATA__ = null;
  const section = document.getElementById('peerComparisonSection');
  if (section) {
    section.style.display = 'none';
  }
}

function renderAll(d){
  renderSummary(d);
  renderPostsPerMonth(d);
  renderMedianByMonth(d);
  renderFormatMix(d);
  renderActionMix(d);
  renderTopicBullets(d);
  renderPostTypeBullets(d);
  renderPostingRhythm(d);
  renderTimingInsights(d);
  renderTopPosts(d);
  renderPeerComparison(d);
  renderUnstoppableValueProp(d);
  window.__CURRENT__ = d;
  
  // Store posts for LLM insights (if available)
  if (d.posts && Array.isArray(d.posts)) {
    // Convert processed posts back to format expected by LLM
    const postsForLLM = d.posts.map(p => ({
      postContent: p.txt || p.content || '',
      likeCount: p.likes || 0,
      commentCount: p.comments || 0,
      repostCount: p.reposts || 0,
      type: p.type || 'Text',
      imgUrl: p.hasImage ? 'present' : '',
      postTimestamp: p.date || '',
      postUrl: p.url || ''
    }));
    storePostsData(postsForLLM);
  }
}

// ============= AUTO-RENDER ON LOAD =============
function initializeApp() {
  const saved = loadSavedData();
  if (saved) {
    // Validate saved data before using
    const validation = validateData(saved);
    if (validation.valid) {
      // Additional check: ensure chart data is consistent
      if (saved.trends?.posts_per_month && saved.trends?.month_median) {
        const postsMonths = new Set(saved.trends.posts_per_month.map(p => p.month));
        const medianMonths = new Set(saved.trends.month_median.map(m => m.month));
        
        // Check if month data is consistent between charts
        const monthsMatch = postsMonths.size === medianMonths.size && 
          [...postsMonths].every(month => medianMonths.has(month));
        
        if (!monthsMatch) {
          console.warn('Chart data inconsistency detected, re-rendering charts...');
          // The chart rendering functions will now handle this correctly
        }
      }
      
      renderAll(saved);
      const clearDataBtn = document.getElementById('clearData');
      if (clearDataBtn) {
        clearDataBtn.style.display = 'flex';
      }
      return;
    } else {
      console.warn('Saved data invalid, clearing:', validation.errors);
      localStorage.removeItem(CONFIG.storageKeys.data);
      localStorage.removeItem(CONFIG.storageKeys.timestamp);
    }
  }
  
  // No sample data loaded - user must upload their own data
  console.log('No saved data found. Please upload your LinkedIn CSV or JSON file.');
}

// ============= INITIALIZATION =============
function initializeMainApp() {
  // Initialize DOM elements
  initializeDOMElements();
  
  // Initialize UI interactions
  initializeMenuToggle();
  initializePdfSectionControls();
  initializePdfDownload();
  initializePrintPage();
  initializeClearData();
  
  // Initialize the app
  initializeApp();
}

// Wait for both DOM and Chart.js to be ready
window.addEventListener('load', function() {
  // Ensure Chart.js is loaded and plugin is registered
  if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    console.log('Chart.js and plugins loaded successfully');
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
      initializeMainApp();
    }, 100);
  } else {
    console.error('Chart.js not loaded properly');
    // Fallback: try again after a delay
    setTimeout(() => {
      if (typeof Chart !== 'undefined') {
        initializeMainApp();
      }
    }, 1000);
  }
});
