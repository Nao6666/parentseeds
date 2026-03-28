import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { colors } from '../theme/colors';
import { borderRadius, fontSize, spacing } from '../theme/spacing';

export default function DeleteAccountScreen() {
  const { deleteAccount, loading } = useSupabaseAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'アカウント削除',
      'アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。本当に削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const result = await deleteAccount();
            if (result) {
              Alert.alert('エラー', 'アカウントの削除に失敗しました。');
            }
            setIsDeleting(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>アカウント削除</Text>
        <Text style={styles.description}>
          アカウントを削除すると、以下のデータがすべて削除されます：
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>- すべての感情記録</Text>
          <Text style={styles.listItem}>- AIアドバイス履歴</Text>
          <Text style={styles.listItem}>- チャット履歴</Text>
          <Text style={styles.listItem}>- アカウント情報</Text>
        </View>
        <Text style={styles.warning}>この操作は取り消せません。</Text>

        <Pressable
          style={[styles.deleteButton, (isDeleting || loading) && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={isDeleting || loading}
        >
          {isDeleting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.deleteText}>アカウントを削除する</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['3xl'],
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.red[700],
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    lineHeight: 22,
  },
  list: {
    gap: spacing.xs,
  },
  listItem: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  warning: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.red[600],
    textAlign: 'center',
  },
  deleteButton: {
    height: 48,
    backgroundColor: colors.red[600],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});
