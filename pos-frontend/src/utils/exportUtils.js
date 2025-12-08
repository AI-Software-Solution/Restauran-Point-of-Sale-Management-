/**
 * Export utilities for PDF and Excel
 */

// Export to CSV (simple Excel-compatible format)
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        let value = row[header]
        // Handle nested objects
        if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""')
          if (value.includes(',') || value.includes('\n')) {
            value = `"${value}"`
          }
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Add BOM for UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  downloadBlob(blob, `${filename}.csv`)
}

// Export to Excel using XLSX-like format (XML Spreadsheet)
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])

  // Create Excel XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="header">
    <Font ss:Bold="1" ss:Size="12"/>
    <Interior ss:Color="#F6B100" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="date">
    <NumberFormat ss:Format="yyyy-mm-dd"/>
  </Style>
  <Style ss:ID="number">
    <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="currency">
    <NumberFormat ss:Format="#,##0.00"/>
  </Style>
</Styles>
<Worksheet ss:Name="${sheetName}">
<Table>`

  // Add header row
  xml += '\n<Row>'
  headers.forEach(header => {
    xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`
  })
  xml += '</Row>'

  // Add data rows
  data.forEach(row => {
    xml += '\n<Row>'
    headers.forEach(header => {
      const value = row[header]
      const { type, formattedValue, style } = formatCellValue(value)
      xml += `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${type}">${formattedValue}</Data></Cell>`
    })
    xml += '</Row>'
  })

  xml += `
</Table>
</Worksheet>
</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  downloadBlob(blob, `${filename}.xls`)
}

// Export to PDF (using print dialog)
export const exportToPDF = (elementId, filename = 'export') => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.warn('Element not found:', elementId)
    return
  }

  const printContent = element.innerHTML
  const printWindow = window.open('', '_blank')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f6b100;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        h1, h2, h3 {
          color: #1a1a1a;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bobur Mirzo Restaurant</h1>
        <p>Hisobot: ${filename}</p>
        <p>Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
      </div>
      ${printContent}
      <div class="footer">
        <p>Yaratilgan: ${new Date().toLocaleString('uz-UZ')}</p>
      </div>
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

// Generate printable table from data
export const generatePrintableTable = (data, title = 'Hisobot') => {
  if (!data || data.length === 0) return '<p>Ma\'lumot mavjud emas</p>'

  const headers = Object.keys(data[0])

  return `
    <h2>${title}</h2>
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${headers.map(h => `<td>${formatDisplayValue(row[h])}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

// Helper functions
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const escapeXml = (str) => {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return { type: 'String', formattedValue: '', style: null }
  }

  if (typeof value === 'number') {
    return {
      type: 'Number',
      formattedValue: value,
      style: Number.isInteger(value) ? 'number' : 'currency'
    }
  }

  if (value instanceof Date) {
    return {
      type: 'DateTime',
      formattedValue: value.toISOString(),
      style: 'date'
    }
  }

  if (typeof value === 'boolean') {
    return { type: 'String', formattedValue: value ? 'Ha' : 'Yo\'q', style: null }
  }

  if (typeof value === 'object') {
    return { type: 'String', formattedValue: escapeXml(JSON.stringify(value)), style: null }
  }

  return { type: 'String', formattedValue: escapeXml(String(value)), style: null }
}

const formatDisplayValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Ha' : 'Yo\'q'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'number') return value.toLocaleString('uz-UZ')
  return String(value)
}

export default {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  generatePrintableTable
}
