# Bible API Integration Guide

This document explains the multi-source Bible API system implemented in this application.

## Overview

The application now uses a unified Bible API service (`lib/bibleApiUnified.ts`) that integrates multiple Bible API sources with automatic fallback. This provides:

- Access to more Bible translations (ESV, NIV, NLT, KJV, ASV, WEB, etc.)
- Better reliability through automatic fallback chain
- Improved error handling
- Caching to reduce API calls

## Available Bible Translations

| Translation | Full Name | Source API | Notes |
|------------|-----------|------------|-------|
| ESV | English Standard Version | ESV API (Crossway) | Official source, requires API key |
| NIV | New International Version | Rob Keplin API | Rare availability |
| NLT | New Living Translation | Rob Keplin API | |
| KJV | King James Version | Rob Keplin API | Public domain |
| ASV | American Standard Version | Rob Keplin API | Public domain |
| WEB | World English Bible | Rob Keplin API | Public domain |

## API Sources

### 1. ESV API (Primary for ESV)
- **URL**: https://api.esv.org/v3
- **Authentication**: Token-based (via EXPO_PUBLIC_ESV_API_KEY)
- **Rate Limits**: 5,000 queries/day, 1,000/hour, 60/minute
- **Usage**: Non-commercial use only
- **Attribution**: Must include ESV copyright notice

### 2. Rob Keplin Bible API (Primary for NIV/NLT/KJV)
- **URL**: https://bible-go-api.rkeplin.com/v1
- **Authentication**: None required
- **Rate Limits**: No apparent limits
- **Features**: Open source, supports 200+ versions
- **Special**: Rare NIV access

### 3. API.Bible (Fallback)
- **URL**: https://rest.api.bible/v1
- **Authentication**: API key (EXPO_PUBLIC_API_BIBLE_KEY)
- **Rate Limits**: Varies by plan (free tier: 10,000 requests/day)
- **Usage**: Fallback for specific versions

### 4. bible-api.com (Fallback)
- **URL**: https://bible-api.com
- **Authentication**: None required
- **Rate Limits**: Unknown
- **Usage**: Final fallback before database

### 5. Local Database (Final Fallback)
- Supabase database with cached verses
- Offline support
- Genesis chapters pre-populated

## Fallback Chain

The system tries sources in this order until it finds the requested passage:

1. **Cache Check** (if user is authenticated)
2. **Primary Source** (based on version requested)
   - ESV → ESV API
   - NIV/NLT → Rob Keplin API
   - KJV/ASV → Rob Keplin API
3. **Alternative Sources**
   - Try Rob Keplin API
   - Try API.Bible (if configured)
   - Try bible-api.com
4. **Database** (local cache)

## Environment Variables

Add these to your `.env` file:

```env
# Supabase (required)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# API.Bible (optional but recommended)
EXPO_PUBLIC_API_BIBLE_KEY=your_api_bible_key

# ESV API (required for ESV translation)
EXPO_PUBLIC_ESV_API_KEY=your_esv_api_key
```

### Getting API Keys

#### ESV API Key
1. Visit https://api.esv.org/
2. Create an account
3. Request an API key for non-commercial use
4. Copy the token to `EXPO_PUBLIC_ESV_API_KEY`

#### API.Bible Key
1. Visit https://scripture.api.bible/
2. Sign up for a free account
3. Generate an API key
4. Copy to `EXPO_PUBLIC_API_BIBLE_KEY`

## Usage Examples

### Fetching Available Versions

```typescript
import { fetchAvailableBibles } from '@/lib/bibleApiUnified';

const versions = await fetchAvailableBibles();
// Returns: [{ id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV', language: 'English', source: 'esv' }, ...]
```

### Fetching a Bible Passage

```typescript
import { fetchPassage } from '@/lib/bibleApiUnified';

// Single passage
const verses = await fetchPassage('ESV', 'John 3:16');

// Multiple verses
const verses = await fetchPassage('NIV', 'Genesis 1:1-5');
```

