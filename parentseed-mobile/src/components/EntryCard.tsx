import React, { useState, memo, useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Modal, Dimensions } from 'react-native';
import { Trash2, Lightbulb, X } from 'lucide-react-native';
import EmotionIcon from './EmotionIcon';
import { getNormalColors } from '../lib/constants';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';
import type { Entry } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EntryCardProps {
  entry: Entry;
  onDelete: (id: string) => void;
}

function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const openImage = useCallback((url: string) => setViewingImage(url), []);
  const closeImage = useCallback(() => setViewingImage(null), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{entry.date}</Text>
        <Pressable
          onPress={() => onDelete(entry.id)}
          hitSlop={8}
          accessibilityLabel="記録を削除"
        >
          <Trash2 size={18} color={colors.gray[400]} />
        </Pressable>
      </View>

      <View style={styles.emotionRow}>
        {entry.emotions.map((emotion) => {
          const colorSet = getNormalColors(emotion );
          return (
            <View
              key={emotion}
              style={[styles.badge, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}
            >
              <EmotionIcon emotion={emotion} size={12} color={colorSet.text} />
              <Text style={[styles.badgeText, { color: colorSet.text }]}>{emotion}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.content}>{entry.content}</Text>

      {entry.image_urls && entry.image_urls.length > 0 && (
        <View style={styles.imageRow}>
          {entry.image_urls.map((url) => (
            <Pressable key={url} onPress={() => openImage(url)}>
              <Image source={{ uri: url }} style={styles.imageThumb} />
            </Pressable>
          ))}
        </View>
      )}

      {entry.aiAdvice && (
        <View style={styles.adviceBox}>
          <View style={styles.adviceHeader}>
            <Lightbulb size={16} color={colors.blue[500]} />
            <View style={styles.adviceTextContainer}>
              <Text style={styles.adviceTitle}>AIからのアドバイス</Text>
              <Text style={styles.adviceContent}>{entry.aiAdvice}</Text>
            </View>
          </View>
        </View>
      )}

      <Modal visible={viewingImage !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.closeButton} onPress={closeImage} accessibilityLabel="閉じる">
            <X size={28} color={colors.white} />
          </Pressable>
          {viewingImage && (
            <Image source={{ uri: viewingImage }} style={styles.fullImage} resizeMode="contain" />
          )}
          <Pressable style={styles.modalBackground} onPress={closeImage} />
        </View>
      </Modal>
    </View>
  );
}

export default memo(EntryCard);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  content: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    lineHeight: 22,
  },
  imageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageThumb: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  adviceBox: {
    backgroundColor: colors.blue[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue[400],
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  adviceTextContainer: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.blue[800],
    marginBottom: 4,
  },
  adviceContent: {
    fontSize: fontSize.sm,
    color: colors.blue[700],
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
});
