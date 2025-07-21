"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"

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

// サンプルの時系列データを生成
const generateTimeSeriesData = () => {
  const data = []
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const entry = {
      date: date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
      fullDate: date.toLocaleDateString("ja-JP"),
      喜び: Math.floor(Math.random() * 5) + 1,
      不安: Math.floor(Math.random() * 4) + 1,
      怒り: Math.floor(Math.random() * 3) + 1,
      悲しみ: Math.floor(Math.random() * 3) + 1,
      疲労: Math.floor(Math.random() * 4) + 2,
      罪悪感: Math.floor(Math.random() * 3) + 1,
      愛情: Math.floor(Math.random() * 5) + 2,
    }
    data.push(entry)
  }

  return data
}

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ParentSeedApp() {
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
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2024年1月15日",
      emotions: ["不安", "疲労"],
      content:
        "今日は子どもが泣き止まなくて、自分が悪い親なのかと不安になった。でも夕方には笑顔を見せてくれて少し安心した。",
      aiAdvice: "",
    },
    {
      id: 2,
      date: "2024年1月14日",
      emotions: ["愛情", "喜び"],
      content: "初めて「ママ」と言ってくれた！涙が出るほど嬉しかった。この瞬間のために頑張ってきたんだと思った。",
      aiAdvice: "",
    },
  ])

  const timeSeriesData = generateTimeSeriesData()

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
      setIsGeneratingAdvice(true)

      const aiAdvice = await generateAIAdvice(selectedEmotions, currentEntry)

      const newEntry = {
        id: entries.length + 1,
        date: new Date().toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        emotions: [...selectedEmotions],
        content: currentEntry,
        aiAdvice,
      }

      setEntries([newEntry, ...entries])
      setCurrentEntry("")
      setSelectedEmotions([])
      setIsGeneratingAdvice(false)
    }
  }

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

  const emotionStats = {
    今週の感情バランス: 75,
    ストレスレベル: 40,
    ポジティブ度: 65,
  }

  const deleteEntry = (entryId: number) => {
    if (confirm("この記録を削除しますか？")) {
      setEntries(entries.filter((entry) => entry.id !== entryId))
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="max-w-md mx-auto">
        {/* モバイル向けヘッダー */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-7 h-7 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-800">ParentSeed</h1>
            </div>
            <p className="text-sm text-gray-600">あなたの感情を育て、親子の絆を深める</p>
          </div>
        </div>

        <Tabs defaultValue="record" className="w-full">
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
                  <div className="grid grid-cols-2 gap-3">
                    {emotions.map((emotion) => {
                      const IconComponent = emotionIcons[emotion as keyof typeof emotionIcons]
                      const isSelected = selectedEmotions.includes(emotion)
                      return (
                        <div
                          key={emotion}
                          className={`relative cursor-pointer transition-all duration-200 border-2 rounded-xl p-4 h-20 flex flex-col items-center justify-center gap-2 active:scale-95 ${
                            isSelected
                              ? emotionColorsSelected[emotion as keyof typeof emotionColorsSelected]
                              : emotionColors[emotion as keyof typeof emotionColors]
                          }`}
                          onClick={() => toggleEmotion(emotion)}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-white rounded-full p-1">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                          <IconComponent className="w-6 h-6" />
                          <span className="text-sm font-medium">{emotion}</span>
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
                  {entries.map((entry) => (
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
                        {entry.emotions.map((emotion) => {
                          const IconComponent = emotionIcons[emotion as keyof typeof emotionIcons]
                          return (
                            <Badge
                              key={emotion}
                              className={`${emotionColors[emotion as keyof typeof emotionColors]} flex items-center gap-1 px-3 py-1`}
                            >
                              <IconComponent className="w-3 h-3" />
                              {emotion}
                            </Badge>
                          )
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
                  ))}
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
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "line" && (
                        <LineChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend fontSize={12} />
                          {emotions.slice(0, 3).map((emotion) => (
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
                      )}
                      {chartType === "area" && (
                        <AreaChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend fontSize={12} />
                          {emotions.slice(0, 3).map((emotion) => (
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
                      )}
                      {chartType === "bar" && (
                        <BarChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend fontSize={12} />
                          {emotions.slice(0, 3).map((emotion) => (
                            <Bar
                              key={emotion}
                              dataKey={emotion}
                              fill={emotionChartColors[emotion as keyof typeof emotionChartColors]}
                            />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">感情バランス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>今週の安定度</span>
                      <span>{emotionStats.今週の感情バランス}%</span>
                    </div>
                    <Progress value={emotionStats.今週の感情バランス} className="h-2" />
                  </div>
                </CardContent>
              </Card>

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
                    const count = Math.floor(Math.random() * 10) + 1 // サンプルデータ
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

            {/* 緊急サポート */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  緊急時のサポート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 mb-3">
                  今すぐ誰かと話したい、危険を感じる場合は以下にご連絡ください
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full h-12">
                    <Phone className="w-4 h-4 mr-2" />
                    24時間ホットライン
                  </Button>
                  <Button variant="outline" className="w-full h-12 border-red-200 text-red-600 bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    チャット相談
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI推奨 */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                  <Brain className="w-5 h-5" />
                  AIからの提案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-600 mb-3">
                  最近の感情記録を分析した結果、専門家との相談をお勧めします。
                  特に「不安」と「罪悪感」の頻度が高くなっています。
                </p>
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700">推奨カウンセラーを見る</Button>
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
                      7
                    </div>
                    <div>
                      <h4 className="font-medium">連続記録日数</h4>
                      <p className="text-sm text-gray-600">感情を記録し続けています</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">感情コントロール力</h4>
                      <Progress value={70} className="mb-2" />
                      <p className="text-sm text-gray-600">前月比 +15% 向上</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">自己理解度</h4>
                      <Progress value={85} className="mb-2" />
                      <p className="text-sm text-gray-600">前月比 +20% 向上</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">今週のハイライト</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      子どもが泣いている時に、以前より冷静に対応できるようになりました。
                      感情を記録することで、自分の気持ちを客観視できるようになっています。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
