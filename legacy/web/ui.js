// ============= UI INTERACTION FUNCTIONS =============
// Function to toggle cost per hour section
function toggleCostPerHourSection() {
  const section = document.getElementById('costPerHourSection');
  
  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
  } else {
    section.classList.add('hidden');
  }
}


// Function to update time value calculations when hourly rate changes
function updateTimeValueCalculations() {
  if (window.__CURRENT__) {
    renderUnstoppableValueProp(window.__CURRENT__);
  }
}

function renderUnstoppableValueProp(d) {
  const currentMetrics = document.getElementById('currentMetrics');
  const futureMetrics = document.getElementById('futureMetrics');
  
  if (!currentMetrics || !futureMetrics) {
    console.log('renderUnstoppableValueProp: Required elements not found');
    return; // Section not loaded yet
  }
  
  console.log('renderUnstoppableValueProp: Data received:', d);
  
  // Get current data
  const currentPosts = d?.summary?.posts_last_12m || 0;
  const currentMedianEngagement = d?.summary?.median_engagement || 0;
  const currentP90Engagement = d?.summary?.p90_engagement || 0;
  const currentActiveMonths = d?.summary?.active_months || 0;
  
  // Calculate time investment (assuming 40-45 minutes per post)
  const avgTimePerPost = 45; // minutes per post
  const currentTimeInvestmentHours = Math.round((currentPosts * avgTimePerPost) / 60); // hours per year
  const currentTimePerWeek = Math.round((currentTimeInvestmentHours / 52) * 7); // hours per week
  
  // Calculate future projections with Unstoppable
  const futurePostsPerYear = 250; // ~250 posts per year
  const futureTimePerWeek = 15; // 15 minutes per week
  const futureTimeInvestmentHours = Math.round((futureTimePerWeek * 52) / 60); // hours per year (15 min/week × 52 weeks ÷ 60)
  
  // Engagement improvements (6x based on better content strategy)
  const engagementMultiplier = 6;
  const futureMedianEngagement = Math.round(currentMedianEngagement * engagementMultiplier);
  const futureP90Engagement = Math.round(currentP90Engagement * engagementMultiplier);
  
  // Calculate posts increase
  const postsIncrease = futurePostsPerYear - currentPosts;
  
  // Get hourly rate from input or default to 40
  const hourlyRateInput = document.getElementById('hourlyRate');
  const hourlyRate = hourlyRateInput ? parseFloat(hourlyRateInput.value) || 40 : 40;
  const timeValueOfMoney = currentTimeInvestmentHours * hourlyRate;
  
  // Calculate cost per post (current state - no service fee)
  const costPerPost = currentPosts > 0 ? Math.round((timeValueOfMoney / currentPosts) * 100) / 100 : 0;
  
  // Render current metrics
  currentMetrics.innerHTML = `
    <div class="space-y-2" style="display: block; width: 100%; margin: 0; padding: 0;">
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Posts per year:</span>
        <span class="font-semibold text-gray-800" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">${currentPosts}</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Time investment:</span>
        <span class="font-semibold text-gray-800" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">~${avgTimePerPost} mins/post</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Time per year:</span>
        <span class="font-semibold text-gray-800" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">${currentTimeInvestmentHours} hours</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Time value of money:</span>
        <span class="font-semibold text-gray-800" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">$${timeValueOfMoney.toLocaleString()}</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Cost per post:</span>
        <span class="font-semibold text-orange-600" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">$${costPerPost}</span>
      </div>
    </div>
  `;
  
  // Calculate future time value of money
  const futureTimeValueOfMoney = futureTimeInvestmentHours * hourlyRate;
  
  // Calculate future cost per post (including Unstoppable service fee)
  const serviceFeeInput = document.getElementById('serviceFee');
  const monthlyServiceFee = serviceFeeInput ? parseFloat(serviceFeeInput.value) || 500 : 500;
  const annualServiceFee = monthlyServiceFee * 12;
  const totalFutureCost = futureTimeValueOfMoney + annualServiceFee;
  const futureCostPerPost = futurePostsPerYear > 0 ? Math.round((totalFutureCost / futurePostsPerYear) * 100) / 100 : 0;
  
  // Render future metrics
  futureMetrics.innerHTML = `
    <div class="space-y-2" style="display: block; width: 100%; margin: 0; padding: 0;">
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Posts per year:</span>
        <span class="font-semibold text-green-600" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">~${futurePostsPerYear}</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Time per week:</span>
        <span class="font-semibold text-green-600" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">${futureTimePerWeek} mins</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Time per year:</span>
        <span class="font-semibold text-green-600" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">${futureTimeInvestmentHours} hours</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Service fee (annual):</span>
        <span class="font-semibold text-green-600" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">$${annualServiceFee.toLocaleString()}</span>
      </div>
      <div class="flex items-center justify-between" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding: 0.25rem 0; width: 100%; box-sizing: border-box;">
        <span class="text-sm text-gray-600" style="flex: 1; text-align: left; margin-right: 0.5rem;">Cost per post:</span>
        <span class="font-semibold text-green-600" style="flex: 0 0 auto; text-align: right; font-weight: 600; min-width: fit-content;">$${futureCostPerPost}</span>
      </div>
    </div>
  `;
  
}

