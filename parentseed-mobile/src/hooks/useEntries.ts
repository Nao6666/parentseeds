import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { generateAdvice } from '../lib/api';
import { getJstDateString } from '../lib/dateUtils';
import { MAX_IMAGES_PER_ENTRY } from '../lib/constants';
import type { Entry, EmotionType } from '../types';

/** Upload images to Supabase Storage and return public URLs. */
async function uploadImages(userId: string, imageUris: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const uri of imageUris) {
    try {
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error } = await supabase.storage
        .from('entry-images')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });

      if (error) {
        console.warn('Image upload failed:', error.message);
        continue;
      }

      const { data: urlData } = supabase.storage.from('entry-images').getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
      }
    } catch (err) {
      console.warn('Image upload error:', err);
    }
  }

  return urls;
}

/** Fetch entries query shared between initial load and refresh. */
async function fetchEntries(userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }

  return (data as Entry[]) ?? [];
}

export function useEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchEntries(userId)
      .then(setEntries)
      .catch(() => Alert.alert('エラー', '記録の取得に失敗しました。'))
      .finally(() => setLoading(false));
  }, [userId]);

  const saveEntry = useCallback(
    async (
      selectedEmotions: EmotionType[],
      content: string,
      images: string[] = [],
    ): Promise<boolean> => {
      if (!userId || !content.trim() || selectedEmotions.length === 0) return false;

      try {
        const limitedImages = images.slice(0, MAX_IMAGES_PER_ENTRY);
        const imageUrls = limitedImages.length > 0
          ? await uploadImages(userId, limitedImages)
          : [];

        const aiAdvice = await generateAdvice(selectedEmotions, content);

        const newEntry: Record<string, unknown> = {
          user_id: userId,
          date: getJstDateString(),
          emotions: [...selectedEmotions],
          content,
          aiAdvice,
          ...(imageUrls.length > 0 && { image_urls: imageUrls }),
        };

        const { data, error } = await supabase.from('entries').insert([newEntry]).select();

        if (error) {
          Alert.alert('エラー', '記録の保存に失敗しました。');
          return false;
        }

        if (data?.[0]) {
          setEntries((prev) => [data[0] as Entry, ...prev]);
          Alert.alert('完了', '記録が正常に保存されました。');
          return true;
        }
        return false;
      } catch (error) {
        console.error('saveEntry failed:', error);
        Alert.alert('エラー', '記録の保存中にエラーが発生しました。');
        return false;
      }
    },
    [userId],
  );

  const deleteEntry = useCallback(
    (entryId: string) => {
      Alert.alert('確認', 'この記録を削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('entries').delete().eq('id', entryId);
              if (error) {
                Alert.alert('エラー', '記録の削除に失敗しました。');
              } else {
                setEntries((prev) => prev.filter((e) => e.id !== entryId));
              }
            } catch {
              Alert.alert('エラー', '記録の削除中にエラーが発生しました。');
            }
          },
        },
      ]);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchEntries(userId);
      setEntries(data);
    } catch {
      // Silent fail on refresh — data shown is still valid
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { entries, loading, saveEntry, deleteEntry, refresh };
}
