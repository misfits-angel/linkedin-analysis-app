// ============= CONFIGURATION =============
const CONFIG = {
  clipLength: { default: 120, post: 160, deepDive: 180 },
  topPostsCount: 3,
  topTopicsCount: 3,
  chartHeight: 200,
  colors: {
    primary: '#157187',
    secondary: '#63a5b3',
    tertiary: '#b1d9df',
    background: 'rgba(99, 165, 179, 0.1)'
  },
  storageKeys: {
    data: 'linkedin_wrap_data',
    timestamp: 'linkedin_wrap_timestamp'
  }
};

// ============= UTILITY FUNCTIONS =============
// Generate last 12 months in YYYY-MM format (for complete chart display)
function generateLast12Months() {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  
  return months;
}

function labelMonth(m){
  if(!m) return '';
  if(/^\d{4}-\d{2}$/.test(m)){
    const [y,mm]=m.split('-');
    const d=new Date(Number(y), Number(mm)-1, 1);
    return d.toLocaleString('en-US',{month:'short'})+" '"+String(y).slice(-2);
  }
  if(/^\d{2}$/.test(m)){
    const d=new Date(2000, Number(m)-1, 1);
    return d.toLocaleString('en-US',{month:'short'});
  }
  return m;
}

function toDonut(shareObj={}){ 
  return Object.entries(shareObj).map(([name,frac])=>({name, value: Math.round((frac||0)*100)})); 
}

function ensureArray(a){ 
  return Array.isArray(a)?a:[]; 
}

function clip(s, n=CONFIG.clipLength.default){ 
  if(!s) return ''; 
  s=String(s); 
  return s.length>n? s.slice(0,n-1)+'…' : s; 
}

function showError(message) {
  const container = document.getElementById('errorContainer');
  container.innerHTML = `<div class="error-message">${message}</div>`;
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '<div class="loading-skeleton" style="height:3rem;border-radius:0.5rem;"></div>';
  }
}

// ============= DATA VALIDATION =============
function validateData(json) {
  const errors = [];
  
  if (!json || typeof json !== 'object') {
    errors.push('Invalid JSON structure');
    return { valid: false, errors };
  }

  // Check summary
  if (!json.summary) {
    errors.push('Missing "summary" section');
  } else {
    const required = ['posts_last_12m', 'active_months', 'median_engagement', 'p90_engagement'];
    required.forEach(field => {
      if (json.summary[field] === undefined) {
        errors.push(`Missing summary.${field}`);
      }
    });
  }

  // Check trends
  if (!json.trends?.posts_per_month) {
    errors.push('Missing "trends.posts_per_month" data');
  }
  if (!json.trends?.month_median) {
    errors.push('Missing "trends.month_median" data');
  }

  // Check mix
  if (!json.mix?.type_share) {
    errors.push('Missing "mix.type_share" data');
  }

  // Topics and heatmap are optional but should be objects if present
  if (json.topics && typeof json.topics !== 'object') {
    errors.push('"topics" should be an object');
  }
  if (json.heatmap && typeof json.heatmap !== 'object') {
    errors.push('"heatmap" should be an object');
  }

  return { valid: errors.length === 0, errors };
}

// ============= DATA PERSISTENCE =============
function saveData(data) {
  try {
    localStorage.setItem(CONFIG.storageKeys.data, JSON.stringify(data));
    localStorage.setItem(CONFIG.storageKeys.timestamp, Date.now().toString());
    document.getElementById('clearData').style.display = 'flex';
  } catch (e) {
    // Silent fail for localStorage
  }
}

function loadSavedData() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKeys.data);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Silent fail for localStorage
  }
  return null;
}

async function clearSavedData() {
  localStorage.removeItem(CONFIG.storageKeys.data);
  localStorage.removeItem(CONFIG.storageKeys.timestamp);
  const clearDataBtn = document.getElementById('clearData');
  if (clearDataBtn) {
    clearDataBtn.style.display = 'none';
  }
  // Reload the page to show empty state
  location.reload();
}
