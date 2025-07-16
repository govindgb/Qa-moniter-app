# Qa-moniter-app

## Google OAuth Setup

To enable Google authentication, you need to set up Google OAuth credentials:

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Configure the OAuth consent screen if prompted
7. Set the application type to "Web application"
8. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Generate NextAuth Secret

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

### 4. Features

- **Seamless Integration**: Users can sign in with their Google account
- **Automatic User Creation**: New users are automatically created with default "tester" role
- **Existing User Linking**: Existing users can link their Google account
- **Session Management**: Integrated with NextAuth for secure session handling
- **Fallback Authentication**: Traditional email/password login still available

## Email Configuration for Password Reset

To enable email functionality for password reset, you need to configure SMTP settings in your environment variables.

### Gmail Setup (Recommended for development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Add to your .env file**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   ```

### Production SMTP Providers

For production, consider using dedicated email services:

#### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

#### AWS SES
```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Testing Email Configuration

You can test your email configuration by visiting:
```
GET /api/auth/forgot-password
```

This will verify your SMTP connection without sending an email.

### Security Features

- **Token Expiration**: Reset tokens expire after 1 hour
- **Email Enumeration Protection**: Generic success messages prevent email enumeration attacks
- **Secure Token Generation**: Uses JWT with proper expiration
- **Professional Email Templates**: HTML and text versions included
- **Error Handling**: Graceful fallbacks if email service fails

### Environment Variables

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Make sure to set all required environment variables before starting the application.