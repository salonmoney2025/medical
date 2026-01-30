import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/database/connection';
import { withAuth } from '@/backend/server/auth/middleware';
import { JwtPayload } from '@/backend/server/auth/jwt';
import { ApiResponse } from '@/backend/server/types';

// GET - Retrieve profile image for current user
async function getProfileImageHandler(request: NextRequest, user: JwtPayload) {
  try {
    const results = await executeQuery(
      'SELECT profile_image FROM users WHERE id = ?',
      [user.userId]
    );

    if (!results || results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { profile_image: results[0].profile_image } } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile image error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile image' } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Upload/update profile image (base64 data URL)
async function updateProfileImageHandler(request: NextRequest, user: JwtPayload) {
  try {
    const body = await request.json();
    const { profile_image } = body;

    if (!profile_image) {
      return NextResponse.json(
        { success: false, error: 'Profile image data is required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate it's a base64 data URL (image only)
    if (!profile_image.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid image format. Must be a data URL.' } as ApiResponse,
        { status: 400 }
      );
    }

    // Limit size (~2MB base64)
    if (profile_image.length > 2800000) {
      return NextResponse.json(
        { success: false, error: 'Image too large. Maximum size is 2MB.' } as ApiResponse,
        { status: 400 }
      );
    }

    await executeQuery(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [profile_image, user.userId]
    );

    return NextResponse.json(
      { success: true, message: 'Profile image updated successfully' } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile image error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile image' } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE - Remove profile image
async function deleteProfileImageHandler(request: NextRequest, user: JwtPayload) {
  try {
    await executeQuery(
      'UPDATE users SET profile_image = NULL WHERE id = ?',
      [user.userId]
    );

    return NextResponse.json(
      { success: true, message: 'Profile image removed' } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete profile image error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove profile image' } as ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(getProfileImageHandler, ['super_admin', 'medical_officer']);
export const PUT = withAuth(updateProfileImageHandler, ['super_admin', 'medical_officer']);
export const DELETE = withAuth(deleteProfileImageHandler, ['super_admin', 'medical_officer']);
