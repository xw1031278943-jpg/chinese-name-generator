import { NextResponse } from "next/server"

const API_URL = "https://api.siliconflow.cn/v1/chat/completions"
const MODEL_ID = "deepseek-ai/DeepSeek-R1"

type GenerateNameRequest = {
  englishName: string
  gender: string
  traits: string[]
  style: string
  phonetic: string
}

const GENDER_MAP: Record<string, string> = {
  male: "男性",
  female: "女性",
  neutral: "中性",
}

const STYLE_MAP: Record<string, string> = {
  classic: "古典",
  modern: "现代",
  professional: "专业",
  friendly: "亲切",
}

const PHONETIC_MAP: Record<string, string> = {
  "near-original": "尽量贴近英文名读音",
  "native-like": "符合中文母语者习惯",
}

const TRAIT_MAP: Record<string, string> = {
  rational: "理性",
  gentle: "温和",
  outgoing: "外向",
  humorous: "幽默",
  professional: "专业",
  artistic: "艺术",
  athletic: "运动",
  academic: "学术",
  leadership: "领导",
  creative: "创意",
}

export async function POST(request: Request) {
  const apiKey =
    process.env.DEEPSEEK_API_KEY?.trim() ?? process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY?.trim()

  if (!apiKey) {
    return NextResponse.json({ error: "服务器缺少 DeepSeek API Key" }, { status: 500 })
  }

  let payload: GenerateNameRequest

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "无效的请求数据" }, { status: 400 })
  }

  if (!payload.englishName?.trim()) {
    return NextResponse.json({ error: "英文名不能为空" }, { status: 400 })
  }

  const gender = GENDER_MAP[payload.gender] ?? "未指定"
  const traits =
    payload.traits?.length
      ? payload.traits.map((trait) => TRAIT_MAP[trait] ?? trait).join("、")
      : "未提供"
  const style = STYLE_MAP[payload.style] ?? "未指定"
  const phonetic = PHONETIC_MAP[payload.phonetic] ?? "符合中文习惯"

  const userPrompt = `
请根据以下信息，为用户生成一个贴合个性且寓意积极的中文名字：
- 英文名：${payload.englishName}
- 性别倾向：${gender}
- 自我画像（最多三个）：${traits}
- 名字风格偏好：${style}
- 发音偏好：${phonetic}

请只输出 JSON 对象，不要包含其他任何文本或注释。JSON 结构必须如下：
{
  "name": "中文名字，两个或三个汉字",
  "pinyin": "名字的标准拼音，带声调数字或音标",
  "meaning": "一句简短说明名字的寓意",
  "reason": "结合用户画像，解释为何推荐这个名字，80 字以内"
}
`.trim()

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content:
              "你是一位专业的中文起名顾问，为外国用户提供具有文化内涵的中文名字。你必须只返回符合要求的 JSON 对象，不能包含额外内容。",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "调用 DeepSeek API 失败", detail: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    const message = data?.choices?.[0]?.message
    let content = ""

    if (typeof message?.content === "string") {
      content = message.content
    } else if (Array.isArray(message?.content)) {
      content = message.content
        .map((part: any) => {
          if (typeof part === "string") return part
          if (part?.type === "text" && typeof part.text === "string") return part.text
          return ""
        })
        .join("\n")
    } else if (typeof message?.reasoning_content === "string") {
      // DeepSeek 部分模型会把主要回答放在 reasoning_content
      content = message.reasoning_content
    }

    if (!content) {
      return NextResponse.json({ error: "DeepSeek 返回内容为空" }, { status: 502 })
    }

    let parsed
    let trimmedContent = ""

    try {
      trimmedContent = (content ?? "").toString().trim()
    } catch {
      return NextResponse.json(
        { error: "DeepSeek 返回内容无法解析", raw: content },
        { status: 502 },
      )
    }

    if (!trimmedContent) {
      return NextResponse.json({ error: "DeepSeek 返回内容为空" }, { status: 502 })
    }

    try {
      parsed = JSON.parse(trimmedContent)
    } catch {
      // 尝试从 Markdown 代码块中提取 JSON
      const jsonMatch = trimmedContent.match(/```(?:json)?\s*([\s\S]*?)```/)

      if (jsonMatch?.[1]) {
        const candidate = jsonMatch[1].trim()
        try {
          parsed = JSON.parse(candidate)
        } catch {
          return NextResponse.json(
            { error: "DeepSeek 返回格式不符合 JSON 要求", raw: trimmedContent },
            { status: 502 },
          )
        }
      } else {
        return NextResponse.json(
          { error: "DeepSeek 返回格式不符合 JSON 要求", raw: trimmedContent },
          { status: 502 },
        )
      }
    }

    if (!parsed?.name || !parsed?.pinyin || !parsed?.meaning || !parsed?.reason) {
      return NextResponse.json(
        { error: "DeepSeek 返回缺少必要字段", raw: parsed },
        { status: 502 },
      )
    }

    return NextResponse.json({
      name: parsed.name,
      pinyin: parsed.pinyin,
      meaning: parsed.meaning,
      reason: parsed.reason,
    })
  } catch (error) {
    console.error("generate-name error", error)
    return NextResponse.json({ error: "生成中文名时发生异常" }, { status: 500 })
  }
}
