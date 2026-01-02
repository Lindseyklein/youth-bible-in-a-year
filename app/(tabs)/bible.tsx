import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Book, ChevronLeft, ChevronRight, Search, Settings } from 'lucide-react-native';
import { fetchPassage, fetchAvailableBibles, BibleVerse, BibleVersion } from '@/lib/bibleApiUnified';
import BibleVersionSelector from '@/components/BibleVersionSelector';
import BibleNavigator from '@/components/BibleNavigator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function BibleScreen() {
  const { user } = useAuth();
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('KJV');
  const [availableVersions, setAvailableVersions] = useState<BibleVersion[]>([]);
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [currentBook, setCurrentBook] = useState('Genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBibleVersions();
  }, []);

  useEffect(() => {
    if (availableVersions.length > 0) {
      loadUserPreferences();
    }
  }, [user, availableVersions]);

  useEffect(() => {
    if (availableVersions.length > 0 && currentBook) {
      loadChapter();
    }
  }, [currentBook, currentChapter, currentVersion, availableVersions]);

  const loadBibleVersions = async () => {
    try {
      const versions = await fetchAvailableBibles();
      if (versions.length > 0) {
        setAvailableVersions(versions);
      } else {
        setAvailableVersions([
          { id: 'KJV', name: 'King James Version', abbreviation: 'KJV', language: 'English' },
        ]);
      }
    } catch (error) {
      console.error('Error loading Bible versions:', error);
    }
  };

  const loadUserPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('preferred_bible_version')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.preferred_bible_version) {
      const { data: version } = await supabase
        .from('bible_versions')
        .select('abbreviation')
        .eq('id', data.preferred_bible_version)
        .maybeSingle();

      if (version) {
        setCurrentVersion(version.abbreviation);
      }
    }
  };

  const loadChapter = async () => {
    setLoading(true);
    try {
      const reference = `${currentBook} ${currentChapter}`;
      const fetchedVerses = await fetchPassage(currentVersion, reference);
      setVerses(fetchedVerses);
    } catch (error) {
      console.error('Error loading chapter:', error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = async (versionId: string) => {
    const version = availableVersions.find((v) => v.id === versionId);
    if (version) {
      setCurrentVersion(version.abbreviation);
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferred_bible_version: versionId,
          });
      }
    }
    setShowVersionSelector(false);
  };

  const handleNavigate = (book: string, chapter: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setShowNavigator(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const fetchedVerses = await fetchPassage(currentVersion, searchQuery.trim());
      if (fetchedVerses.length > 0) {
        setVerses(fetchedVerses);
        const match = searchQuery.match(/^([A-Za-z\s\d]+)\s+(\d+)/);
        if (match) {
          setCurrentBook(match[1].trim());
          setCurrentChapter(parseInt(match[2]));
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const goToNextChapter = () => {
    setCurrentChapter(currentChapter + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible</Text>
        <TouchableOpacity
          style={styles.versionButton}
          onPress={() => setShowVersionSelector(true)}
        >
          <Settings size={20} color="#2563EB" />
          <Text style={styles.versionButtonText}>{currentVersion}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search (e.g., John 3:16, Genesis 1)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={styles.bookSelector}
          onPress={() => setShowNavigator(true)}
        >
          <Book size={18} color="#2563EB" />
          <Text style={styles.bookText}>
            {currentBook} {currentChapter}
          </Text>
        </TouchableOpacity>

        <View style={styles.chapterNavigation}>
          <TouchableOpacity
            style={[styles.navButton, currentChapter === 1 && styles.navButtonDisabled]}
            onPress={goToPreviousChapter}
            disabled={currentChapter === 1}
          >
            <ChevronLeft size={20} color={currentChapter === 1 ? '#D1D5DB' : '#2563EB'} />
          </TouchableOpacity>

          <Text style={styles.chapterNumber}>{currentChapter}</Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextChapter}
          >
            <ChevronRight size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : verses.length > 0 ? (
        <ScrollView style={styles.versesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>
              {currentBook} {currentChapter}
            </Text>
            <Text style={styles.versionLabel}>{currentVersion}</Text>
          </View>

          {verses.map((verse, index) => (
            <View key={index} style={styles.verseRow}>
              <Text style={styles.verseNumber}>{verse.verse}</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </View>
          ))}

          <View style={styles.chapterNavFooter}>
            <TouchableOpacity
              style={[styles.footerNavButton, currentChapter === 1 && styles.footerNavButtonDisabled]}
              onPress={goToPreviousChapter}
              disabled={currentChapter === 1}
            >
              <ChevronLeft size={20} color={currentChapter === 1 ? '#D1D5DB' : '#2563EB'} />
              <Text style={[styles.footerNavText, currentChapter === 1 && styles.footerNavTextDisabled]}>
                Previous Chapter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerNavButton}
              onPress={goToNextChapter}
            >
              <Text style={styles.footerNavText}>Next Chapter</Text>
              <ChevronRight size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Book size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>Select a book to start reading</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => setShowNavigator(true)}
          >
            <Text style={styles.browseButtonText}>Browse Bible</Text>
          </TouchableOpacity>
        </View>
      )}

      <BibleVersionSelector
        visible={showVersionSelector}
        onClose={() => setShowVersionSelector(false)}
        onSelectVersion={handleVersionChange}
        currentVersion={currentVersion}
        versions={availableVersions}
      />

      <BibleNavigator
        visible={showNavigator}
        onClose={() => setShowNavigator(false)}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  versionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  versionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bookSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  bookText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  chapterNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
  },
  versesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chapterHeader: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  versionLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  verseRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    minWidth: 28,
    paddingTop: 4,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
  },
  chapterNavFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  footerNavButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  footerNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  footerNavTextDisabled: {
    color: '#D1D5DB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
