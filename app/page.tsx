"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Heart,
  Brain,
  TrendingUp,
  Calendar,
  MessageCircle,
  Lightbulb,
  Video,
  Phone,
  MessageSquare,
  AlertTriangle,
  Trash2,
  Smile,
  Zap,
  CloudRain,
  Battery,
  X,
  HeartHandshake,
  Send,
  Bot,
  User,
  Check,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LoginForm from "@/components/LoginForm";
import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/components/Logo";

const emotionColors = {
  喜び: "bg-yellow-100 text-yellow-800 border-yellow-200",
  不安: "bg-blue-100 text-blue-800 border-blue-200",
  怒り: "bg-red-100 text-red-800 border-red-200",
  悲しみ: "bg-gray-100 text-gray-800 border-gray-200",
  疲労: "bg-purple-100 text-purple-800 border-purple-200",
  罪悪感: "bg-orange-100 text-orange-800 border-orange-200",
  愛情: "bg-pink-100 text-pink-800 border-pink-200",
}

const emotionColorsSelected = {
  喜び: "bg-yellow-500 text-white border-yellow-600 shadow-lg scale-105",
  不安: "bg-blue-500 text-white border-blue-600 shadow-lg scale-105",
  怒り: "bg-red-500 text-white border-red-600 shadow-lg scale-105",
  悲しみ: "bg-gray-500 text-white border-gray-600 shadow-lg scale-105",
  疲労: "bg-purple-500 text-white border-purple-600 shadow-lg scale-105",
  罪悪感: "bg-orange-500 text-white border-orange-600 shadow-lg scale-105",
  愛情: "bg-pink-500 text-white border-pink-600 shadow-lg scale-105",
}

const emotionIcons = {
  喜び: Smile,
  不安: AlertTriangle,
  怒り: Zap,
  悲しみ: CloudRain,
  疲労: Battery,
  罪悪感: X,
  愛情: HeartHandshake,
}

const emotionChartColors = {
  喜び: "#fbbf24",
  不安: "#3b82f6",
  怒り: "#ef4444",
  悲しみ: "#6b7280",
  疲労: "#8b5cf6",
  罪悪感: "#f97316",
  愛情: "#ec4899",
}

const emotions = ["喜び", "不安", "怒り", "悲しみ", "疲労", "罪悪感", "愛情"]

