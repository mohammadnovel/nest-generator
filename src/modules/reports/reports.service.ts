import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async generatePdf(
    entityName: string,
    filters: any = {},
  ): Promise<Buffer> {
    const repository = this.dataSource.getRepository(entityName);
    const data = await repository.find({ where: filters });

    if (data.length === 0) {
      throw new Error('No data found for the given filters');
    }

    // Get column names from the first record
    const columns = Object.keys(data[0]);

    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: `${entityName} Report`, style: 'header' },
        { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: columns.map(() => 'auto'),
            body: [
              columns.map((col) => ({ text: col, style: 'tableHeader' })),
              ...data.map((row) =>
                columns.map((col) => {
                  const value = row[col];
                  if (value instanceof Date) {
                    return value.toLocaleDateString();
                  }
                  return String(value || '');
                }),
              ),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 12,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black',
          fillColor: '#eeeeee',
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async generateExcel(
    entityName: string,
    filters: any = {},
  ): Promise<Buffer> {
    const repository = this.dataSource.getRepository(entityName);
    const data = await repository.find({ where: filters });

    if (data.length === 0) {
      throw new Error('No data found for the given filters');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(entityName);

    // Get column names from the first record
    const columns = Object.keys(data[0]);

    // Set up columns
    worksheet.columns = columns.map((col) => ({
      header: col,
      key: col,
      width: 15,
    }));

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    data.forEach((row) => {
      const rowData: any = {};
      columns.forEach((col) => {
        const value = row[col];
        if (value instanceof Date) {
          rowData[col] = value.toLocaleDateString();
        } else {
          rowData[col] = value;
        }
      });
      worksheet.addRow(rowData);
    });

    // Generate buffer
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
