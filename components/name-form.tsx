"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export interface NameFormValues {
  englishName: string
  gender: string
  traits: string[]
  style: string
  phonetic: string
}

interface NameFormProps {
  onGenerate: (data: NameFormValues) => void | Promise<void>
  isLoading?: boolean
}

const traitOptions = [
  { value: "rational", label: "理性" },
  { value: "gentle", label: "温和" },
  { value: "outgoing", label: "外向" },
  { value: "humorous", label: "幽默" },
  { value: "professional", label: "专业" },
  { value: "artistic", label: "艺术" },
  { value: "athletic", label: "运动" },
  { value: "academic", label: "学术" },
  { value: "leadership", label: "领导" },
  { value: "creative", label: "创意" },
]

export function NameForm({ onGenerate, isLoading = false }: NameFormProps) {
  const [formData, setFormData] = useState<NameFormValues>({
    englishName: "",
    gender: "neutral",
    traits: [],
    style: "modern",
    phonetic: "native-like",
  })

  const handleTraitToggle = (trait: string) => {
    setFormData((prev) => {
      const newTraits = prev.traits.includes(trait)
        ? prev.traits.filter((t) => t !== trait)
        : prev.traits.length < 3
          ? [...prev.traits, trait]
          : prev.traits
      return { ...prev, traits: newTraits }
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onGenerate(formData)
  }

  return (
    <Card className="p-6 shadow-lg border-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 英文名 */}
        <div className="space-y-2">
          <Label htmlFor="englishName" className="text-base font-semibold">
            你的名字 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="englishName"
            placeholder="例如：Emma, John"
            value={formData.englishName}
            onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
            required
            className="h-12 text-base"
          />
        </div>

        {/* 性别 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">性别</Label>
          <div className="flex gap-2">
            {[
              { value: "male", label: "男" },
              { value: "female", label: "女" },
              { value: "neutral", label: "中性" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: option.value })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  formData.gender === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 自我画像 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            自我画像 <span className="text-sm text-muted-foreground">(最多选3个)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {traitOptions.map((trait) => (
              <button
                key={trait.value}
                type="button"
                onClick={() => handleTraitToggle(trait.value)}
                className={`py-2 px-4 rounded-full border-2 transition-all text-sm font-medium ${
                  formData.traits.includes(trait.value)
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-card text-card-foreground border-border hover:border-secondary/50"
                }`}
              >
                {trait.label}
              </button>
            ))}
          </div>
        </div>

        {/* 名字风格 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">名字风格</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "classic", label: "古典" },
              { value: "modern", label: "现代" },
              { value: "professional", label: "专业" },
              { value: "friendly", label: "亲切" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, style: option.value })}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  formData.style === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 发音偏好 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">发音偏好</Label>
          <div className="flex gap-2">
            {[
              { value: "near-original", label: "接近原名" },
              { value: "native-like", label: "中文习惯" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, phonetic: option.value })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  formData.phonetic === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading || !formData.englishName.trim()}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isLoading ? "生成中..." : "生成我的中文名"}
        </Button>
      </form>
    </Card>
  )
}
