# Full Bible Feature

This document describes the complete Bible feature added to the app.

## Overview

The app now includes a full Bible feature accessible via the bottom navigation bar. Users can:

- Browse all 66 books of the Bible (Old and New Testament)
- Navigate through chapters
- Search for specific verses or passages
- Switch between multiple Bible translations
- Read the complete text of any Bible book and chapter

## Features

### 1. Bible Navigation Tab

A new "Bible" tab has been added to the bottom navigation bar with a Book icon. This provides quick access to the full Bible from anywhere in the app.

### 2. Bible Version Selector

Users can choose from multiple Bible translations:

- **ESV** (English Standard Version)
- **NIV** (New International Version)
- **NLT** (New Living Translation)
- **KJV** (King James Version)
- **ASV** (American Standard Version)
- **WEB** (World English Bible)

The selected version preference is saved to the user's profile and persists across sessions.

### 3. Book Browser

The Bible Navigator modal provides:

- Searchable list of all 66 books
- Organized by Old and New Testament
- Chapter selection for each book
- Quick search by book name or abbreviation

Books included:

**Old Testament (39 books):**
Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1-2 Samuel, 1-2 Kings, 1-2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi

**New Testament (27 books):**
Matthew, Mark, Luke, John, Acts, Romans, 1-2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1-2 Thessalonians, 1-2 Timothy, Titus, Philemon, Hebrews, James, 1-2 Peter, 1-3 John, Jude, Revelation

### 4. Chapter Navigation

- Previous/Next chapter buttons
- Current chapter indicator
- Footer navigation for easy chapter switching
- Automatic chapter loading

### 5. Search Functionality

Users can search for specific passages using the search bar with formats like:

- `John 3:16` - Single verse
- `Genesis 1:1-5` - Verse range
- `Psalm 23` - Entire chapter
- `Romans 8` - Full chapter

### 6. Reading Experience

The Bible reader provides:

- Clean, readable text layout
- Verse numbers for easy reference
- Chapter headers with book name and version
- Responsive design for all screen sizes
- Smooth scrolling through long chapters

## User Interface

### Main Screen Components

1. **Header**
   - Bible title
   - Version selector button (shows current translation)

2. **Search Bar**
   - Prominent search field
   - Search icon
   - Placeholder with example format

3. **Navigation Bar**
   - Book selector (shows current book and chapter)
   - Chapter navigation (previous/next buttons)
   - Current chapter number display

4. **Reading Area**
   - Chapter title and version
   - Verses with numbers
   - Footer with chapter navigation

## Technical Implementation

### Files Structure

- `/app/(tabs)/bible.tsx` - Main Bible screen component
- `/app/(tabs)/_layout.tsx` - Updated tab navigation
- `/components/BibleVersionSelector.tsx` - Updated version selector
- `/components/BibleNavigator.tsx` - Book and chapter browser (existing)
- `/lib/bibleApiUnified.ts` - Bible API integration (existing)

### API Integration

The Bible feature uses the unified Bible API system (`bibleApiUnified.ts`) which:

- Fetches text from multiple Bible API sources
- Implements automatic fallback chains
- Caches verses to reduce API calls
- Supports offline access through database fallback

### Data Flow

1. User selects a book/chapter or searches
2. App fetches verses from Bible API
3. Verses are cached for future access
4. Content is displayed in readable format
5. User preferences are saved to database

### User Preferences

Bible preferences are stored in the `user_preferences` table:

- `preferred_bible_version` - Selected Bible translation
- Automatically synced across devices

## Usage Examples

### Browsing the Bible

1. Tap the "Bible" tab in bottom navigation
2. Tap "Browse Bible" or the book selector
3. Search for a book or scroll through the list
4. Select a book and chapter
5. Read the chapter content

### Searching for Verses

1. Enter a reference in the search bar (e.g., "John 3:16")
2. Press enter or search button
3. The passage will load and display

### Changing Bible Versions

1. Tap the version button in the header (shows current version)
2. Select your preferred translation from the list
3. The chapter will reload in the new version
4. Your preference is automatically saved

### Chapter Navigation

1. Use the arrow buttons to move between chapters
2. Tap previous to go back one chapter
3. Tap next to advance one chapter
4. Use footer navigation when at bottom of page

## Future Enhancements

Potential improvements:

1. **Bookmarks** - Save favorite verses and passages
2. **Highlights** - Mark and color-code important verses
3. **Notes** - Add personal study notes to verses
4. **Verse Sharing** - Share verses via social media or messaging
5. **Reading Plans** - Track Bible reading progress
6. **Cross-References** - Link to related passages
7. **Parallel Translations** - View multiple versions side-by-side
8. **Audio Bible** - Listen to Bible chapters
9. **Study Tools** - Commentaries and study notes
10. **Offline Mode** - Download books for offline reading

## Accessibility

The Bible feature includes:

- Clear, readable fonts with good contrast
- Touch-friendly navigation buttons
- Responsive design for all screen sizes
- Keyboard support for search
- Smooth scrolling for long content

## Performance

Optimizations implemented:

- Verse caching to reduce API calls
- Lazy loading of chapter content
- Efficient rendering of large chapters
- Database fallback for offline access
- Optimized search functionality

## Support

For issues or questions about the Bible feature:

1. Check that Bible API keys are configured in `.env`
2. Verify network connectivity for initial load
3. Review console logs for detailed error messages
4. Ensure user authentication is working for preferences

## Credits

Bible text provided by:

- ESV API (Crossway)
- Rob Keplin Bible API
- API.Bible
- Multiple open-source Bible APIs

See `BIBLE_API_GUIDE.md` for detailed API documentation and licensing information.
