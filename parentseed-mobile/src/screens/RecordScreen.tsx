import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Image,
} from 'react-native';
import { Heart, Camera, ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [images, setImages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 3));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!currentEntry.trim() || selectedEmotions.length === 0) return;
    Keyboard.dismiss();

    setIsGeneratingAdvice(true);
    const success = await saveEntry(selectedEmotions, currentEntry, images);
    if (success) {
      setCurrentEntry('');
      setSelectedEmotions([]);
      setImages([]);
    }
    setIsGeneratingAdvice(false);
  };

  const handleTextFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const canSave = currentEntry.trim().length > 0 && selectedEmotions.length > 0 && !isGeneratingAdvice;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
                onFocus={handleTextFocus}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* 画像添付 */}
            <View>
              <Text style={styles.label}>写真を添付（最大3枚）</Text>
              <View style={styles.imageActions}>
                <Pressable
                  style={[styles.imageButton, images.length >= 3 && styles.imageButtonDisabled]}
                  onPress={pickImage}
                  disabled={images.length >= 3}
                >
                  <ImageIcon size={18} color={images.length >= 3 ? colors.gray[300] : colors.secondary} />
                  <Text style={[styles.imageButtonText, images.length >= 3 && styles.imageButtonTextDisabled]}>
                    アルバム
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.imageButton, images.length >= 3 && styles.imageButtonDisabled]}
                  onPress={takePhoto}
                  disabled={images.length >= 3}
                >
                  <Camera size={18} color={images.length >= 3 ? colors.gray[300] : colors.secondary} />
                  <Text style={[styles.imageButtonText, images.length >= 3 && styles.imageButtonTextDisabled]}>
                    カメラ
                  </Text>
                </Pressable>
              </View>

              {images.length > 0 && (
                <View style={styles.imageGrid}>
                  {images.map((uri, index) => (
                    <View key={uri} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.imagePreview} />
                      <Pressable style={styles.removeImage} onPress={() => removeImage(index)}>
                        <X size={14} color={colors.white} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
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
  imageActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  imageButtonDisabled: {
    opacity: 0.4,
  },
  imageButtonText: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '500',
  },
  imageButtonTextDisabled: {
    color: colors.gray[300],
  },
  imageGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  removeImage: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.red[500],
    borderRadius: borderRadius.full,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
