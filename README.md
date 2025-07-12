# Qa-moniter-app

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