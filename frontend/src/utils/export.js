import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDate } from './formatters';

export const exportToCSV = (data, filename = 'export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}-${formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportToPDF = async (element, filename = 'export') => {
  // This would require additional libraries like jspdf or react-pdf
  console.log('PDF export not implemented');
};

export const exportToJSON = (data, filename = 'export') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}-${formatDate(new Date(), 'yyyy-MM-dd')}.json`);
};

export const printElement = (element) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};