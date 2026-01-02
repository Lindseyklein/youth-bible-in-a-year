# Grow365 Students - Marketing Landing Page

A beautiful, mobile-first marketing landing page for the Grow365 Students Bible-in-a-Year discipleship app.

## Features

- **Mobile-First Design**: Optimized for all screen sizes, especially mobile devices
- **Teen-Friendly UI**: Modern, clean design with gradient accents and smooth animations
- **Clear CTAs**: Multiple call-to-action buttons throughout the page
- **Feature Showcase**: Comprehensive sections highlighting all app features
- **Pricing Section**: Clear $24.99/year pricing with no hidden fees
- **Performance**: Pure HTML/CSS/JS with no frameworks for fast loading

## File Structure

```
landing-page/
├── index.html      # Main landing page
├── styles.css      # All styling (mobile-first)
├── script.js       # Interactive features
└── README.md       # This file
```

## Deployment Options

### Option 1: Static Hosting (Recommended)

Deploy to any static hosting service:

**Netlify:**
1. Drag and drop the `landing-page` folder to Netlify
2. Or connect your Git repository
3. Done! Your site is live

**Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to landing-page folder: `cd landing-page`
3. Run: `vercel`
4. Follow the prompts

**GitHub Pages:**
1. Push the landing-page folder to your repository
2. Go to Settings > Pages
3. Select the branch and folder
4. Your site will be live at `https://yourusername.github.io/repo-name/`

**Cloudflare Pages:**
1. Connect your Git repository
2. Set build directory to `landing-page`
3. No build command needed
4. Deploy

### Option 2: Traditional Web Hosting

Upload the files via FTP to any web hosting service:
- GoDaddy
- Bluehost
- HostGator
- SiteGround
- etc.

### Option 3: CDN

Upload to AWS S3, Google Cloud Storage, or Azure Blob Storage with CDN.

## Local Development

To view the page locally:

1. **Simple HTTP Server (Python):**
   ```bash
   cd landing-page
   python3 -m http.server 8000
   ```
   Visit: http://localhost:8000

2. **Simple HTTP Server (Node.js):**
   ```bash
   npx http-server landing-page
   ```

3. **Live Server (VS Code Extension):**
   - Install "Live Server" extension
   - Right-click `index.html`
   - Select "Open with Live Server"

## Customization

### Update Sign-Up Link

The sign-up buttons currently redirect to `/auth/sign-up`. Update this in `script.js`:

```javascript
// Change this line to your actual sign-up URL
window.location.href = 'https://yourdomain.com/auth/sign-up';
```

### Update Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #2563EB;        /* Main blue color */
    --primary-dark: #1E40AF;   /* Hover state */
    --secondary: #10B981;      /* Green accents */
    --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Update Content

Edit `index.html` directly to change text, add testimonials, or modify sections.

## Performance Tips

- The page uses Google Fonts (Inter). Consider self-hosting for even better performance.
- All images are placeholders. Add actual screenshots/photos for better engagement.
- Consider adding Open Graph meta tags for social media sharing.

## SEO Recommendations

Add these meta tags to `<head>` in `index.html`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourdomain.com/">
<meta property="og:title" content="Grow365 Students - Bible-in-a-Year App">
<meta property="og:description" content="Daily Bible reading, community, and spiritual growth for Christian teens">
<meta property="og:image" content="https://yourdomain.com/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://yourdomain.com/">
<meta property="twitter:title" content="Grow365 Students - Bible-in-a-Year App">
<meta property="twitter:description" content="Daily Bible reading, community, and spiritual growth for Christian teens">
<meta property="twitter:image" content="https://yourdomain.com/og-image.jpg">
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025 Grow365 Students. All rights reserved.

## Support

For questions or issues, contact: support@grow365students.com
