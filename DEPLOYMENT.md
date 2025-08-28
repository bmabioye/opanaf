# OPANAF Deployment Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- GitHub account
- Your domain: opanaf.org
- Access to domain DNS settings

## Step 1: GitHub Repository Setup

1. **Create a new GitHub repository:**
   ```bash
   # Navigate to your project directory
   cd c:\Dev\opanaf
   
   # Initialize git if not already done
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial OPANAF website commit"
   
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/opanaf.git
   
   # Push to GitHub
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Save

## Step 2: Netlify Setup (for Forms)

1. **Connect to Netlify:**
   - Visit https://netlify.com
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Choose GitHub and select your opanaf repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: (leave empty or put ".")
   - Deploy site

2. **Configure Custom Domain:**
   - In Netlify dashboard → Domain settings
   - Add custom domain: opanaf.org
   - Follow DNS instructions provided by Netlify

## Step 3: Domain Configuration

Add these DNS records to your domain provider:

### For GitHub Pages (if using GitHub Pages for hosting):
```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

### For Netlify (recommended for forms):
```
Type: A
Name: @  
Value: 75.2.60.5

Type: CNAME
Name: www
Value: YOUR_NETLIFY_SUBDOMAIN.netlify.app
```

## Step 4: Form Configuration

✅ **Forms are already configured!** 

All forms now use Netlify Forms with:
- Spam protection (honeypot)
- File upload support
- Email notifications
- Admin dashboard access

### Form names configured:
- `interest` - Footer contact form
- `candidate-application` - Job placement candidate form
- `employer-inquiry` - Job placement employer form  
- `contact-placement` - Job placement contact form
- `skill-contact` - Skill acquisition contact
- `youth-application` - Youth program application
- `mentor-application` - Mentor application
- `youth-donation` - Youth donation form
- `youth-contact` - Youth contact form
- `relocation-application` - Relocation support application
- `partner-application` - Relocation partner application
- `relocation-contact` - Relocation contact form

## Step 5: Final Testing

1. **Test locally:**
   - Open index.html in browser
   - Check dark/light theme toggle
   - Verify all forms display correctly

2. **Test live:**
   - Visit your live site
   - Submit test forms
   - Check Netlify dashboard for submissions

## 💰 Cost Breakdown

| Service | Cost | Features |
|---------|------|----------|
| **GitHub Pages** | **$0** | Static site hosting |
| **Netlify Forms** | **$0** | 100 submissions/month |
| **Domain** | **$0** | You already own it |
| **Total Monthly** | **$0** | Perfect for NGO! |

### Upgrade Path (when needed):
- Netlify Pro: $19/month (1,000 forms/month)
- Custom email: $5-10/month via Google Workspace

## 🛠 Features Included

✅ **Fully responsive design**
✅ **Dark/light theme support** 
✅ **Form data collection with email notifications**
✅ **File upload support (resumes, documents)**
✅ **SEO optimized**
✅ **Fast loading with CDN**
✅ **Mobile-friendly**
✅ **Accessibility compliant**

## 📧 Form Notifications

Configure email notifications in Netlify:
1. Go to Forms tab in Netlify dashboard
2. Click on each form
3. Add notification emails (info@opanaf.org)
4. Set up custom success pages (optional)

## 🔄 Content Updates

To update content:
1. Edit files in your local copy
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```
3. Site auto-deploys within minutes

## 🚨 Emergency Support Setup

The site includes an emergency contact section on the relocation page for urgent assistance cases.

## 📊 Analytics (Optional - Free)

Add Google Analytics:
1. Get tracking code from Google Analytics
2. Add to each HTML page before `</head>`

## 🔐 Security Features

✅ **HTTPS enabled automatically**
✅ **XSS protection**
✅ **Content security policy**
✅ **Spam protection on forms**

This setup gives you a professional, scalable NGO website at $0 monthly cost!
