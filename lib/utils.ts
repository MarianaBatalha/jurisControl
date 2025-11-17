import { cva } from 'class-variance-authority';

export type ClassValue = string | null | undefined | boolean;

export function cn(...inputs: ClassValue[]): string {
  // A simplified version of clsx
  return inputs.filter(Boolean).join(' ');
}

const escapeCsvCell = (cellData: any) => {
    if (cellData == null) { // for both null and undefined
        return '';
    }
    const stringData = String(cellData);
    // If the string contains a comma, double quote, or newline, wrap it in double quotes
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        // Also, any double quotes inside the string must be escaped by another double quote
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
};

export function exportToCsv(data: Record<string, any>[], filename: string, headers: Record<string, string>) {
    if (!data || data.length === 0) {
        return;
    }
    
    const headerKeys = Object.keys(headers);
    const headerValues = Object.values(headers);

    const csvRows = [headerValues.join(',')]; // Header row with user-friendly names

    for (const row of data) {
        const values = headerKeys.map(key => escapeCsvCell(row[key]));
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


export { cva };

// A utility type to extract variant props from a cva function
export type VariantProps<T extends (...args: any) => any> = Omit<Parameters<T>[0], 'className'>;