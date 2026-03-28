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
  Trash2,
  Lightbulb,
} from 'lucide-react-native';
import { emotionColors } from '../lib/constants';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';
import type { Entry } from '../types';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  喜び: Smile,
  不安: AlertTriangle,
  怒り: Zap,
  悲しみ: CloudRain,
  疲労: Battery,
  罪悪感: X,
  愛情: HeartHandshake,
};

interface EntryCardProps {
  entry: Entry;
  onDelete: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{entry.date}</Text>
        <Pressable onPress={() => onDelete(entry.id)} hitSlop={8}>
          <Trash2 size={18} color={colors.gray[400]} />
        </Pressable>
      </View>

      <View style={styles.emotionRow}>
        {entry.emotions.map((emotion) => {
          const IconComponent = iconMap[emotion];
          const colorSet = emotionColors[emotion];
          return (
            <View
              key={emotion}
              style={[
                styles.badge,
                { backgroundColor: colorSet?.bg || colors.gray[100], borderColor: colorSet?.border || colors.gray[200] },
              ]}
            >
              {IconComponent && <IconComponent size={12} color={colorSet?.text || colors.gray[700]} />}
              <Text style={[styles.badgeText, { color: colorSet?.text || colors.gray[700] }]}>
                {emotion}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.content}>{entry.content}</Text>

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
    </View>
  );
}

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
});
