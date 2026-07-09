export function exportReportToPDF(elementId, filename = 'healthscope-triage-report.pdf') {
  return import('html2pdf.js').then(({ default: html2pdf }) => {
    const element = document.getElementById(elementId)
    if (!element) throw new Error('Print target not found')

    const options = {
      margin: [12, 12, 12, 12],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    return html2pdf().set(options).from(element).save()
  })
}
