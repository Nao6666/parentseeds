import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { emotions, emotionEmoji, emotionColors, emotionColorsSelected } from '../lib/constants';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

interface EmotionSelectorProps {
  selectedEmotions: string[];
  onToggle: (emotion: string) => void;
}

export default function EmotionSelector({ selectedEmotions, onToggle }: EmotionSelectorProps) {
  return (
    <View>
      <View style={styles.grid}>
        {emotions.map((emotion) => {
          const isSelected = selectedEmotions.includes(emotion);
          const colorSet = isSelected ? emotionColorsSelected[emotion] : emotionColors[emotion];

          return (
            <Pressable
              key={emotion}
              style={[
                styles.emotionButton,
                {
                  backgroundColor: colorSet.bg,
                  borderColor: colorSet.border,
                },
                isSelected && styles.emotionButtonSelected,
              ]}
              onPress={() => onToggle(emotion)}
            >
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Check size={10} color={colors.green[600]} />
                </View>
              )}
              <Text style={styles.emoji}>{emotionEmoji[emotion]}</Text>
              <Text style={[styles.emotionLabel, { color: colorSet.text }]}>{emotion}</Text>
            </Pressable>
          );
        })}
      </View>
      {selectedEmotions.length > 0 && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>
            選択中: {selectedEmotions.map((e) => `${emotionEmoji[e]}${e}`).join('、')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emotionButton: {
    flexBasis: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    position: 'relative',
  },
  emotionButtonSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    padding: 2,
  },
  emoji: {
    fontSize: 24,
  },
  emotionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.blue[50],
    borderRadius: borderRadius.lg,
  },
  selectedText: {
    fontSize: fontSize.sm,
    color: colors.blue[700],
  },
});
