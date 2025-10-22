'use client'

// Dynamic import to avoid SSR issues
const loadHtml2Pdf = () => import('html2pdf.js')

export const defaultPDFOptions = {
  margin: 10,
  filename: 'linkedin-analysis-report.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
}

export const generatePDF = async (elementId, options = {}) => {
  try {
    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available on the client side')
    }

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Dynamically import html2pdf
    const html2pdf = (await loadHtml2Pdf()).default
    const pdfOptions = { ...defaultPDFOptions, ...options }
    
    // Configure html2pdf options
    const opt = {
      margin: pdfOptions.margin,
      filename: pdfOptions.filename,
      image: pdfOptions.image,
      html2canvas: pdfOptions.html2canvas,
      jsPDF: pdfOptions.jsPDF
    }

    // Generate PDF
    const pdf = await html2pdf().set(opt).from(element).save()
    
    console.log('PDF generated successfully')
    return pdf
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export const printPage = () => {
  try {
    window.print()
    console.log('Print dialog opened')
  } catch (error) {
    console.error('Error opening print dialog:', error)
    throw error
  }
}
