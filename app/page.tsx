"use client"

import { useState } from "react"
import { NameForm, type NameFormValues } from "@/components/name-form"
import { NameResult } from "@/components/name-result"
import { Sparkles } from "lucide-react"

type NameSuggestion = {
  name: string
  pinyin: string
  meaning: string
  reason: string
}

export default function Home() {
  const [result, setResult] = useState<NameSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (formData: NameFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const payload: NameFormValues = {
        ...formData,
        englishName: formData.englishName.trim(),
      }

      const response = await fetch("/api/generate-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = "生成失败，请稍后重试"

        try {
          const errorData = await response.json()
          if (errorData?.error) {
            message = errorData.error
          }
        } catch {
          // ignore JSON parse errors
        }

        throw new Error(message)
      }

      const data = (await response.json()) as NameSuggestion
      setResult(data)
    } catch (err) {
      console.error(err)
      setResult(null)
      setError(err instanceof Error ? err.message : "生成失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">中文名生成器</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">为你定制专属中文名</p>
        </div>
      </header>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">发现你的中文名字 ✨</h2>
          <p className="text-muted-foreground text-lg text-balance max-w-2xl mx-auto">
            基于你的个性特质，为你量身定制一个富有文化内涵的中文名字
          </p>
        </div>

        {/* 表单和结果 */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* 左侧：表单 */}
            <div>
              <NameForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>

            {/* 右侧：结果 */}
            <div>
              <NameResult result={result} loading={isLoading} error={error} />
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">💡 名字由 DeepSeek AI 根据你填写的画像实时生成，请核对后再使用</p>
        </div>
      </div>
    </main>
  )
}
