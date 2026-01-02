import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check } from 'lucide-react-native';

type BibleVersion = {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  currentVersion: string;
  onSelectVersion: (version: string) => void;
  versions: BibleVersion[];
};

export default function BibleVersionSelector({ visible, onClose, currentVersion, onSelectVersion, versions }: Props) {
  const [selectedVersion, setSelectedVersion] = useState(currentVersion);

  const handleSelect = async (versionId: string) => {
    setSelectedVersion(versionId);
    onSelectVersion(versionId);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Bible Version</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.versionsList}>
            {versions.map((version) => (
              <TouchableOpacity
                key={version.id}
                style={styles.versionItem}
                onPress={() => handleSelect(version.id)}
              >
                <View style={styles.versionInfo}>
                  <View style={styles.versionHeader}>
                    <Text style={styles.versionAbbr}>{version.abbreviation}</Text>
                    {selectedVersion === version.id && (
                      <Check size={20} color="#10B981" />
                    )}
                  </View>
                  <Text style={styles.versionName}>{version.name}</Text>
                  <Text style={styles.versionDesc}>{version.language}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  versionsList: {
    padding: 16,
  },
  versionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  versionInfo: {
    flex: 1,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionAbbr: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  versionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  versionDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
