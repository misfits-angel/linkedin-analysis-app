// Chart.js setup with plugins
import { Chart as ChartJS } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Import and register Chart.js components
import 'chart.js/auto'

// Register the datalabels plugin
(ChartJS as any).register(ChartDataLabels)

export { ChartJS, ChartDataLabels }
