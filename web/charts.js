// ============= CHART MANAGEMENT =============
const CHARTS={};

function drawOrUpdateChart(id, config){
  const ctx = document.getElementById(id);
  if (!ctx || !window.Chart) {
    console.warn(`Chart ${id}: Canvas or Chart.js not available`);
    return;
  }
  
  try {
    if (CHARTS[id]) { 
      CHARTS[id].destroy(); 
      delete CHARTS[id]; 
    }
    
    console.log(`Rendering chart ${id} with ${config.data.labels.length} labels and ${config.data.datasets[0].data.length} data points`);
    CHARTS[id] = new Chart(ctx, config);
    console.log(`Chart ${id} rendered successfully`);
  } catch (error) {
    console.error(`Chart ${id} failed to render:`, error);
    const wrap = ctx.closest('.chart-wrap');
    if (wrap) {
      wrap.innerHTML = '<p class="text-red-500 text-sm text-center py-8">Chart failed to render</p>';
    }
  }
}

function exportChart(chartId) {
  const chart = CHARTS[chartId];
  if (!chart) {
    alert('Chart not found');
    return;
  }
  
  try {
    // Get the canvas element
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      alert('Chart canvas not found');
      return;
    }
    
    // Find the parent card and get the title
    const card = canvas.closest('.card');
    if (!card) {
      // Fallback to original method if card not found
      const link = document.createElement('a');
      link.download = `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = chart.toBase64Image();
      link.click();
      return;
    }
    
    // Get the section title
    const titleElement = card.querySelector('.section-title');
    const title = titleElement ? titleElement.textContent : 'Chart';
    
    // Create a temporary canvas with extra space for title
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Set dimensions (add space for title)
    const titleHeight = 50;
    const padding = 20;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + titleHeight;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, tempCanvas.width / 2, 35);
    
    // Draw the chart
    ctx.drawImage(canvas, 0, titleHeight);
    
    // Download
    const link = document.createElement('a');
    const filename = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
  } catch (error) {
    console.error('Failed to export chart:', error);
    alert('Failed to export chart: ' + error.message);
  }
}

// ============= CHART RENDERING FUNCTIONS =============
function renderPostsPerMonth(d){
  const arr = ensureArray(d?.trends?.posts_per_month);
  console.log('renderPostsPerMonth - raw data:', arr);
  
  // Use the actual months from the data, not dynamically generated ones
  const dataMap = {};
  const monthsInData = new Set();
  arr.forEach(x => {
    dataMap[x.month] = x.count || 0;
    monthsInData.add(x.month);
  });
  
  // Get all months from the data and sort them
  const allMonths = Array.from(monthsInData).sort();
  console.log('renderPostsPerMonth - months from data:', allMonths);
  
  // If we have data, use it; otherwise fall back to last 12 months
  const labels = allMonths.length > 0 
    ? allMonths.map(m => labelMonth(m))
    : generateLast12Months().map(m => labelMonth(m));
  const vals = allMonths.length > 0
    ? allMonths.map(m => dataMap[m] || 0)
    : generateLast12Months().map(m => dataMap[m] || 0);
  
  console.log('renderPostsPerMonth - final labels:', labels);
  console.log('renderPostsPerMonth - final values:', vals);
  
  drawOrUpdateChart('chartPostsPerMonth',{
    type:'bar',
    data:{ 
      labels, 
      datasets:[{ 
        label:'Posts', 
        data: vals,
        backgroundColor: CONFIG.colors.primary,
        borderColor: CONFIG.colors.primary,
        borderWidth: 1
      }]
    },
    options:{ 
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins:{ 
        legend:{ display:false },
        tooltip: { 
          backgroundColor: CONFIG.colors.primary,
          titleColor: '#fff',
          bodyColor: '#fff'
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: 12
          },
          formatter: (value) => {
            return value > 0 ? value : ''; // Only show non-zero values
          },
          anchor: 'center',
          align: 'center'
        }
      }, 
      scales:{ 
        x:{ 
          title:{ display:true, text:'Month' },
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }, 
        y:{ 
          title:{ display:true, text:'Posts' },
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } }
        } 
      } 
    }
  });
}

function renderMedianByMonth(d){
  const arr = ensureArray(d?.trends?.month_median);
  
  // Use the actual months from the data, not dynamically generated ones
  const medianDataMap = {};
  const totalDataMap = {};
  const monthsInData = new Set();
  arr.forEach(x => {
    medianDataMap[x.month] = x.median || 0;
    totalDataMap[x.month] = x.total || 0;
    monthsInData.add(x.month);
  });
  
  // Get all months from the data and sort them
  const allMonths = Array.from(monthsInData).sort();
  
  // If we have data, use it; otherwise fall back to last 12 months
  const labels = allMonths.length > 0 
    ? allMonths.map(m => labelMonth(m))
    : generateLast12Months().map(m => labelMonth(m));
  const medianVals = allMonths.length > 0
    ? allMonths.map(m => medianDataMap[m] || 0)
    : generateLast12Months().map(m => medianDataMap[m] || 0);
  const totalVals = allMonths.length > 0
    ? allMonths.map(m => totalDataMap[m] || 0)
    : generateLast12Months().map(m => totalDataMap[m] || 0);
  
  drawOrUpdateChart('chartMedianByMonth',{
    type:'line',
    data:{ 
      labels, 
      datasets:[
        { 
          label:'Median engagement (baseline quality)', 
          data: medianVals, 
          tension: 0.3, 
          pointRadius: 4,
          pointHoverRadius: 6,
          borderColor: CONFIG.colors.secondary,
          backgroundColor: CONFIG.colors.background,
          borderWidth: 2,
          fill: false,
          yAxisID: 'y'
        },
        {
          label:'Total engagement (reach/viral potential)',
          data: totalVals,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderWidth: 2,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    },
    options:{ 
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins:{ 
        legend:{ 
          display: true,
          position: 'top',
          labels: {
            font: { size: 11 },
            usePointStyle: true,
            pointStyle: 'line'
          }
        },
        tooltip: { 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                return `Median engagement: ${context.parsed.y}`;
              } else {
                return `Total engagement: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        datalabels: {
          display: false // Hide data labels for cleaner dual-axis chart
        }
      }, 
      scales:{ 
        x:{ 
          title:{ display:true, text:'Month' },
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }, 
        y:{ 
          type: 'linear',
          display: true,
          position: 'left',
          title:{ display:true, text:'Median Engagement' },
          beginAtZero: true,
          ticks: { font: { size: 11 } },
          grid: {
            drawOnChartArea: false,
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title:{ display:true, text:'Total Engagement' },
          beginAtZero: true,
          ticks: { font: { size: 11 } },
          grid: {
            drawOnChartArea: false,
          },
        }
      } 
    }
  });
}

