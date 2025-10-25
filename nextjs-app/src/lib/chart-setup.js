// Chart.js setup with plugins
import { Chart as ChartJS } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Import and register Chart.js components
import 'chart.js/auto'

// Register the datalabels plugin
ChartJS.register(ChartDataLabels)

// Set global defaults - disable datalabels by default
// Individual charts can override this by setting display: true in their config
ChartJS.defaults.set('plugins.datalabels', {
  display: false
})

export { ChartJS, ChartDataLabels }
