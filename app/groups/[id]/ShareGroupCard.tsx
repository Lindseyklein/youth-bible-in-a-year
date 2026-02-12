import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { Share2, Hash, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

type ShareGroupCardProps = {
  groupId: string;
  groupName: string;
  joinCode: string;
};

export default function ShareGroupCard({ groupId, groupName, joinCode }: ShareGroupCardProps) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Join my Bible study group "${groupName}" on Youth Bible In A Year!\n\nJoin code: ${(joinCode || '').toUpperCase()}\n\nEnter this code in the Groups tab to join. No link or email required.`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(joinCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareMessage,
        title: `Join ${groupName}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Share2 size={20} color="#2563EB" />
        <Text style={styles.title}>Share Group</Text>
      </View>
      <Text style={styles.description}>Share the join code or link so others can join your group.</Text>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{joinCode.toUpperCase()}</Text>
        <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
          <Copy size={18} color="#2563EB" />
          <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Share2 size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  description: { fontSize: 14, color: '#3B82F6', marginBottom: 16, lineHeight: 20 },
  codeBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 2, borderColor: '#2563EB', borderStyle: 'dashed' },
  code: { fontSize: 24, fontWeight: '800', color: '#1E40AF', letterSpacing: 4, fontFamily: 'monospace' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copyText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563EB', padding: 14, borderRadius: 12 },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
