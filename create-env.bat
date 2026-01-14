@echo off
echo Creating .env.local file for PitchWise...
echo.

(
echo # MongoDB Database
echo MONGODB_URI=mongodb+srv://PitchWise:PitchPassword123@pitchwise.e7ffemc.mongodb.net/pitchwise?retryWrites=true^&w=majority^&appName=PitchWise
echo.
echo # JWT Authentication
echo JWT_SECRET=super-secret-jwt-key-pitchwise-2024
echo.
echo # Cloudinary (File Uploads^)
echo NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dx5oirxxm
echo CLOUDINARY_CLOUD_NAME=dx5oirxxm
echo CLOUDINARY_API_KEY=785427995775754
echo CLOUDINARY_API_SECRET=850oVQ03TJ0cpV2GquzKuqUcfY4
echo.
echo # Resend Email Service
echo RESEND_API_KEY=re_93xVDmcr_MhFt71hVBfXPwpsQ5btS4TuC
echo FROM_EMAIL=onboarding@resend.dev
echo FROM_NAME=PitchWise Team
echo.
echo # Application URL
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo.
echo # Optional Settings
echo VERIFICATION_TOKEN_EXPIRY=24
) > .env.local

echo.
echo ✓ .env.local file created successfully!
echo.
echo Next steps:
echo 1. Restart your development server (Ctrl+C then npm run dev)
echo 2. Test the email verification system
echo.
pause
