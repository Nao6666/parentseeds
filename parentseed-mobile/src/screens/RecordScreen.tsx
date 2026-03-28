import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import EmotionSelector from '../components/EmotionSelector';
import { useEntries } from '../hooks/useEntries';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

export default function RecordScreen() {
  const { user } = useSupabaseAuth();
  const { saveEntry } = useEntries(user?.id);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSave = async () => {
    if (!currentEntry.trim() || selectedEmotions.length === 0) return;

    setIsGeneratingAdvice(true);
    const success = await saveEntry(selectedEmotions, currentEntry);
    if (success) {
      setCurrentEntry('');
      setSelectedEmotions([]);
    }
    setIsGeneratingAdvice(false);
  };

  const canSave = currentEntry.trim().length > 0 && selectedEmotions.length > 0 && !isGeneratingAdvice;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Heart size={20} color={colors.primary} />
            <Text style={styles.title}>今日の気持ちを記録</Text>
          </View>
          <Text style={styles.subtitle}>感じた感情を選んでタップしてください</Text>
        </View>

        <View style={styles.cardBody}>
          <View>
            <Text style={styles.label}>今の気持ちは？</Text>
            <EmotionSelector selectedEmotions={selectedEmotions} onToggle={toggleEmotion} />
          </View>

          <View>
            <Text style={styles.label}>今日の出来事や気持ち</Text>
            <TextInput
              style={styles.textArea}
              placeholder="例：子どもが初めて笑ってくれて嬉しかった、夜泣きが続いて疲れた、など..."
              placeholderTextColor={colors.gray[400]}
              value={currentEntry}
              onChangeText={setCurrentEntry}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[styles.saveButton, !canSave && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            {isGeneratingAdvice ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.saveText}>AIがアドバイスを生成中...</Text>
              </View>
            ) : (
              <Text style={styles.saveText}>記録を保存</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: 4,
  },
  cardBody: {
    padding: spacing.lg,
    gap: spacing['2xl'],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.gray[900],
    minHeight: 120,
  },
  saveButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
