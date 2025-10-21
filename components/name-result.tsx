"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { AlertTriangle, Copy, Heart } from "lucide-react"

interface NameResultProps {
  result: {
    name: string
    pinyin: string
    meaning: string
    reason: string
  } | null
  loading: boolean
  error: string | null
}

export function NameResult({ result, loading, error }: NameResultProps) {
  const handleCopy = () => {
    if (!result) {
      return
    }

    navigator.clipboard
      .writeText(`${result.name} (${result.pinyin})`)
      .catch(() => {
        // Clipboard 写入失败时静默处理，避免打断用户流程
      })
  }

  if (loading) {
    return (
      <Card className="p-8 shadow-lg border-2 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-sm">AI 正在为你生成中文名字...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 shadow-lg border-2 border-destructive/30 h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive text-sm text-balance">{error}</p>
          <p className="text-xs text-muted-foreground">请稍后重试，或检查网络与 API Key 是否有效</p>
        </div>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="p-8 shadow-lg border-2 border-dashed h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-balance">填写左侧表单，生成你的专属中文名</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 shadow-lg border-2 bg-gradient-to-br from-card to-accent/20">
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-2">你的中文名字</p>
          <h3 className="text-4xl font-bold text-foreground mb-2">{result.name}</h3>
          <p className="text-lg text-muted-foreground">{result.pinyin}</p>
        </div>

        {/* 含义 */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">含义</p>
          <p className="text-base text-foreground leading-relaxed">{result.meaning}</p>
        </div>

        {/* 理由 */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">起名理由</p>
          <p className="text-sm text-foreground leading-relaxed">{result.reason}</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleCopy} variant="outline" className="flex-1 h-11 bg-transparent">
            <Copy className="w-4 h-4 mr-2" />
            复制名字
          </Button>
          <Button variant="outline" className="flex-1 h-11 bg-transparent">
            <Heart className="w-4 h-4 mr-2" />
            收藏
          </Button>
        </div>

        {/* 提示 */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">💡 点击"生成"按钮可以重新生成</p>
        </div>
      </div>
    </Card>
  )
}
