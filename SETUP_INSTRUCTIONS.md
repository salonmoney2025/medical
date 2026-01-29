# Quick Setup Instructions

## Next Steps to Get Your System Running

### 1. Install Dependencies (IMPORTANT - Network Required)

Once your network connection is stable, run:

```bash
cd student-medical-system
npm install mysql2 bcryptjs jsonwebtoken xlsx
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 2. Set Up MySQL Database

**Option A: Using MySQL Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE student_medical_system;

# Exit MySQL
exit

# Import schema
mysql -u root -p student_medical_system < lib/db/schema.sql
```

**Option B: Using MySQL Workbench or phpMyAdmin**
1. Create a new database named `student_medical_system`
2. Open the file `lib/db/schema.sql`
3. Execute the SQL script in your database

### 3. Configure Environment Variables

The `.env.local` file has been created with default values. Update these fields:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=student_medical_system
JWT_SECRET=change_this_to_a_random_secure_string
```

### 4. Start the Development Server

```bash
npm run dev
```

Access the application at: http://localhost:3000

### 5. Login with Default Credentials

**Super Admin Account:**
- Email: `admin@medical.edu`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately!

## What's Been Built

### ✅ Complete Features

1. **Authentication System**
   - JWT-based login
   - Role-based access control
   - Password hashing with bcryptjs

2. **Super Admin Dashboard**
   - Excel template download
   - Bulk student upload
   - Medical officer account creation
   - User management

3. **Medical Officer Dashboard**
   - Student search by matriculation number
   - Comprehensive medical examination form
   - Record submission

4. **Database Schema**
   - Users table (Admin & Medical Officers)
   - Students table
   - Medical records table
   - Medical questions table (configurable)

5. **API Endpoints**
   - Authentication endpoints
   - User management
   - Student CRUD operations
   - Medical records management
   - File upload/download

6. **UI Components**
   - Gold and Black themed design
   - Responsive layouts
   - Form components
   - Dashboard layouts

### 📁 File Structure

```
Key Files Created:
├── app/
│   ├── api/auth/login/route.ts          # Login endpoint
│   ├── api/users/route.ts               # User management
│   ├── api/students/route.ts            # Student operations
│   ├── api/medical-records/route.ts     # Medical records
│   ├── api/upload/students/route.ts     # Excel upload
│   ├── api/download/template/route.ts   # Template download
│   ├── login/page.tsx                   # Login page
│   ├── dashboard/admin/page.tsx         # Admin dashboard
│   └── dashboard/medical-officer/page.tsx # Officer dashboard
├── lib/
│   ├── db/connection.ts                 # Database connection
│   ├── db/schema.sql                    # Database schema
│   ├── auth/jwt.ts                      # JWT utilities
│   ├── auth/password.ts                 # Password hashing
│   └── utils/excel.ts                   # Excel processing
├── types/index.ts                        # TypeScript types
└── components/                          # UI components
```

## Testing the System

### 1. Test Super Admin Functions

1. Login as admin
2. Download the Excel template
3. Add sample student data
4. Upload the Excel file
5. Create a medical officer account

### 2. Test Medical Officer Functions

1. Logout from admin
2. Login with medical officer credentials
3. Search for a student by matriculation number
4. Fill out medical examination form
5. Submit the record

## Troubleshooting

### Database Connection Error
- Verify MySQL is running: `mysql --version`
- Check credentials in `.env.local`
- Ensure database exists: `SHOW DATABASES;` in MySQL

### Login Issues
- Clear browser localStorage
- Check if JWT_SECRET is set in `.env.local`
- Verify user exists in database: `SELECT * FROM users;`

### File Upload Not Working
- Install xlsx package: `npm install xlsx`
- Check file format is .xlsx or .xls
- Ensure file matches template structure

## Production Deployment Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Generate secure JWT_SECRET (use random 32+ character string)
- [ ] Update database credentials
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Test all user flows
- [ ] Review security settings

## Need Help?

Refer to the main [README.md](README.md) for detailed documentation.

---

System built with Next.js 15, React, TypeScript, and MySQL
