import { NextRequest, NextResponse } from 'next/server';
import { generateStudentTemplate } from '@/backend/server/utils/excel';
import { withAuth } from '@/backend/server/auth/middleware';

// GET - Download student upload template
async function downloadTemplateHandler(request: NextRequest) {
  try {
    // Generate Excel template
    const buffer = generateStudentTemplate();

    // Convert Buffer to Uint8Array for Response compatibility
    const uint8Array = new Uint8Array(buffer);

    // Create response with Excel file
    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="student_upload_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Download template error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate template',
      },
      { status: 500 }
    );
  }
}

// Export protected route (only super_admin can download)
export const GET = withAuth(downloadTemplateHandler, ['super_admin']);