// サンプルの時系列データを生成 → entriesからグラフ用データを生成
const periodToDays = (period: string) => {
  switch (period) {
    case "1week": return 7;
    case "2weeks": return 14;
    case "1month": return 30;
    case "3months": return 90;
    default: return 14;
  }
};
// JSTでYYYY-MM-DDを返す関数
const getJstDateString = (date = new Date()) => {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
};
const generateTimeSeriesDataFromEntries = (entries: any[], period: string) => {
  const daysCount = periodToDays(period);
  const today = new Date();
  const days = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (daysCount - 1 - i));
    return getJstDateString(d); // JST
  });
  return days.map((dayStr) => {
    // この日付のentries
    const dayEntries = entries.filter(e => e.date === dayStr);
    // 各感情の出現回数
    const emotionCounts: Record<string, number> = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = dayEntries.reduce((acc, e) => acc + (e.emotions?.includes(emotion) ? 1 : 0), 0);
    });
    // 表示用日付
    const dateObj = new Date(dayStr);
    const dateStr = dateObj.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
    return {
      date: dateStr,
      fullDate: dayStr,
      ...emotionCounts,
    };
  });
};

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ParentSeedApp() {
  const { user, loading, signOut } = useSupabaseAuth();
  const [currentEntry, setCurrentEntry] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [chartPeriod, setChartPeriod] = useState("2weeks")
  const [chartType, setChartType] = useState("line")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "こんにちは！私はParentSeedのAIアシスタントです。育児中の感情や悩みについて、いつでもお気軽にご相談ください。どのようなことでお困りですか？",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const { toast } = useToast();

  // ユーザーごとのentriesを取得
  useEffect(() => {
    if (!user) return;
    setEntriesLoading(true);
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setEntries(data || []);
        setEntriesLoading(false);
      });
  }, [user]);

  const timeSeriesData = generateTimeSeriesDataFromEntries(entries, chartPeriod) || [];
  const safeTimeSeriesData = Array.isArray(timeSeriesData) ? timeSeriesData : [];

  // 統計値もentriesから計算
  const calcStatsFromEntries = (entries: any[]) => {
    // 今週（日曜～土曜）分のentries
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartStr = getJstDateString(weekStart);
    const nowStr = getJstDateString(now);
    const weekEntries = entries.filter(e => e.date >= weekStartStr && e.date <= nowStr);
    // 感情ごとの合計
    const emotionTotals: Record<string, number> = {};
    emotions.forEach(emotion => {
      emotionTotals[emotion] = weekEntries.reduce((acc, e) => acc + (e.emotions?.includes(emotion) ? 1 : 0), 0);
    });
    const total = Object.values(emotionTotals).reduce((a, b) => a + b, 0) || 1;
    // 仮の計算例
    return {
      ストレスレベル: Math.round((emotionTotals["不安"] + emotionTotals["怒り"] + emotionTotals["疲労"] + emotionTotals["罪悪感"] + emotionTotals["悲しみ"]) / total * 100),
      ポジティブ度: Math.round((emotionTotals["喜び"] + emotionTotals["愛情"]) / total * 100),
      emotionTotals,
    };
  };
  const emotionStats = calcStatsFromEntries(entries);

  // 連続記録日数をentriesから計算
  const calcStreak = (entries: any[]) => {
    if (!entries.length) return 0;
    // 日付をJSTでYYYY-MM-DD形式でユニークにソート
    const days = Array.from(new Set(entries.map(e => e.date))).sort();
    let streak = 1;
    let maxStreak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    return maxStreak;
  };
  const streak = calcStreak(entries);

  // 感情コントロール力・自己理解度（例: ポジティブ度や記録頻度から算出）
  const controlPower = emotionStats.ポジティブ度; // 仮: ポジティブ度を流用
  const selfUnderstanding = Math.min(100, entries.length * 10); // 仮: 記録数×10（最大100）

  // 今週のハイライト（今週の最新記録の内容）
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = getJstDateString(weekStart);
  const nowStr = getJstDateString(now);
  const weekEntries = entries.filter(e => e.date >= weekStartStr && e.date <= nowStr);
  const highlight = weekEntries.length > 0 ? weekEntries[0].content : "今週の記録がありません。";

  // 今週のハイライト（今週の記録のサマリ）
  const getWeeklySummary = (weekEntries: any[]) => {
    if (weekEntries.length === 0) return "今週の記録がありません。";
    // 感情の出現回数を集計
    const emotionCount: Record<string, number> = {};
    weekEntries.forEach(e => {
      e.emotions?.forEach((emo: string) => {
        emotionCount[emo] = (emotionCount[emo] || 0) + 1;
      });
    });
    // 最も多かった感情
    const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    // 代表的な一文（最新の記録内容）
    const latestContent = weekEntries[0]?.content || "";
    return `今週は${weekEntries.length}件の記録があり、特に「${topEmotion}」の気持ちが多く見られました。例：「${latestContent.slice(0, 30)}...」`;
  };
  const weeklySummary = getWeeklySummary(weekEntries);

  // ローディング中はローディング表示
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  // 未ログインならログインフォーム
  if (!user) {
    return <LoginForm />;
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const generateAIAdvice = async (emotions: string[], content: string): Promise<string> => {
    try {
      const response = await fetch("/api/generate-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotions,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate advice")
      }

      const data = await response.json()
      return data.advice
    } catch (error) {
      console.error("Error generating advice:", error)
      // フォールバック用の固定アドバイス
      const adviceMap: { [key: string]: string } = {
        不安: "不安な気持ちは育児において自然な反応です。深呼吸をして、一歩ずつ進んでいきましょう。",
        怒り: "怒りを感じた時は、まず5秒数えてから行動してみてください。感情をコントロールできている証拠です。",
        疲労: "疲れている時は休息が必要です。可能な時に短時間でも休んで、自分を労わってください。",
        罪悪感: "完璧な親はいません。あなたが子どもを愛していることが最も大切です。",
        喜び: "この喜びの瞬間を心に刻んでください。困難な時の支えになります。",
        愛情: "愛情を感じられることは素晴らしいことです。その気持ちを大切にしてください。",
      }
      const primaryEmotion = emotions[0]
      return adviceMap[primaryEmotion] || "今日も育児お疲れさまでした。あなたの努力は必ず子どもに伝わっています。"
    }
  }

  const saveEntry = async () => {
    if (currentEntry.trim() && selectedEmotions.length > 0) {
      setIsGeneratingAdvice(true);
      const aiAdvice = await generateAIAdvice(selectedEmotions, currentEntry);
      const newEntry = {
        user_id: user.id,
        date: getJstDateString(), // JST
        emotions: [...selectedEmotions],
        content: currentEntry,
        aiAdvice,
      };
      const { data, error } = await supabase.from("entries").insert([newEntry]).select();
      if (!error && data && data[0]) {
        setEntries([data[0], ...entries]);
        setCurrentEntry("");
        setSelectedEmotions([]);
        toast({ title: "保存が完了しました", description: "記録が正常に保存されました。" });
      }
      setIsGeneratingAdvice(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: chatInput,
          history: chatMessages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending chat message:", error)
      const errorMessage: ChatMessage = {
        id: chatMessages.length + 2,
        role: "assistant",
        content: "申し訳ございません。現在AIサービスに接続できません。しばらく時間をおいてから再度お試しください。",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (confirm("この記録を削除しますか？")) {
      const { error } = await supabase.from("entries").delete().eq("id", entryId);
      if (!error) {
        setEntries(entries.filter((entry) => entry.id !== entryId));
        toast({ title: "削除が完了しました", description: "記録が正常に削除されました。" });
      }
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}回`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex flex-col items-center">
      {/* ヘッダー中央揃えラッパー */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md flex justify-between items-center bg-white shadow-sm border-b p-4">
          <div className="flex-1">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Logo />
              </div>
              <p className="text-sm text-gray-600">あなたの感情を育て、親子の絆を深める</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={signOut} className="ml-2">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">ログアウト</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="w-full max-w-md">
        <Tabs defaultValue="record" className="w-full">
          <div>
            {/* モバイル向けタブナビゲーション */}
            <div className="bg-white border-b sticky top-0 z-10">
              <TabsList className="grid w-full grid-cols-5 h-16 bg-transparent">
                <TabsTrigger value="record" className="flex flex-col items-center gap-1 text-xs">
                  <MessageCircle className="w-5 h-5" />
                  記録
                </TabsTrigger>
                <TabsTrigger value="history" className="flex flex-col items-center gap-1 text-xs">
                  <Calendar className="w-5 h-5" />
                  履歴
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex flex-col items-center gap-1 text-xs">
                  <Brain className="w-5 h-5" />
                  分析
                </TabsTrigger>
                <TabsTrigger value="counselor" className="flex flex-col items-center gap-1 text-xs">
                  <Video className="w-5 h-5" />
                  相談
                </TabsTrigger>
                <TabsTrigger value="growth" className="flex flex-col items-center gap-1 text-xs">
                  <TrendingUp className="w-5 h-5" />
                  成長
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 感情記録タブ */}
            <TabsContent value="record" className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-pink-500" />
                    今日の気持ちを記録
                  </CardTitle>
                  <CardDescription className="text-sm">感じた感情を選んでタップしてください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-4 block">今の気持ちは？</label>
                    {/* 感情選択ボタン部分 */}
                    <div className="grid grid-cols-2 gap-3">
                      {emotions.map((emotion) => {
                        const IconComponent = emotionIcons[emotion as keyof typeof emotionIcons]
                        const isSelected = selectedEmotions.includes(emotion)
                        return (
                          <div
                            key={emotion}
                            className={`relative cursor-pointer transition-all duration-200 border-2 rounded-xl p-2 h-14 flex flex-row items-center justify-center gap-2 active:scale-95 ${
                              isSelected
                                ? emotionColorsSelected[emotion as keyof typeof emotionColorsSelected]
                                : emotionColors[emotion as keyof typeof emotionColors]
                            }`}
                            onClick={() => toggleEmotion(emotion)}
                            style={{ minHeight: 0 }}
                          >
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            )}
                            <IconComponent className="w-5 h-5" />
                            <span className="text-xs font-medium">{emotion}</span>
                          </div>
                        )
                      })}
                    </div>
                    {selectedEmotions.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">選択中: {selectedEmotions.join("、")}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">今日の出来事や気持ち</label>
                    <Textarea
                      placeholder="例：子どもが初めて笑ってくれて嬉しかった、夜泣きが続いて疲れた、など..."
                      value={currentEntry}
                      onChange={(e) => setCurrentEntry(e.target.value)}
                      className="min-h-[120px] text-base"
                    />
                  </div>

                  <Button
                    onClick={saveEntry}
                    disabled={!currentEntry.trim() || selectedEmotions.length === 0 || isGeneratingAdvice}
                    className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-base font-medium"
                  >
                    {isGeneratingAdvice ? "AIがアドバイスを生成中..." : "記録を保存"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            {/* 履歴タブ */}
            <TabsContent value="history" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">感情の記録</CardTitle>
                  <CardDescription className="text-sm">これまでの感情の変化を振り返ってみましょう</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entriesLoading ? (
                      <div className="text-center text-gray-400">読み込み中...</div>
                    ) : entries.length === 0 ? (
                      <div className="text-center text-gray-400">まだ記録がありません</div>
                    ) : (
                      entries.map((entry) => (
                        <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{entry.date}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                              className="text-gray-400 hover:text-red-500 p-2 h-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {entry.emotions.map((emotion: string) => {
                              const IconComponent = emotionIcons[emotion as keyof typeof emotionIcons];
                              return (
                                <Badge
                                  key={emotion}
                                  className={`${emotionColors[emotion as keyof typeof emotionColors]} flex items-center gap-1 px-3 py-1`}
                                >
                                  <IconComponent className="w-3 h-3" />
                                  {emotion}
                                </Badge>
                              );
                            })}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{entry.content}</p>
                          {entry.aiAdvice && (
                            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800">AIからのアドバイス</p>
                                  <p className="text-sm text-blue-700 leading-relaxed">{entry.aiAdvice}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* 分析タブ */}
            <TabsContent value="insights" className="p-4 space-y-4">
              {/* 時系列グラフ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    感情の変化
                  </CardTitle>
                  <CardDescription className="text-sm">感情の変化パターンを確認できます</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* コントロール */}
                    <div className="flex gap-2">
                      <Select value={chartPeriod} onValueChange={setChartPeriod}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1week">1週間</SelectItem>
                          <SelectItem value="2weeks">2週間</SelectItem>
                          <SelectItem value="1month">1ヶ月</SelectItem>
                          <SelectItem value="3months">3ヶ月</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">線グラフ</SelectItem>
                          <SelectItem value="area">面グラフ</SelectItem>
                          <SelectItem value="bar">棒グラフ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* グラフ */}
                    <div className="h-64">
                      {chartType === "line" && safeTimeSeriesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={safeTimeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend fontSize={12} />
                            {emotions.map((emotion) => (
                              <Line
                                key={emotion}
                                type="monotone"
                                dataKey={emotion}
                                stroke={emotionChartColors[emotion as keyof typeof emotionChartColors]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : chartType === "area" && safeTimeSeriesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={safeTimeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend fontSize={12} />
                            {emotions.map((emotion) => (
                              <Area
                                key={emotion}
                                type="monotone"
                                dataKey={emotion}
                                stackId="1"
                                stroke={emotionChartColors[emotion as keyof typeof emotionChartColors]}
                                fill={emotionChartColors[emotion as keyof typeof emotionChartColors]}
                                fillOpacity={0.6}
                              />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : chartType === "bar" && safeTimeSeriesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={safeTimeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend fontSize={12} />
                            {emotions.map((emotion) => (
                              <Bar
                                key={emotion}
                                dataKey={emotion}
                                fill={emotionChartColors[emotion as keyof typeof emotionChartColors]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">データがありません</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">ストレスレベル</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>現在のレベル</span>
                        <span>{emotionStats.ストレスレベル}%</span>
                      </div>
                      <Progress value={emotionStats.ストレスレベル} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">ポジティブ度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>今週の平均</span>
                        <span>{emotionStats.ポジティブ度}%</span>
                      </div>
                      <Progress value={emotionStats.ポジティブ度} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 感情統計の可視化 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">感情の分布</CardTitle>
                  <CardDescription className="text-sm">今週記録された感情の内訳</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {emotions.map((emotion) => {
                      const IconComponent = emotionIcons[emotion as keyof typeof emotionIcons]
                      const count = emotionStats.emotionTotals?.[emotion] ?? 0;
                      return (
                        <div key={emotion} className="text-center p-3 border rounded-lg">
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${emotionColors[emotion as keyof typeof emotionColors]}`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-medium">{emotion}</p>
                          <p className="text-lg font-bold text-gray-700">{count}回</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* 専門家相談タブ */}
            <TabsContent value="counselor" className="p-4 space-y-4">
              {/* AI相談チャット */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="w-5 h-5 text-blue-500" />
                    AIカウンセラー
                  </CardTitle>
                  <CardDescription className="text-sm">24時間いつでも相談できます</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* チャット履歴 */}
                    <div className="h-80 overflow-y-auto border rounded-lg p-3 space-y-3 bg-gray-50">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-2 max-w-[85%] ${
                              message.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              {message.role === "user" ? (
                                <AvatarFallback className="bg-pink-500 text-white">
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback className="bg-blue-500 text-white">
                                  <Bot className="w-4 h-4" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div
                              className={`p-3 rounded-lg ${
                                message.role === "user"
                                  ? "bg-pink-500 text-white"
                                  : "bg-white border border-gray-200 text-gray-800"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${message.role === "user" ? "text-pink-100" : "text-gray-500"}`}
                              >
                                {message.timestamp.toLocaleTimeString("ja-JP", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="flex gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-500 text-white">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg">
                              <p className="text-sm">考え中...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* チャット入力 */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="悩みや気持ちを入力..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                        disabled={isChatLoading}
                        className="text-base"
                      />
                      <Button onClick={sendChatMessage} disabled={!chatInput.trim() || isChatLoading} className="px-4">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡
                        AIカウンセラーは24時間利用可能です。深刻な問題の場合は、専門のカウンセラーにご相談することをお勧めします。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* こども家庭庁 相談窓口リンクカード追加 */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                    <Bot className="w-5 h-5" />
                    公的な相談窓口（こども家庭庁）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 mb-3">
                    困ったときは、こども家庭庁の公式相談窓口もご利用いただけます。
                  </p>
                  <a
                    href="https://www.cfa.go.jp/children-inquiries"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3 transition"
                  >
                    こども家庭庁 相談窓口へ
                  </a>
                </CardContent>
              </Card>
            </TabsContent>
            {/* 成長タブ */}
            <TabsContent value="growth" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">あなたの成長記録</CardTitle>
                  <CardDescription className="text-sm">育児を通じて成長している自分を認めてあげましょう</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {streak}
                      </div>
                      <div>
                        <h4 className="font-medium">連続記録日数</h4>
                        <p className="text-sm text-gray-600">感情を記録し続けています</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">感情コントロール力</h4>
                        <Progress value={controlPower} className="mb-2" />
                        <p className="text-sm text-gray-600">ポジティブ度を元に算出</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">自己理解度</h4>
                        <Progress value={selfUnderstanding} className="mb-2" />
                        <p className="text-sm text-gray-600">記録数から算出</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">今週のハイライト</h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {weeklySummary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
