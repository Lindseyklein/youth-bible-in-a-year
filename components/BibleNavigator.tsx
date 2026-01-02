import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Book, ChevronDown, Search, X } from 'lucide-react-native';

type BibleBook = {
  name: string;
  abbr: string;
  chapters: number;
  testament: 'Old' | 'New';
};

const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: 'Genesis', abbr: 'Gen', chapters: 50, testament: 'Old' },
  { name: 'Exodus', abbr: 'Exod', chapters: 40, testament: 'Old' },
  { name: 'Leviticus', abbr: 'Lev', chapters: 27, testament: 'Old' },
  { name: 'Numbers', abbr: 'Num', chapters: 36, testament: 'Old' },
  { name: 'Deuteronomy', abbr: 'Deut', chapters: 34, testament: 'Old' },
  { name: 'Joshua', abbr: 'Josh', chapters: 24, testament: 'Old' },
  { name: 'Judges', abbr: 'Judg', chapters: 21, testament: 'Old' },
  { name: 'Ruth', abbr: 'Ruth', chapters: 4, testament: 'Old' },
  { name: '1 Samuel', abbr: '1Sam', chapters: 31, testament: 'Old' },
  { name: '2 Samuel', abbr: '2Sam', chapters: 24, testament: 'Old' },
  { name: '1 Kings', abbr: '1Kgs', chapters: 22, testament: 'Old' },
  { name: '2 Kings', abbr: '2Kgs', chapters: 25, testament: 'Old' },
  { name: '1 Chronicles', abbr: '1Chr', chapters: 29, testament: 'Old' },
  { name: '2 Chronicles', abbr: '2Chr', chapters: 36, testament: 'Old' },
  { name: 'Ezra', abbr: 'Ezra', chapters: 10, testament: 'Old' },
  { name: 'Nehemiah', abbr: 'Neh', chapters: 13, testament: 'Old' },
  { name: 'Esther', abbr: 'Esth', chapters: 10, testament: 'Old' },
  { name: 'Job', abbr: 'Job', chapters: 42, testament: 'Old' },
  { name: 'Psalms', abbr: 'Ps', chapters: 150, testament: 'Old' },
  { name: 'Proverbs', abbr: 'Prov', chapters: 31, testament: 'Old' },
  { name: 'Ecclesiastes', abbr: 'Eccl', chapters: 12, testament: 'Old' },
  { name: 'Song of Solomon', abbr: 'Song', chapters: 8, testament: 'Old' },
  { name: 'Isaiah', abbr: 'Isa', chapters: 66, testament: 'Old' },
  { name: 'Jeremiah', abbr: 'Jer', chapters: 52, testament: 'Old' },
  { name: 'Lamentations', abbr: 'Lam', chapters: 5, testament: 'Old' },
  { name: 'Ezekiel', abbr: 'Ezek', chapters: 48, testament: 'Old' },
  { name: 'Daniel', abbr: 'Dan', chapters: 12, testament: 'Old' },
  { name: 'Hosea', abbr: 'Hos', chapters: 14, testament: 'Old' },
  { name: 'Joel', abbr: 'Joel', chapters: 3, testament: 'Old' },
  { name: 'Amos', abbr: 'Amos', chapters: 9, testament: 'Old' },
  { name: 'Obadiah', abbr: 'Obad', chapters: 1, testament: 'Old' },
  { name: 'Jonah', abbr: 'Jonah', chapters: 4, testament: 'Old' },
  { name: 'Micah', abbr: 'Mic', chapters: 7, testament: 'Old' },
  { name: 'Nahum', abbr: 'Nah', chapters: 3, testament: 'Old' },
  { name: 'Habakkuk', abbr: 'Hab', chapters: 3, testament: 'Old' },
  { name: 'Zephaniah', abbr: 'Zeph', chapters: 3, testament: 'Old' },
  { name: 'Haggai', abbr: 'Hag', chapters: 2, testament: 'Old' },
  { name: 'Zechariah', abbr: 'Zech', chapters: 14, testament: 'Old' },
  { name: 'Malachi', abbr: 'Mal', chapters: 4, testament: 'Old' },
  // New Testament
  { name: 'Matthew', abbr: 'Matt', chapters: 28, testament: 'New' },
  { name: 'Mark', abbr: 'Mark', chapters: 16, testament: 'New' },
  { name: 'Luke', abbr: 'Luke', chapters: 24, testament: 'New' },
  { name: 'John', abbr: 'John', chapters: 21, testament: 'New' },
  { name: 'Acts', abbr: 'Acts', chapters: 28, testament: 'New' },
  { name: 'Romans', abbr: 'Rom', chapters: 16, testament: 'New' },
  { name: '1 Corinthians', abbr: '1Cor', chapters: 16, testament: 'New' },
  { name: '2 Corinthians', abbr: '2Cor', chapters: 13, testament: 'New' },
  { name: 'Galatians', abbr: 'Gal', chapters: 6, testament: 'New' },
  { name: 'Ephesians', abbr: 'Eph', chapters: 6, testament: 'New' },
  { name: 'Philippians', abbr: 'Phil', chapters: 4, testament: 'New' },
  { name: 'Colossians', abbr: 'Col', chapters: 4, testament: 'New' },
  { name: '1 Thessalonians', abbr: '1Thess', chapters: 5, testament: 'New' },
  { name: '2 Thessalonians', abbr: '2Thess', chapters: 3, testament: 'New' },
  { name: '1 Timothy', abbr: '1Tim', chapters: 6, testament: 'New' },
  { name: '2 Timothy', abbr: '2Tim', chapters: 4, testament: 'New' },
  { name: 'Titus', abbr: 'Titus', chapters: 3, testament: 'New' },
  { name: 'Philemon', abbr: 'Phlm', chapters: 1, testament: 'New' },
  { name: 'Hebrews', abbr: 'Heb', chapters: 13, testament: 'New' },
  { name: 'James', abbr: 'Jas', chapters: 5, testament: 'New' },
  { name: '1 Peter', abbr: '1Pet', chapters: 5, testament: 'New' },
  { name: '2 Peter', abbr: '2Pet', chapters: 3, testament: 'New' },
  { name: '1 John', abbr: '1John', chapters: 5, testament: 'New' },
  { name: '2 John', abbr: '2John', chapters: 1, testament: 'New' },
  { name: '3 John', abbr: '3John', chapters: 1, testament: 'New' },
  { name: 'Jude', abbr: 'Jude', chapters: 1, testament: 'New' },
  { name: 'Revelation', abbr: 'Rev', chapters: 22, testament: 'New' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (book: string, chapter: number) => void;
};

