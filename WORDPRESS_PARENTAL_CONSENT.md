# WordPress Parental Consent Page Setup

## JavaScript Code for WordPress Page

Add this JavaScript code to your WordPress parental consent page at `https://youthbibleinayear.com/parental-consent`:

```javascript
// Get token from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Your actual Supabase credentials
const SUPABASE_URL = 'https://xgnuuphbaipsqgzetvqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbnV1cGhiYWlwc3FnemV0dnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTkyMDEsImV4cCI6MjA3Nzg3NTIwMX0.7wUsnZY5_3oB88b3FZl9z1ep30ONkTujSgW4NiEKDKc';

// Approve button click handler
async function approveConsent() {
  if (!token) {
    alert('Invalid consent link - no token found');
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/approve-parental-consent?token=${token}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.ok) {
      // Show success message
      alert('Consent approved successfully! Your child can now access the app.');
      // Optionally redirect to a success page
      window.location.href = 'https://youthbibleinayear.com/consent-approved';
    } else {
      // Show error message
      alert(`Failed to approve consent: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error approving consent:', error);
    alert('Network error. Please try again.');
  }
}

// Deny button click handler
async function denyConsent() {
  if (!token) {
    alert('Invalid consent link - no token found');
    return;
  }

  if (!confirm('Are you sure you want to deny consent? This will prevent your child from using the app.')) {
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/deny-parental-consent?token=${token}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.ok) {
      // Show message
      alert('Consent denied. Your child will not be able to access the app.');
      // Optionally redirect to a page
      window.location.href = 'https://youthbibleinayear.com/consent-denied';
    } else {
      // Show error message
      alert(`Failed to deny consent: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error denying consent:', error);
    alert('Network error. Please try again.');
  }
}

// Attach event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Find your approve and deny buttons by their IDs or classes
  const approveButton = document.getElementById('approve-btn');
  const denyButton = document.getElementById('deny-btn');

  if (approveButton) {
    approveButton.addEventListener('click', approveConsent);
  }

  if (denyButton) {
    denyButton.addEventListener('click', denyConsent);
  }

  // Display token status
  if (!token) {
    document.body.innerHTML = '<h1>Invalid Link</h1><p>This consent link is invalid or expired.</p>';
  }
});
```

## HTML Structure

Your WordPress page should have buttons with these IDs:

```html
<div class="consent-container">
  <h1>Parental Consent Required</h1>
  <p>Your child has requested to use Youth Bible In A Year...</p>

  <div class="consent-buttons">
    <button id="approve-btn" class="approve-button">
      I Approve - Let My Child Use the App
    </button>

    <button id="deny-btn" class="deny-button">
      I Do Not Approve
    </button>
  </div>
</div>
```

## Testing

To test the consent flow:

1. Sign up a youth user (age 13-17) in the app
2. Check your email for the parent consent email
3. Click the link in the email (should go to WordPress)
4. Click "Approve" button
5. The youth should be able to access the app within 10 seconds

## URLs

- **Approve endpoint**: `https://xgnuuphbaipsqgzetvqw.supabase.co/functions/v1/approve-parental-consent?token=XXX`
- **Deny endpoint**: `https://xgnuuphbaipsqgzetvqw.supabase.co/functions/v1/deny-parental-consent?token=XXX`

## Expected Responses

### Success Response
```json
{
  "ok": true,
  "message": "Parental consent recorded."
}
```

### Error Response
```json
{
  "ok": false,
  "error": "Token has expired"
}
```

## Common Issues

1. **404 Error**: Make sure you're using the correct Supabase URL (no placeholder text)
2. **401 Error**: Check that the Authorization header includes the anon key
3. **Token expired**: Consent links expire after 30 days
4. **Already processed**: Each token can only be used once
