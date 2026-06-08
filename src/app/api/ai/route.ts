import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPTS: Record<string, string> = {
  humanize: `You are an expert writing editor. Rewrite the input text so it reads as natural, authentic human writing.

Rules:
- Vary sentence length dramatically (mix short punchy sentences with longer flowing ones)
- Use natural transitions: "That said,", "Here's the thing —", "Worth noting:"
- Replace overly formal phrasing with conversational but still academic alternatives  
- Remove AI-typical phrases: "it is important to note", "in conclusion", "delve into", "it is worth noting", "in the realm of", "as an AI language model", "crucial to"
- Use contractions occasionally where appropriate
- Add light hedging where fitting ("tends to", "in most cases")
- Keep ALL original facts, arguments and meaning intact
- Preserve academic register — not casual blog writing
- Output ONLY the revised text. No preamble or explanation.`,

  paraphrase_standard: `Rewrite the following text in your own words keeping the same meaning. Output only the rewritten text.`,
  paraphrase_fluent:   `Rewrite the following text to flow smoothly and naturally. Prioritize readability. Output only the rewritten text.`,
  paraphrase_formal:   `Rewrite the following text in a formal professional register. Avoid contractions. Output only the rewritten text.`,
  paraphrase_academic: `Rewrite the following text in rigorous academic style for a university paper. Use third-person and formal syntax. Output only the rewritten text.`,

  defluff: `Remove all wordiness and filler from the text without losing meaning.
Replace: "in order to"→"to", "due to the fact that"→"because", "at this point in time"→"now", "has the ability to"→"can", "prior to"→"before", "a large number of"→"many".
Cut sentences that purely restate the previous one.
Output ONLY the trimmed text.`,

  elongate: `Expand the following concise text into fuller academic prose. Add context, elaboration, professional transitions, and supporting reasoning. Aim to roughly double the word count while keeping every original idea. Do not add false facts. Output ONLY the expanded text.`,

  thesis: `Generate exactly 3 distinct strong thesis statements from the given topic and arguments.

Format:
THESIS 1: [statement]
THESIS 2: [statement]
THESIS 3: [statement]

Each must be 1-2 sentences, make a clear arguable claim, and vary in rhetorical approach.`,

  voice: `Convert active voice sentences to formal academic passive voice. Keep passive sentences unchanged. Maintain all meaning. Output ONLY the converted text.`,
}

export async function POST(req: NextRequest) {
  try {
    const { tool, text, extra } = await req.json() as {
      tool: string; text: string; extra?: Record<string, string>
    }

    if (!text?.trim())         return NextResponse.json({ error: 'No input text provided.' }, { status: 400 })
    if (text.length > 8000)    return NextResponse.json({ error: 'Input too long. Max 8,000 characters.' }, { status: 400 })

    // Support mode variants for paraphrase
    const toolKey = tool === 'paraphrase' && extra?.mode
      ? `paraphrase_${extra.mode}`
      : tool

    const systemPrompt = SYSTEM_PROMPTS[toolKey]
    if (!systemPrompt) return NextResponse.json({ error: 'Unknown tool.' }, { status: 400 })

    let userMessage = text
    if (tool === 'thesis' && extra) {
      userMessage = `Topic: ${extra.topic}\nMain Argument: ${extra.argument}\nEvidence 1: ${extra.ev1}\nEvidence 2: ${extra.ev2}\nEvidence 3: ${extra.ev3}`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      console.error('Anthropic error:', await response.text())
      return NextResponse.json({ error: 'AI service temporarily unavailable.' }, { status: 502 })
    }

    const data = await response.json()
    const output = data.content?.[0]?.text ?? ''
    return NextResponse.json({ output })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
