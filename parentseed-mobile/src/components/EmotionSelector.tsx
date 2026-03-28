import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Smile,
  AlertTriangle,
  Zap,
  CloudRain,
  Battery,
  X,
  HeartHandshake,
  Check,
} from 'lucide-react-native';
import { emotions, emotionColors, emotionColorsSelected } from '../lib/constants';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  喜び: Smile,
  不安: AlertTriangle,
  怒り: Zap,
  悲しみ: CloudRain,
  疲労: Battery,
  罪悪感: X,
  愛情: HeartHandshake,
};

interface EmotionSelectorProps {
  selectedEmotions: string[];
  onToggle: (emotion: string) => void;
}

export default function EmotionSelector({ selectedEmotions, onToggle }: EmotionSelectorProps) {
  return (
    <View>
      <View style={styles.grid}>
        {emotions.map((emotion) => {
          const IconComponent = iconMap[emotion];
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
              {IconComponent && <IconComponent size={20} color={colorSet.text} />}
              <Text style={[styles.emotionLabel, { color: colorSet.text }]}>{emotion}</Text>
            </Pressable>
          );
        })}
      </View>
      {selectedEmotions.length > 0 && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedText}>選択中: {selectedEmotions.join('、')}</Text>
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
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
    transform: [{ scale: 1.02 }],
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    padding: 2,
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
