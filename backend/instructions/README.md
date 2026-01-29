# Student Medical Records Management System

A comprehensive web application for managing student medical records with role-based access control, built with Next.js, React, TypeScript, and MySQL.

## Features

### Super Admin
- Upload student data via Excel file (bulk upload)
- Download Excel template for proper data format
- Create and manage Medical Officer accounts
- View all medical records and system data
- Full system access and configuration

### Medical Officer
- Search students by matriculation number
- View student information (read-only)
- Complete comprehensive medical examination forms
- Submit medical records to database
- Track examination history

### Student Data Structure
- Name
- Matriculation Number (unique identifier)
- Program
- Faculty
- Department

### Medical Examination Form Fields
- **Basic Measurements**: Weight (kg), Height (cm)
- **Visual Acuity**: Left Eye (LE), Right Eye (RE)
- **Blood Group**: Optional dropdown selection
- **Medical History**: Past conditions, chronic illnesses
- **Medications**: Long-standing medications
- **Allergies**: Known allergies
- **Examinations**:
  - Respiratory & Breast Examination
  - Cardiovascular Examination
  - Mental State Examination
- **Additional Notes**: Optional field for extra information

## Tech Stack

- **Frontend**: React, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: xlsx library for Excel operations
- **Password Security**: bcryptjs for password hashing

## Design

- **Color Scheme**: Gold (#FFD700) and Black (#000000)
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, professional medical application design

## Project Structure

```
student-medical-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── users/             # User management
│   │   ├── students/          # Student data endpoints
│   │   ├── medical-records/   # Medical records endpoints
│   │   ├── download/          # Template download
│   │   └── upload/            # File upload endpoints
│   ├── dashboard/             # Dashboard pages
│   │   ├── admin/            # Super Admin dashboard
│   │   └── medical-officer/  # Medical Officer dashboard
│   └── login/                 # Login page
├── components/
│   ├── ui/                    # Reusable UI components
│   └── dashboard/             # Dashboard components
├── lib/
│   ├── db/                    # Database connection & schema
│   ├── auth/                  # Authentication utilities
│   └── utils/                 # Helper functions
├── types/                     # TypeScript type definitions
└── middleware/                # Route protection middleware
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
cd student-medical-system
npm install
```

**Required packages** (install manually if needed):
```bash
npm install mysql2 bcryptjs jsonwebtoken xlsx react-hook-form zod axios
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 2: Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE student_medical_system;
```

2. Run the schema file:
```bash
mysql -u root -p student_medical_system < lib/db/schema.sql
```

Or import manually through MySQL Workbench or phpMyAdmin.

### Step 3: Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_medical_system
JWT_SECRET=your_jwt_secret_key
```

**Important**: Change the JWT_SECRET to a secure random string in production!

### Step 4: Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

### Super Admin
- **Email**: admin@medical.edu
- **Password**: admin123

**IMPORTANT**: Change this password immediately after first login in production!

## Usage Guide

### For Super Admin

1. **Login** at `/login` with super admin credentials
2. **Download Template**: Get the Excel template for student data
3. **Prepare Data**: Fill the Excel file with student information
4. **Upload Students**: Upload the completed Excel file
5. **Create Medical Officers**: Add new medical officer accounts
6. **Monitor System**: View all records and system activity

### For Medical Officers

1. **Login** at `/login` with provided credentials
2. **Search Student**: Enter matriculation number to find student
3. **Review Information**: View student details
4. **Complete Form**: Fill out the medical examination form
5. **Submit Record**: Save the medical examination data

## Excel Template Format

The student upload Excel file must have these columns:

| Name | Matriculation Number | Program | Faculty | Department |
|------|---------------------|---------|---------|------------|
| John Doe | MED/2024/001 | Bachelor of Medicine | Faculty of Medicine | Clinical Medicine |

**Required Fields**: All columns are mandatory.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Users (Super Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Students
- `GET /api/students` - Get students (with search)
- `POST /api/students` - Add students (bulk or single)

### Medical Records
- `GET /api/medical-records` - Get medical records
- `POST /api/medical-records` - Create medical record

### File Operations
- `GET /api/download/template` - Download Excel template
- `POST /api/upload/students` - Upload student Excel file

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Protected API routes
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Database Schema

### Tables

1. **users** - System users (Super Admin, Medical Officers)
2. **students** - Student information
3. **medical_records** - Medical examination records
4. **medical_questions** - Configurable examination questions
5. **medical_answers** - Answers to custom questions

## Development Notes

### Adding New Medical Questions

Medical questions can be configured dynamically through the database. The system supports:
- Text input
- Textarea (multi-line text)
- Dropdown selections
- Checkboxes
- Number inputs

### Customization

- **Colors**: Update `tailwind.config.ts` and `app/globals.css`
- **Form Fields**: Modify medical record types in `types/index.ts`
- **Database Schema**: Update `lib/db/schema.sql`

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env.local`
- Ensure database exists and schema is imported

### Authentication Errors
- Clear localStorage in browser
- Verify JWT_SECRET in environment variables
- Check token expiration (default: 7 days)

### File Upload Issues
- Ensure file is .xlsx or .xls format
- Check file matches template structure
- Verify all required fields are present

## Production Deployment

Before deploying to production:

1. Change default super admin password
2. Generate secure JWT_SECRET
3. Use environment-specific database
4. Enable HTTPS
5. Set `NODE_ENV=production`
6. Configure proper CORS settings
7. Set up regular database backups

## Future Enhancements

- Export medical records to PDF
- Student medical history timeline
- Email notifications
- Advanced search and filtering
- Analytics dashboard
- Audit logging
- Two-factor authentication

## Support

For issues, questions, or contributions, please contact the development team.

## License

Proprietary - All Rights Reserved

---

**Student Medical Records Management System** © 2026