// ============= POST CONTENT TOGGLE =============
function togglePostContent(postId, toggleElement) {
  const contentDiv = document.getElementById(postId);
  if (!contentDiv) return;
  
  if (contentDiv.classList.contains('expanded')) {
    contentDiv.classList.remove('expanded');
    toggleElement.textContent = '📖 Read full post';
  } else {
    contentDiv.classList.add('expanded');
    toggleElement.textContent = '📕 Show less';
  }
}

// ============= MENU TOGGLE =============
function initializeMenuToggle() {
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  
  if (!menuBtn || !menuDropdown) return;
  
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
      menuDropdown.classList.remove('active');
    }
  });
  
}

// ============= PDF BUTTON LAYOUT OPTIMIZATION =============
function ensureButtonLayoutForPdf() {
  // Find all button containers that need to be horizontal for PDF
  const buttonContainers = document.querySelectorAll('.pdf-button-container, .flex.flex-col.sm\\:flex-row');
  
  buttonContainers.forEach(container => {
    // Force horizontal layout
    container.style.flexDirection = 'row';
    container.style.gap = '0.75rem';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.display = 'flex';
    
    // Ensure buttons maintain proper sizing
    const buttons = container.querySelectorAll('a, button');
    buttons.forEach(button => {
      button.style.flex = '0 0 auto';
      button.style.minWidth = '140px';
      button.style.maxWidth = '180px';
      button.style.textAlign = 'center';
      button.style.whiteSpace = 'nowrap';
      button.style.display = 'inline-block';
    });
  });
  
  // Specifically target the CTA section
  const ctaSection = document.querySelector('.pdf-cta-section');
  if (ctaSection) {
    const ctaButtons = ctaSection.querySelector('.pdf-button-container');
    if (ctaButtons) {
      ctaButtons.style.flexDirection = 'row';
      ctaButtons.style.gap = '0.75rem';
      ctaButtons.style.justifyContent = 'center';
      ctaButtons.style.alignItems = 'center';
      ctaButtons.style.display = 'flex';
      
      const ctaButtonElements = ctaButtons.querySelectorAll('a, button');
      ctaButtonElements.forEach(button => {
        button.style.flex = '0 0 auto';
        button.style.minWidth = '140px';
        button.style.maxWidth = '180px';
        button.style.textAlign = 'center';
        button.style.whiteSpace = 'nowrap';
        button.style.display = 'inline-block';
      });
    }
  }
  
  console.log('Button layout optimized for PDF generation');
}

