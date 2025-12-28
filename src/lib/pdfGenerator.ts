import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LoanInput, AmortizationRow } from '../types/schema';
import type { LoanSummary } from './engine';
import { formatCurrency, formatDateDisplay, formatMonthsToYearsAndMonths } from './formatters';

interface PDFData {
  loanInput: LoanInput;
  rows: AmortizationRow[];
  summary: LoanSummary;
}

export function generatePDFReport(data: PDFData): void {
  const { loanInput, rows, summary } = data;
  // Crear documento en formato horizontal desde el inicio
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Configuración de colores
  const primaryColor: [number, number, number] = [41, 128, 185]; // Azul
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Gris oscuro
  const accentColor: [number, number, number] = [231, 76, 60]; // Rojo
  
  let yPosition = 15;
  
  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Reporte de Préstamo', 14, yPosition);
  
  yPosition += 10;
  
  // Información del préstamo - en tres columnas para aprovechar el espacio horizontal
  doc.setFontSize(13);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Información del Préstamo', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Columna izquierda
  const leftColumn = [
    ['Nombre:', loanInput.name || 'N/A'],
    ['Monto Principal:', formatCurrency(parseFloat(loanInput.principal || '0'))],
    ['Tasa Anual:', `${loanInput.annualRate || '0'}%`],
  ];
  
  let tempY = yPosition;
  leftColumn.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, tempY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, tempY);
    tempY += 6;
  });
  
  // Columna central
  const centerColumn = [
    ['Plazo Original:', `${loanInput.termMonths || 0} meses (${formatMonthsToYearsAndMonths(loanInput.termMonths || 0)})`],
    ['Fecha de Inicio:', formatDateDisplay(loanInput.startDate)],
  ];
  
  tempY = yPosition;
  centerColumn.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 120, tempY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 170, tempY);
    tempY += 6;
  });
  
  // Columna derecha
  const rightColumn = [
    ['Seguro Mensual:', formatCurrency(parseFloat(loanInput.insuranceAmount || '0'))],
    ['Cuotas Adicionales:', formatCurrency(parseFloat(loanInput.additionalFees || '0'))],
  ];
  
  tempY = yPosition;
  rightColumn.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 220, tempY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 260, tempY);
    tempY += 6;
  });
  
  yPosition = Math.max(tempY, yPosition + leftColumn.length * 6) + 8;
  
  // Métricas clave - en formato de tabla horizontal
  doc.setFontSize(13);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Métricas Clave', 14, yPosition);
  
  yPosition += 7;
  
  const metrics: Array<[string, string, [number, number, number]]> = [
    ['Total a Pagar:', formatCurrency(summary.totalPaid), primaryColor],
    ['Costo Total (Total pagos - capital recibido):', formatCurrency(summary.totalSunkCost), accentColor],
    ['Plazo Real:', formatMonthsToYearsAndMonths(summary.actualTermMonths), [46, 204, 113]], // Verde
    ['Total de Intereses:', formatCurrency(summary.totalInterest), secondaryColor],
  ];
  
  // Dividir métricas en dos columnas
  const leftMetrics = metrics.slice(0, 2);
  const rightMetrics = metrics.slice(2);
  
  tempY = yPosition;
  leftMetrics.forEach(([label, value, color]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, 14, tempY);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(value, 100, tempY);
    doc.setTextColor(0, 0, 0);
    tempY += 7;
  });
  
  tempY = yPosition;
  rightMetrics.forEach(([label, value, color]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, 150, tempY);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(value, 240, tempY);
    doc.setTextColor(0, 0, 0);
    tempY += 7;
  });
  
  yPosition = Math.max(tempY, yPosition + leftMetrics.length * 7) + 8;
  
  // Desglose de costos
  doc.setFontSize(13);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Desglose de Costos', 14, yPosition);
  
  yPosition += 7;
  
  const costBreakdown = [
    ['Principal', formatCurrency(parseFloat(loanInput.principal || '0'))],
    ['Total Pagado', formatCurrency(summary.totalPaid)],
    ['Costo Total', formatCurrency(summary.totalSunkCost)],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Concepto', 'Monto']],
    body: costBreakdown,
    theme: 'striped',
    headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 150 },
      1: { cellWidth: 100, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // Crear nueva página en formato horizontal para la tabla de amortización
  doc.addPage('landscape');
  yPosition = 15;
  
  // Título de la tabla de amortización
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Tabla de Amortización', 14, yPosition);
  
  yPosition += 10;
  
  // Preparar datos de la tabla
  const insurance = parseFloat(loanInput.insuranceAmount || '0');
  const fees = parseFloat(loanInput.additionalFees || '0');
  const insuranceAndFees = insurance + fees;
  
  const tableData = rows.map((row) => [
    row.period.toString(),
    formatDateDisplay(row.paymentDate),
    formatCurrency(row.monthlyPayment),
    formatCurrency(row.interestComponent),
    formatCurrency(insuranceAndFees),
    formatCurrency(row.principalComponent),
    formatCurrency(row.extraComponent),
    formatCurrency(row.balance),
    formatCurrency(row.sunkCostAccumulated),
  ]);
  
  // Calcular anchos de columna para formato horizontal (ancho total ~277mm en landscape A4)
  // Distribuir el espacio disponible (277 - 28 de márgenes = 249mm)
  const columnWidths = {
    0: 15,  // Período
    1: 32,  // Fecha
    2: 32,  // Pago Total
    3: 28,  // Interés
    4: 28,  // Seguro/Cuotas
    5: 28,  // Principal
    6: 28,  // Pago Extra
    7: 32,  // Saldo
    8: 32,  // Costo Acum.
  };
  
  // Dividir la tabla en páginas si es necesario (formato horizontal)
  autoTable(doc, {
    startY: yPosition,
    head: [[
      'Período',
      'Fecha',
      'Pago Total',
      'Interés',
      'Seguro/Cuotas',
      'Principal',
      'Pago Extra',
      'Saldo',
      'Costo Acum.',
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: primaryColor as any, 
      textColor: [255, 255, 255], 
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: columnWidths[0], halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: columnWidths[1], halign: 'left' },
      2: { cellWidth: columnWidths[2], halign: 'right' },
      3: { cellWidth: columnWidths[3], halign: 'right' },
      4: { cellWidth: columnWidths[4], halign: 'right' },
      5: { cellWidth: columnWidths[5], halign: 'right' },
      6: { cellWidth: columnWidths[6], halign: 'right' },
      7: { cellWidth: columnWidths[7], halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: columnWidths[8], halign: 'right' },
    },
    margin: { left: 14, right: 14, top: yPosition },
    styles: { 
      overflow: 'linebreak', 
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    didParseCell: (data: any) => {
      // Resaltar filas con pagos extra
      if (data.row.index < tableData.length && data.section === 'body') {
        const row = rows[data.row.index];
        if (row.extraComponent > 0) {
          data.cell.styles.fillColor = [220, 237, 200]; // Verde claro
        }
      }
    },
    didDrawPage: (data: any) => {
      // Agregar título en cada nueva página de la tabla
      if (data.pageNumber > 2) {
        doc.setFontSize(16);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Tabla de Amortización (continuación)', 14, 15);
      }
    },
  });
  
  // Pie de página - ajustar según orientación de cada página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }
  
  // Generar nombre del archivo
  const fileName = `reporte-prestamo-${loanInput.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Descargar el PDF
  doc.save(fileName);
}