function renderFormatMix(d){
  const donut = toDonut(d?.mix?.type_share || {});
  const counts = d?.mix?.type_counts || {};
  const colors = ['#157187', '#63a5b3', '#b1d9df', '#d4ebef', '#8ec5d1', '#a6d4dc'];
  
  drawOrUpdateChart('chartFormatMix',{
    type:'doughnut',
    data:{ 
      labels: donut.map(v=>v.name), 
      datasets:[{ 
        data: donut.map(v=>v.value),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options:{ 
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins:{ 
        legend:{ 
          position:'right',
          labels: { padding: 10, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const type = context.label;
              const count = counts[type] || 0;
              const percentage = context.parsed;
              const postLabel = count === 1 ? 'post' : 'posts';
              return `${type}: ${count} ${postLabel} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value, context) => {
            if (value < 5) return ''; // Hide labels for very small segments
            return value + '%';
          },
          anchor: 'center',
          align: 'center'
        }
      } 
    }
  });
}

function renderActionMix(d){
  const donut = toDonut(d?.mix?.action_share || {});
  const counts = d?.mix?.action_counts || {};
  const colors = ['#157187', '#63a5b3', '#b1d9df'];
  
  drawOrUpdateChart('chartActionMix',{
    type:'doughnut',
    data:{ 
      labels: donut.map(v=>v.name), 
      datasets:[{ 
        data: donut.map(v=>v.value),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options:{ 
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins:{ 
        legend:{ 
          position:'right',
          labels: { padding: 10, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const action = context.label;
              const count = counts[action] || 0;
              const percentage = context.parsed;
              const postLabel = count === 1 ? 'post' : 'posts';
              return `${action}: ${count} ${postLabel} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value, context) => {
            if (value < 5) return ''; // Hide labels for very small segments
            return value + '%';
          },
          anchor: 'center',
          align: 'center'
        }
      } 
    }
  });
}