### Fetching Multiple Passages

```typescript
import { fetchMultiplePassages } from '@/lib/bibleApiUnified';

const verses = await fetchMultiplePassages('KJV', [
  'Psalm 23:1-6',
  'John 14:6',
  'Romans 8:28'
]);
```

### Getting Bible ID by Abbreviation

```typescript
import { getBibleIdByAbbreviation } from '@/lib/bibleApiUnified';

const bibleId = getBibleIdByAbbreviation('ESV', versions);
```

## Caching Strategy

The system implements intelligent caching:

1. **Version List Cache**
   - Cached for 7 days
   - Reduces API calls for version selection
   - Key: `bible_versions_unified`

2. **Passage Cache**
   - Cached for 7 days
   - Only for authenticated users
   - Key format: `{versionId}:{reference}`
   - Example: `ESV:John 3:16`

3. **Database Cache**
   - Permanent storage in `bible_verse_cache` table
   - Fallback when APIs are unavailable
   - Supports offline usage

## Error Handling

The unified API service provides robust error handling:

```typescript
try {
  const verses = await fetchPassage('ESV', 'John 3:16');
  if (verses.length === 0) {
    // No verses found
    console.log('Passage not available');
  }
} catch (error) {
  // All sources failed, including database
  console.error('Failed to fetch passage:', error);
}
```

## Response Format

All API functions return verses in a consistent format:

```typescript
type BibleVerse = {
  chapter: number;
  verse: number;
  text: string;
};

// Example response
[
  { chapter: 3, verse: 16, text: 'For God so loved the world...' }
]
```

## Supported Reference Formats

The parser supports these reference formats:

- `John 3:16` - Single verse
- `John 3:16-18` - Verse range
- `Genesis 1` - Entire chapter
- `Psalm 23:1-6` - Multiple verses
- `1 John 2:15` - Numbered books

## Rate Limiting Considerations

### ESV API
- Maximum 5,000 queries per day
- Maximum 1,000 requests per hour
- Maximum 60 requests per minute
- Implement caching to stay within limits

### Recommendations
1. Enable user authentication to use caching
2. Cache aggressively for popular passages
3. Use database fallback for offline support
4. Monitor API usage in production

## Compliance and Attribution

### ESV API Requirements
When using ESV text, you must:
1. Include copyright notice: "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers."
2. Link to www.esv.org
3. Not store more than 500 verses locally
4. Use for non-commercial purposes only

### API.Bible Requirements
1. Check specific version licensing
2. Include attribution as required by publishers
3. Implement FUMS tracking if available

## Troubleshooting

### ESV API Returns Empty Results
- Verify API key is valid
- Check rate limits
- Ensure reference format is correct
- Try fallback sources

### Rob Keplin API Fails
- Check network connectivity
- Verify book name spelling
- Try alternative spelling (e.g., "1 John" vs "1John")

### All APIs Fail
- System automatically falls back to database
- Check database connection
- Verify Genesis chapters are populated
- Review console logs for specific errors

## Migration from Old API

If upgrading from the old API:

1. Update imports:
```typescript
// Old
import { fetchPassage } from '@/lib/apiBible';

// New
import { fetchPassage } from '@/lib/bibleApiUnified';
```

2. Add ESV API key to `.env`
3. Test with different Bible versions
4. Monitor cache hit rates

## Future Enhancements

Potential improvements:

1. Add more API sources (Bolls Bible, getBible)
2. Implement request queuing for rate limiting
3. Add verse comparison across translations
4. Support for more languages
5. Audio Bible integration
6. Parallel translation display

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify environment variables are set
3. Test individual API sources
4. Review fallback chain behavior
5. Check database connectivity

## License Notes

- ESV: Copyright © Crossway (non-commercial use only)
- NIV: Copyright © Biblica (restricted availability)
- KJV: Public domain
- ASV: Public domain
- WEB: Public domain

Always verify licensing requirements for your specific use case.