// ============= PDF PAGE BREAK OPTIMIZATION =============
function optimizePageBreaksForPdf() {
  // Add page break classes to long content sections
  const narrativeSection = document.getElementById('narrativeInsightsSection');
  const postEvaluationSection = document.getElementById('postEvaluationSection');
  
  // Check if sections have substantial content and add page break classes
  if (narrativeSection) {
    const narrativeContent = narrativeSection.querySelector('.narrative-content');
    if (narrativeContent && narrativeContent.textContent.length > 500) {
      narrativeContent.classList.add('page-break-inside-avoid');
    }
  }
  
  if (postEvaluationSection) {
    const evaluationContent = postEvaluationSection.querySelector('.post-evaluation-content');
    if (evaluationContent && evaluationContent.textContent.length > 500) {
      evaluationContent.classList.add('page-break-inside-avoid');
    }
  }
  
  // Add page break classes to long lists
  const longLists = document.querySelectorAll('ul, ol');
  longLists.forEach(list => {
    if (list.children.length > 8) {
      list.classList.add('page-break-inside-avoid');
    }
  });
  
  // Ensure charts don't break across pages
  const charts = document.querySelectorAll('.chart-wrap');
  charts.forEach(chart => {
    chart.classList.add('page-break-inside-avoid');
  });
  
  // Add intelligent page breaks for very long sections
  addIntelligentPageBreaks();
  
  // Special handling for value proposition section
  optimizeValuePropositionSection();
  
  // Optimize page breaks to prevent blank pages
  optimizePageBreaksForContent();
}

// ============= PREVENT BLANK PAGES =============
function optimizePageBreaksForContent() {
  // Find all sections with page-break-before
  const sectionsWithBreaks = document.querySelectorAll('.page-break-before');
  
  sectionsWithBreaks.forEach(section => {
    // Check if section has substantial content
    const hasSubstantialContent = checkSectionContent(section);
    
    if (!hasSubstantialContent) {
      // Remove page break for sections without substantial content
      section.classList.add('no-content');
      console.log('Removed page break for section with minimal content:', section.id || section.className);
    }
  });
}

function checkSectionContent(section) {
  // Get all text content from the section
  const textContent = section.textContent || '';
  const trimmedContent = textContent.trim();
  
  // Check for minimum content length (excluding placeholder text)
  const placeholderTexts = [
    'Click "Generate Insights" to get AI-powered observations',
    'Get AI-powered evaluation of your LinkedIn posts',
    'Detailed strengths and areas for improvement will appear here',
    'Get AI-powered analysis of your current personal branding',
    'Upload a similar LinkedIn CSV file to compare your performance',
    'Loading your data...',
    'Calculating potential...',
    'No post-level data available',
    'No topic analysis available',
    'No post type data available',
    'Rhythm data not available',
    'Timing data not available'
  ];
  
  // Remove placeholder text from content
  let cleanContent = trimmedContent;
  placeholderTexts.forEach(placeholder => {
    cleanContent = cleanContent.replace(placeholder, '');
  });
  
  // Check if there's substantial content left
  const hasSubstantialContent = cleanContent.length > 100;
  
  // Also check for charts or other visual elements
  const hasCharts = section.querySelectorAll('canvas').length > 0;
  const hasLists = section.querySelectorAll('ul, ol').length > 0;
  const hasCards = section.querySelectorAll('.card').length > 0;
  
  return hasSubstantialContent || hasCharts || hasLists || hasCards;
}

function addIntelligentPageBreaks() {
  // Estimate page height (approximately 10 inches for letter size with margins)
  const estimatedPageHeight = 10 * 96; // 96 pixels per inch
  
  // Find sections that might be too tall for a single page
  const sections = document.querySelectorAll('.card');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.height > estimatedPageHeight * 0.8) { // 80% of page height
      // Look for good break points within the section
      const children = Array.from(section.children);
      let currentHeight = 0;
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childHeight = child.getBoundingClientRect().height;
        
        if (currentHeight + childHeight > estimatedPageHeight * 0.6) { // 60% threshold
          // Add a page break before this child
          child.classList.add('page-break-before');
          currentHeight = childHeight;
        } else {
          currentHeight += childHeight;
        }
      }
    }
  });
}