export default function BibleNavigator({ visible, onClose, onNavigate }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>(BIBLE_BOOKS);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredBooks(
        BIBLE_BOOKS.filter(
          (book) =>
            book.name.toLowerCase().includes(query) ||
            book.abbr.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredBooks(BIBLE_BOOKS);
    }
  }, [searchQuery]);

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
  };

  const handleChapterSelect = (chapter: number) => {
    if (selectedBook) {
      onNavigate(selectedBook.name, chapter);
      onClose();
      setSelectedBook(null);
      setSearchQuery('');
    }
  };

  const oldTestamentBooks = filteredBooks.filter((b) => b.testament === 'Old');
  const newTestamentBooks = filteredBooks.filter((b) => b.testament === 'New');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {selectedBook ? selectedBook.name : 'Select Book'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {!selectedBook && (
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search books..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}

          <ScrollView style={styles.content}>
            {selectedBook ? (
              <View style={styles.chaptersContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedBook(null)}
                >
                  <Text style={styles.backButtonText}>← Back to Books</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Select Chapter</Text>
                <View style={styles.chaptersGrid}>
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
                    (chapter) => (
                      <TouchableOpacity
                        key={chapter}
                        style={styles.chapterButton}
                        onPress={() => handleChapterSelect(chapter)}
                      >
                        <Text style={styles.chapterButtonText}>{chapter}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            ) : (
              <>
                {oldTestamentBooks.length > 0 && (
                  <View style={styles.testamentSection}>
                    <Text style={styles.testamentTitle}>Old Testament</Text>
                    {oldTestamentBooks.map((book) => (
                      <TouchableOpacity
                        key={book.abbr}
                        style={styles.bookItem}
                        onPress={() => handleBookSelect(book)}
                      >
                        <View style={styles.bookInfo}>
                          <Book size={20} color="#2563EB" />
                          <Text style={styles.bookName}>{book.name}</Text>
                        </View>
                        <View style={styles.bookMeta}>
                          <Text style={styles.bookChapters}>{book.chapters} chapters</Text>
                          <ChevronDown
                            size={20}
                            color="#9CA3AF"
                            style={{ transform: [{ rotate: '-90deg' }] }}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {newTestamentBooks.length > 0 && (
                  <View style={styles.testamentSection}>
                    <Text style={styles.testamentTitle}>New Testament</Text>
                    {newTestamentBooks.map((book) => (
                      <TouchableOpacity
                        key={book.abbr}
                        style={styles.bookItem}
                        onPress={() => handleBookSelect(book)}
                      >
                        <View style={styles.bookInfo}>
                          <Book size={20} color="#2563EB" />
                          <Text style={styles.bookName}>{book.name}</Text>
                        </View>
                        <View style={styles.bookMeta}>
                          <Text style={styles.bookChapters}>{book.chapters} chapters</Text>
                          <ChevronDown
                            size={20}
                            color="#9CA3AF"
                            style={{ transform: [{ rotate: '-90deg' }] }}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  testamentSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  testamentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookChapters: {
    fontSize: 13,
    color: '#6B7280',
  },
  chaptersContainer: {
    padding: 16,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chapterButton: {
    width: 60,
    height: 60,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
});
