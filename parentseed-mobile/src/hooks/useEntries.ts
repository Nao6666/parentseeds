import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { generateAdvice } from '../lib/api';
import { getJstDateString } from '../lib/dateUtils';
import type { Entry } from '../types';

async function uploadImages(userId: string, images: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const uri of images) {
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error } = await supabase.storage
      .from('entry-images')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Image upload error:', error);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('entry-images')
      .getPublicUrl(fileName);

    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl);
    }
  }

  return urls;
}

export function useEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch entries on mount and when userId changes
  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching entries:', error);
          Alert.alert('エラー', '記録の取得に失敗しました。');
        } else {
          setEntries(data || []);
        }
        setLoading(false);
      });
  }, [userId]);

  const saveEntry = useCallback(
    async (selectedEmotions: string[], content: string, images: string[] = []): Promise<boolean> => {
      if (!userId || !content.trim() || selectedEmotions.length === 0) return false;

      try {
        // Upload images if any
        let imageUrls: string[] = [];
        if (images.length > 0) {
          imageUrls = await uploadImages(userId, images);
        }

        const aiAdvice = await generateAdvice(selectedEmotions, content);
        const newEntry: Record<string, unknown> = {
          user_id: userId,
          date: getJstDateString(),
          emotions: [...selectedEmotions],
          content,
          aiAdvice,
        };

        if (imageUrls.length > 0) {
          newEntry.image_urls = imageUrls;
        }

        const { data, error } = await supabase.from('entries').insert([newEntry]).select();

        if (error) {
          console.error('Error saving entry:', error);
          Alert.alert('エラー', '記録の保存に失敗しました。');
          return false;
        }

        if (data && data[0]) {
          setEntries((prev) => [data[0], ...prev]);
          Alert.alert('完了', '記録が正常に保存されました。');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in saveEntry:', error);
        Alert.alert('エラー', '記録の保存中にエラーが発生しました。');
        return false;
      }
    },
    [userId]
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      Alert.alert('確認', 'この記録を削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('entries').delete().eq('id', entryId);
              if (error) {
                console.error('Error deleting entry:', error);
                Alert.alert('エラー', '記録の削除に失敗しました。');
              } else {
                setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
                Alert.alert('完了', '記録が正常に削除されました。');
              }
            } catch (error) {
              console.error('Error in deleteEntry:', error);
              Alert.alert('エラー', '記録の削除中にエラーが発生しました。');
            }
          },
        },
      ]);
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setEntries(data || []);
    }
    setLoading(false);
  }, [userId]);

  return { entries, loading, saveEntry, deleteEntry, refresh };
}