function optimizeValuePropositionSection() {
  const valuePropSection = document.getElementById('unstoppableValueProp');
  if (!valuePropSection) return;
  
  // Ensure the entire section stays together
  valuePropSection.classList.add('page-break-inside-avoid');
  
  // Protect the title and subtitle from breaking
  const titleElement = valuePropSection.querySelector('.text-2xl');
  const subtitleElement = valuePropSection.querySelector('.text-sm');
  
  if (titleElement) {
    titleElement.style.pageBreakInside = 'avoid';
    titleElement.style.breakInside = 'avoid';
  }
  
  if (subtitleElement) {
    subtitleElement.style.pageBreakInside = 'avoid';
    subtitleElement.style.breakInside = 'avoid';
  }
  
  // Ensure the comparison grid stays together
  const comparisonGrid = valuePropSection.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
  if (comparisonGrid) {
    comparisonGrid.classList.add('page-break-inside-avoid');
  }
}


// ============= PDF SECTION CONTROLS =============
let pdfSectionSettings = {
  'key-metrics': true,
  'charts': true,
  'format-mix': true,
  'engagement-analysis': true,
  'narrative-insights': true,
  'post-evaluation': true,
  'post-evaluation-strengths': true,
  'positioning-timing': true,
  'rhythm-posts': true,
  'peer-comparison': true,
  'value-proposition': true
};

function initializePdfSectionControls() {
  const pdfSectionToggle = document.getElementById('pdfSectionToggle');
  const pdfSectionControls = document.getElementById('pdfSectionControls');
  const closePdfControls = document.getElementById('closePdfControls');
  
  if (!pdfSectionToggle || !pdfSectionControls) return;
  
  // Toggle controls panel
  pdfSectionToggle.addEventListener('click', () => {
    const menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown) {
      menuDropdown.classList.remove('active');
    }
    
    if (pdfSectionControls.style.display === 'none') {
      pdfSectionControls.style.display = 'block';
      generateSectionToggles();
    } else {
      pdfSectionControls.style.display = 'none';
    }
  });
  
  // Close controls panel
  closePdfControls.addEventListener('click', () => {
    pdfSectionControls.style.display = 'none';
  });
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!pdfSectionControls.contains(e.target) && !pdfSectionToggle.contains(e.target)) {
      pdfSectionControls.style.display = 'none';
    }
  });
}

function generateSectionToggles() {
  const container = document.querySelector('#pdfSectionControls .grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  const sectionConfigs = [
    { key: 'key-metrics', label: 'Key Metrics', description: 'Posts, engagement stats' },
    { key: 'charts', label: 'Charts', description: 'Posting cadence & engagement trends' },
    { key: 'format-mix', label: 'Format Mix', description: 'Content format distribution' },
    { key: 'engagement-analysis', label: 'Engagement Analysis', description: 'Post types & topic insights' },
    { key: 'narrative-insights', label: 'Narrative Insights', description: 'AI-generated insights' },
    { key: 'post-evaluation', label: 'Post Evaluation', description: 'Quality assessment' },
    { key: 'post-evaluation-strengths', label: 'Post Strengths', description: 'Strengths & improvements' },
    { key: 'positioning-timing', label: 'Positioning & Timing', description: 'Brand analysis & timing' },
    { key: 'rhythm-posts', label: 'Rhythm & Top Posts', description: 'Posting patterns & top content' },
    { key: 'peer-comparison', label: 'Peer Comparison', description: 'Compare with others' },
    { key: 'value-proposition', label: 'Value Proposition', description: 'Unstoppable content benefits' }
  ];
  
  sectionConfigs.forEach(config => {
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'flex-1';
    labelDiv.innerHTML = `
      <div class="font-medium text-gray-800">${config.label}</div>
      <div class="text-xs text-gray-500">${config.description}</div>
    `;
    
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'flex items-center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `pdf-section-${config.key}`;
    checkbox.className = 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2';
    checkbox.checked = pdfSectionSettings[config.key];
    
    checkbox.addEventListener('change', (e) => {
      pdfSectionSettings[config.key] = e.target.checked;
      updateSectionVisibility();
    });
    
    checkboxDiv.appendChild(checkbox);
    toggleDiv.appendChild(labelDiv);
    toggleDiv.appendChild(checkboxDiv);
    container.appendChild(toggleDiv);
  });
}

