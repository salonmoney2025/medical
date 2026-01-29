import * as XLSX from 'xlsx';
import { StudentUploadData, ExcelUploadResult } from '@/types';

/**
 * Generate Excel template for student data upload
 * @returns Buffer containing Excel file
 */
export const generateStudentTemplate = (): Buffer => {
  // Define template headers
  const headers = [
    'Name',
    'Matriculation Number',
    'Program',
    'Faculty',
    'Department',
  ];

  // Sample data to show expected format
  const sampleData = [
    {
      'Name': 'John Doe',
      'Matriculation Number': 'MED/2024/001',
      'Program': 'Bachelor of Medicine',
      'Faculty': 'Faculty of Medicine',
      'Department': 'Clinical Medicine',
    },
    {
      'Name': 'Jane Smith',
      'Matriculation Number': 'ENG/2024/002',
      'Program': 'Bachelor of Engineering',
      'Faculty': 'Faculty of Engineering',
      'Department': 'Computer Engineering',
    },
    {
      'Name': 'Michael Johnson',
      'Matriculation Number': 'SCI/2024/003',
      'Program': 'Bachelor of Science',
      'Faculty': 'Faculty of Science',
      'Department': 'Computer Science',
    },
  ];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 22 }, // Matriculation Number
    { wch: 30 }, // Program
    { wch: 30 }, // Faculty
    { wch: 30 }, // Department
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Template');

  // Add instructions sheet
  const instructions = [
    { 'Column': 'Name', 'Description': 'Full name of the student', 'Required': 'Yes' },
    { 'Column': 'Matriculation Number', 'Description': 'Unique student ID (e.g., MED/2024/001)', 'Required': 'Yes' },
    { 'Column': 'Program', 'Description': 'Academic program/course name', 'Required': 'Yes' },
    { 'Column': 'Faculty', 'Description': 'Faculty name', 'Required': 'Yes' },
    { 'Column': 'Department', 'Description': 'Department name', 'Required': 'Yes' },
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  instructionsSheet['!cols'] = [
    { wch: 22 },
    { wch: 45 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

/**
 * Parse uploaded Excel file and extract student data
 * @param fileBuffer - Buffer containing uploaded Excel file
 * @returns Array of student data objects
 */
export const parseStudentExcel = (fileBuffer: Buffer): StudentUploadData[] => {
  try {
    // Read workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Map to StudentUploadData format
    const students: StudentUploadData[] = jsonData.map((row: any) => ({
      name: row['Name'] || row['name'] || '',
      matriculation_number: row['Matriculation Number'] || row['matriculation_number'] || row['Matriculation_Number'] || '',
      program: row['Program'] || row['program'] || '',
      faculty: row['Faculty'] || row['faculty'] || '',
      department: row['Department'] || row['department'] || '',
    }));

    return students;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file. Please ensure it matches the template format.');
  }
};

/**
 * Validate student data from Excel
 * @param students - Array of student data
 * @returns Validation result with errors
 */
export const validateStudentData = (
  students: StudentUploadData[]
): ExcelUploadResult => {
  const errors: ExcelUploadResult['errors'] = [];
  let successful = 0;

  students.forEach((student, index) => {
    const rowNumber = index + 2; // Excel rows start at 1, plus header row

    // Check required fields
    if (!student.name || student.name.trim() === '') {
      errors.push({
        row: rowNumber,
        matriculation_number: student.matriculation_number || 'N/A',
        error: 'Name is required',
      });
      return;
    }

    if (!student.matriculation_number || student.matriculation_number.trim() === '') {
      errors.push({
        row: rowNumber,
        matriculation_number: 'N/A',
        error: 'Matriculation number is required',
      });
      return;
    }

    if (!student.program || student.program.trim() === '') {
      errors.push({
        row: rowNumber,
        matriculation_number: student.matriculation_number,
        error: 'Program is required',
      });
      return;
    }

    if (!student.faculty || student.faculty.trim() === '') {
      errors.push({
        row: rowNumber,
        matriculation_number: student.matriculation_number,
        error: 'Faculty is required',
      });
      return;
    }

    if (!student.department || student.department.trim() === '') {
      errors.push({
        row: rowNumber,
        matriculation_number: student.matriculation_number,
        error: 'Department is required',
      });
      return;
    }

    successful++;
  });

  return {
    success: errors.length === 0,
    total: students.length,
    successful,
    failed: errors.length,
    errors,
  };
};

/**
 * Export medical records to Excel
 * @param records - Array of medical records
 * @returns Buffer containing Excel file
 */
export const exportMedicalRecordsToExcel = (records: any[]): Buffer => {
  // Create worksheet from records
  const worksheet = XLSX.utils.json_to_sheet(records);

  // Set column widths
  worksheet['!cols'] = Array(Object.keys(records[0] || {}).length).fill({ wch: 20 });

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Records');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};
