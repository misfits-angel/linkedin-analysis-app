// ============= CSV ANALYSIS =============
// Parse date from postTimestamp column only (no fallback to ensure data quality)
function parseCSVDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle relative dates (e.g., "1w", "2w", "1mo", "3d")
  const relativeMatch = dateStr.match(/^(\d+)(w|d|mo|h|m|y)$/);
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2];
    const now = new Date();
    
    switch(unit) {
      case 'h': // hours
        return new Date(now.getTime() - value * 60 * 60 * 1000);
      case 'd': // days
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      case 'w': // weeks
        return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
      case 'mo': // months (approximate)
        return new Date(now.getFullYear(), now.getMonth() - value, now.getDate());
      case 'm': // minutes
        return new Date(now.getTime() - value * 60 * 1000);
      case 'y': // years
        return new Date(now.getFullYear() - value, now.getMonth(), now.getDate());
    }
  }
  
  // Try ISO format
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Try other formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
  ];
  
  for (const regex of formats) {
    const match = dateStr.match(regex);
    if (match) {
      date = new Date(match[0]);
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  return null;
}

function getMonthKey(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getDayOfWeek(date) {
  if (!date) return null;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function median(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return Math.round(sum / arr.length);
}

function detectPostType(row) {
  if (row.type && row.type.trim() !== '') {
    const typeValue = row.type.toLowerCase().trim();
    const match = typeValue.match(/^([a-z]+)/);
    if (match) return match[1];
  }
  
  if (row.videoUrl) return 'video';
  if (row.imgUrl) return 'image';
  return 'text';
}


function analyzeCsvData(rows) {
  const validRows = rows.filter(row => 
    row.postContent && 
    row.postContent.trim() !== '' &&
    !row.postContent.includes('Export limit reached')
  );

  if (validRows.length === 0) {
    showError('No valid posts found in CSV. Please check the file format.');
    return null;
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const rowsWithoutTimestamp = validRows.filter(row => !row.postTimestamp || row.postTimestamp.trim() === '');
  if (rowsWithoutTimestamp.length > 0) {
    showError(`Warning: ${rowsWithoutTimestamp.length} posts are missing dates (postTimestamp column) and were excluded from analysis.`);
  }

  // First, process all posts to get the full date range
  const allPosts = validRows.map(row => {
    const date = parseCSVDate(row.postTimestamp);
    const likes = parseInt(row.likeCount || 0);
    const comments = parseInt(row.commentCount || 0);
    const reposts = parseInt(row.repostCount || 0);
    const views = parseInt(row.viewCount || 0);
    const engagement = likes + comments + reposts;
    
    return {
      content: row.postContent,
      date: date,
      month: getMonthKey(date),
      dayOfWeek: getDayOfWeek(date),
      type: detectPostType(row),
      action: row.action || 'Post',
      likes: likes,
      comments: comments,
      reposts: reposts,
      views: views,
      eng: engagement,
      topics: [], // Topics will be analyzed by LLM only
      url: row.postUrl,
      author: row.author || 'Unknown'
    };
  }).filter(p => p.date); // Only filter out posts without dates, not by time

  // Get the full date range for audit period
  const validPosts = allPosts.filter(p => p.date);
  let fullDateRange = null;
  if (validPosts.length > 0) {
    validPosts.sort((a, b) => a.date - b.date);
    fullDateRange = {
      firstDate: validPosts[0].date,
      lastDate: validPosts[validPosts.length - 1].date
    };
  }

  // Now filter to last 12 months for analysis
  const posts = allPosts.filter(p => p.date && p.date >= twelveMonthsAgo);
  
  if (posts.length === 0) {
    showError('No posts found within the last 12 months. Your CSV might contain older data or have date format issues.');
    return null;
  }

  posts.sort((a, b) => a.date - b.date);

  const authorCounts = {};
  posts.forEach(p => {
    const author = p.author || 'Unknown';
    authorCounts[author] = (authorCounts[author] || 0) + 1;
  });
  
  let authorName = 'LinkedIn User';
  let maxCount = 0;
  Object.entries(authorCounts).forEach(([author, count]) => {
    if (count > maxCount && author !== 'Unknown') {
      authorName = author;
      maxCount = count;
    }
  });

  const engagements = posts.map(p => p.eng);
  const postsExcludingReshares = posts.filter(p => {
    const action = (p.action || '').toLowerCase();
    return !action.includes('repost');
  });
  
  const summary = {
    posts_last_12m: postsExcludingReshares.length,
    active_months: new Set(posts.map(p => p.month)).size,
    median_engagement: median(engagements),
    p90_engagement: percentile(engagements, 90)
  };

  // Trends: posts per month
  const monthCounts = {};
  posts.forEach(p => {
    monthCounts[p.month] = (monthCounts[p.month] || 0) + 1;
  });
  const posts_per_month = Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Trends: median and total engagement by month
  const monthEngagements = {};
  posts.forEach(p => {
    if (!monthEngagements[p.month]) monthEngagements[p.month] = [];
    monthEngagements[p.month].push(p.eng);
  });
  const month_median = Object.entries(monthEngagements)
    .map(([month, engs]) => ({ 
      month, 
      median: median(engs),
      total: engs.reduce((sum, eng) => sum + eng, 0),
      average: Math.round(engs.reduce((sum, eng) => sum + eng, 0) / engs.length)
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Mix: type distribution
  const typeCounts = {};
  const typeEngagements = {};
  posts.forEach(p => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    if (!typeEngagements[p.type]) typeEngagements[p.type] = [];
    typeEngagements[p.type].push(p.eng);
  });
  
  const type_share = {};
  const type_median_engagement = {};
  const type_mean_engagement = {};
  const type_q1_engagement = {};
  const type_q3_engagement = {};
  const type_max_engagement = {};
  Object.keys(typeCounts).forEach(type => {
    type_share[type] = typeCounts[type] / posts.length;
    type_median_engagement[type] = median(typeEngagements[type]);
    type_mean_engagement[type] = mean(typeEngagements[type]);
    type_q1_engagement[type] = percentile(typeEngagements[type], 25);
    type_q3_engagement[type] = percentile(typeEngagements[type], 75);
    type_max_engagement[type] = Math.max(...typeEngagements[type]);
  });

  // Mix: action distribution (Post vs Reshare)
  const actionCounts = {};
  const actionEngagements = {};
  posts.forEach(p => {
    actionCounts[p.action] = (actionCounts[p.action] || 0) + 1;
    if (!actionEngagements[p.action]) actionEngagements[p.action] = [];
    actionEngagements[p.action].push(p.eng);
  });
  
  const action_share = {};
  const action_median_engagement = {};
  Object.keys(actionCounts).forEach(action => {
    action_share[action] = actionCounts[action] / posts.length;
    action_median_engagement[action] = median(actionEngagements[action]);
  });

  // Topics - No manual analysis, LLM only
  const tag_share = {};
  const tag_median_engagement = {};
  const tag_counts = {};

  // Posting Rhythm & Continuity
  const sortedPosts = [...posts].sort((a, b) => a.date - b.date);
  const postGaps = [];
  let longestGapInfo = { days: 0, startDate: null, endDate: null };
  
  for (let i = 1; i < sortedPosts.length; i++) {
    const gapDays = Math.floor((sortedPosts[i].date - sortedPosts[i-1].date) / (1000 * 60 * 60 * 24));
    postGaps.push(gapDays);
    
    // Track the longest gap with dates
    if (gapDays > longestGapInfo.days) {
      longestGapInfo = {
        days: gapDays,
        startDate: sortedPosts[i-1].date,
        endDate: sortedPosts[i].date
      };
    }
  }
  
  const avgPostingGap = postGaps.length > 0 ? Math.round(postGaps.reduce((a, b) => a + b, 0) / postGaps.length) : 0;
  const longestGap = postGaps.length > 0 ? Math.max(...postGaps) : 0;
  const postsPerMonthAvg = summary.posts_last_12m / 12;
  
  // Find peak posting month
  const peakMonth = posts_per_month.reduce((max, curr) => curr.count > max.count ? curr : max, posts_per_month[0]);
  
  const rhythm = {
    posts_per_month_avg: Math.round(postsPerMonthAvg * 10) / 10,
    longest_gap_days: longestGap,
    longest_gap_start: longestGapInfo.startDate,
    longest_gap_end: longestGapInfo.endDate,
    avg_gap_days: avgPostingGap,
    peak_month: peakMonth?.month || 'N/A',
    peak_month_count: peakMonth?.count || 0
  };

  // Timing Insights: Day of Week Analysis
  const dayOfWeekCounts = {};
  const dayOfWeekEngagements = {};
  
  posts.forEach(p => {
    if (p.dayOfWeek) {
      dayOfWeekCounts[p.dayOfWeek] = (dayOfWeekCounts[p.dayOfWeek] || 0) + 1;
      if (!dayOfWeekEngagements[p.dayOfWeek]) dayOfWeekEngagements[p.dayOfWeek] = [];
      dayOfWeekEngagements[p.dayOfWeek].push(p.eng);
    }
  });
  
  const dayOfWeekStats = {};
  Object.keys(dayOfWeekCounts).forEach(day => {
    dayOfWeekStats[day] = {
      count: dayOfWeekCounts[day],
      median: median(dayOfWeekEngagements[day]),
      mean: mean(dayOfWeekEngagements[day])
    };
  });
  
  // Find best day (highest median engagement with at least 3 posts)
  let bestDay = null;
  let bestDayMedian = 0;
  Object.entries(dayOfWeekStats).forEach(([day, stats]) => {
    if (stats.count >= 3 && stats.median > bestDayMedian) {
      bestDay = day;
      bestDayMedian = stats.median;
    }
  });
  
  const timingInsights = {
    day_of_week: dayOfWeekStats,
    best_day: bestDay
  };

  // Prepare posts array for top posts
  const postsForJson = posts.map(p => ({
    content: p.content,
    month: p.month,
    type: p.type,
    likes: p.likes,
    comments: p.comments,
    reposts: p.reposts,
    views: p.views,
    eng: p.eng,
    url: p.url
  }));

  return {
    profile: { name: authorName },
    summary: summary,
    fullDateRange: fullDateRange, // Add full date range for audit period
    trends: {
      posts_per_month: posts_per_month,
      month_median: month_median
    },
    mix: {
      type_share: type_share,
      type_median_engagement: type_median_engagement,
      type_mean_engagement: type_mean_engagement,
      type_q1_engagement: type_q1_engagement,
      type_q3_engagement: type_q3_engagement,
      type_max_engagement: type_max_engagement,
      type_counts: typeCounts,
      action_share: action_share,
      action_median_engagement: action_median_engagement,
      action_counts: actionCounts
    },
    topics: {
      tag_share: tag_share,
      tag_median_engagement: tag_median_engagement,
      tag_counts: tag_counts
    },
    rhythm: rhythm,
    timingInsights: timingInsights,
    posts: postsForJson
  };
}

// ============= FILE UPLOAD HANDLERS =============
function initializeFileUploadHandlers() {

  // Peer CSV Upload Handler
  const peerFileInput = document.getElementById('fileInputPeer');
  if (peerFileInput) {
    peerFileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0]; 
      if (!f) return;
      
      const errorContainer = document.getElementById('errorContainer');
      errorContainer.innerHTML = '<div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">📊 Processing peer CSV file...</div>';
      
      const r = new FileReader(); 
      r.onload = () => { 
        try { 
          // Parse CSV
          Papa.parse(r.result, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
              // Clear loading message
              errorContainer.innerHTML = '';
              
              if (!results.data || results.data.length === 0) {
                showError('No data found in peer CSV file.');
                return;
              }
              
              // Analyze and convert to JSON format
              const peerJson = analyzeCsvData(results.data);
              
              if (!peerJson) {
                return; // Error already shown in analyzeCsvData
              }
          
              // Store peer data globally
              window.__PEER_DATA__ = peerJson;
              
              // Re-render comparison if we have main data
              const currentData = window.__CURRENT__;
              if (currentData) {
                renderPeerComparison(currentData);
              }
              
              // Show success message
              errorContainer.innerHTML = `<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">✅ Successfully loaded peer data for ${peerJson.profile?.name || 'peer user'}!</div>`;
              setTimeout(() => { errorContainer.innerHTML = ''; }, 3000);
              
            },
            error: function(error) {
              errorContainer.innerHTML = '';
              console.error('Peer CSV parse error:', error);
              showError('Failed to parse peer CSV file: ' + error.message);
            }
          });
        } catch(err) { 
          errorContainer.innerHTML = '';
          console.error('Peer CSV processing error:', err);
          showError('Invalid peer CSV file. Please check the file format.');
        } 
      }; 
      r.readAsText(f);
    });
  }

  // CSV Upload Handler
  const csvFileInput = document.getElementById('fileInputCsv');
  if (csvFileInput) {
    csvFileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0]; 
      if (!f) return;
      
      // Close menu
      const menuDropdown = document.getElementById('menuDropdown');
      if (menuDropdown) {
        menuDropdown.classList.remove('active');
      }
      
      // Show loading state
      const errorContainer = document.getElementById('errorContainer');
      errorContainer.innerHTML = '<div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">📊 Processing CSV file and analyzing your LinkedIn posts...</div>';
      
      const r = new FileReader(); 
      r.onload = () => { 
        try { 
          // Parse CSV
          Papa.parse(r.result, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
              // Clear loading message
              errorContainer.innerHTML = '';
              
              if (!results.data || results.data.length === 0) {
                showError('No data found in CSV file.');
                return;
              }
              
              // Store raw CSV data for LLM insights
              storePostsData(results.data);
              
              // Analyze and convert to JSON format
              const json = analyzeCsvData(results.data);
              
              if (!json) {
                return; // Error already shown in analyzeCsvData
              }
          
              // Render and save
              renderAll(json);
              saveData(json);
              
              // Show success message
              errorContainer.innerHTML = '<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">✅ Successfully analyzed ' + json.summary.posts_last_12m + ' posts from your CSV!</div>';
              setTimeout(() => { errorContainer.innerHTML = ''; }, 3000);
              
            },
            error: function(error) {
              errorContainer.innerHTML = '';
              console.error('CSV parse error:', error);
              showError('Failed to parse CSV file: ' + error.message);
            }
          });
        } catch(err) { 
          errorContainer.innerHTML = '';
          console.error('CSV processing error:', err);
          showError('Invalid CSV file. Please check the file format.');
        } 
      }; 
      r.readAsText(f);
    });
  }
}