function updateSectionVisibility() {
  const sections = document.querySelectorAll('[data-pdf-section]');
  
  sections.forEach(section => {
    const sectionKey = section.getAttribute('data-pdf-section');
    const isIncluded = pdfSectionSettings[sectionKey];
    
    if (isIncluded) {
      section.style.display = '';
      section.classList.remove('pdf-section-excluded');
    } else {
      section.style.display = 'none';
      section.classList.add('pdf-section-excluded');
    }
  });
}

function restoreAllSections() {
  const sections = document.querySelectorAll('[data-pdf-section]');
  
  sections.forEach(section => {
    section.style.display = '';
    section.classList.remove('pdf-section-excluded');
  });
}

// ============= PDF DOWNLOAD =============
function initializePdfDownload() {
  const downloadPdfBtn = document.getElementById('downloadPdf');
  if (!downloadPdfBtn) return;
  
  downloadPdfBtn.addEventListener('click', async () => {
    const menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown) {
      menuDropdown.classList.remove('active');
    }
    
    // Check if html2pdf is loaded
    if (typeof html2pdf === 'undefined') {
      alert('PDF library not loaded. Please check your internet connection.');
      return;
    }
    
    // Show loading notification in separate overlay (won't be in PDF because of @media print)
    const notification = document.getElementById('pdfNotification');
    notification.innerHTML = '<div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm shadow-lg">📄 Generating PDF... This may take a few moments.</div>';
    
    // Wait for menu to close and UI to settle
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Apply section visibility settings before PDF generation
    updateSectionVisibility();
    
    // Optimize page breaks before PDF generation
    optimizePageBreaksForPdf();
    
    // Ensure button layout is correct for PDF generation
    ensureButtonLayoutForPdf();
    
    try {
      // Get the element
      const element = document.querySelector('.max-w-7xl');
      
      if (!element) {
        throw new Error('Content container not found');
      }
      
      // Get person's name for filename
      const personName = window.__CURRENT__?.profile?.name || 'LinkedIn User';
      const sanitizedName = personName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      
      // Enhanced PDF configuration with better page break handling
      const opt = {
        margin: [0.5, 0.3, 0.3, 0.3], // Increased top margin for better spacing
        filename: `${sanitizedName}_LinkedIn_Audit.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false, // Reduced logging for cleaner output
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['.chart-wrap', '.section-title']
        }
      };
      
      console.log('Starting PDF generation...');
      console.log('Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);
      console.log('Element content:', element.innerHTML.length, 'characters');
      console.log('Number of charts:', document.querySelectorAll('canvas').length);
      
      // Scroll to top to ensure everything is visible
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await html2pdf().set(opt).from(element).save();
      
      console.log('PDF generation completed');
      
      // Restore all sections after PDF generation
      restoreAllSections();
      
      // Show success message
      notification.innerHTML = '<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm shadow-lg">✅ PDF downloaded successfully!</div>';
      setTimeout(() => { 
        notification.innerHTML = ''; 
      }, 3000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      console.error('Error details:', error.stack);
      
      // Restore all sections on error
      restoreAllSections();
      
      // Show error message
      notification.innerHTML = '<div class="error-message shadow-lg">Failed to generate PDF. Please check console for details.</div>';
      setTimeout(() => { 
        notification.innerHTML = ''; 
      }, 5000);
    }
  });
}

// ============= PRINT PAGE (FALLBACK) =============
function initializePrintPage() {
  const printPageBtn = document.getElementById('printPage');
  if (!printPageBtn) return;
  
  printPageBtn.addEventListener('click', () => {
    const menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown) {
      menuDropdown.classList.remove('active');
    }
    
    // Use browser's native print dialog
    window.print();
  });
}

// ============= CLEAR DATA =============
function initializeClearData() {
  const clearDataBtn = document.getElementById('clearData');
  if (!clearDataBtn) return;
  
  clearDataBtn.addEventListener('click', async () => {
    const menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown) {
      menuDropdown.classList.remove('active');
    }
    
    if (confirm('Clear saved data? You will need to upload your data again.')) {
      await clearSavedData();
    }
  });
}
