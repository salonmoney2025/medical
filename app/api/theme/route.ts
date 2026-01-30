import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { JwtPayload } from '@/backend/server/auth/jwt';
import { ApiResponse } from '@/backend/server/types';

// GET - Retrieve theme settings (public, no auth required)
export async function GET() {
  try {
    // First check if the table exists
    try {
      const settings = await executeQuery('SELECT setting_key, setting_value FROM theme_settings');
      const theme: Record<string, string> = {};
      for (const row of settings) {
        theme[row.setting_key] = row.setting_value;
      }
      return NextResponse.json({ success: true, data: theme } as ApiResponse, { status: 200 });
    } catch {
      // Table doesn't exist yet, return defaults
      return NextResponse.json({
        success: true,
        data: {
          primary_color: '#16a34a',
          sidebar_color: '#000000',
          background_color: '#f0f0f0',
          accent_color: '#22c55e',
        },
      } as ApiResponse, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load theme' } as ApiResponse, { status: 500 });
  }
}

// PUT - Update theme settings (super_admin only)
async function updateThemeHandler(request: NextRequest, user: JwtPayload) {
  try {
    const body = await request.json();
    const allowedKeys = ['primary_color', 'sidebar_color', 'background_color', 'accent_color', 'button_color', 'text_color', 'bar_color', 'alert_duration'];

    // Ensure table exists
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        updated_by INT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.includes(key) && typeof value === 'string') {
        await executeQuery(
          `INSERT INTO theme_settings (setting_key, setting_value, updated_by)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
          [key, value, user.userId]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Theme updated successfully' } as ApiResponse, { status: 200 });
  } catch (error: any) {
    console.error('Update theme error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update theme' } as ApiResponse, { status: 500 });
  }
}

export const PUT = withAuth(updateThemeHandler, ['super_admin']);
