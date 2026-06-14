import { createFileRoute } from '@tanstack/react-router'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are an expert fact-checker and media literacy specialist trained to detect fake news, misinformation, and propaganda. Analyze the provided news article or text and return a structured JSON assessment.

Evaluate based on:
- Sensational or emotionally manipulative language
- Lack of credible sources or citations
- Factual inconsistencies or implausible claims
- Clickbait headlines or misleading framing
- Known misinformation patterns (fabricated quotes, manipulated statistics)
- Grammar, spelling, and professional writing quality
- Balanced vs one-sided reporting
- Presence of verifiable facts

Return ONLY valid JSON with this exact structure:
{
  "verdict": "FAKE" | "REAL" | "UNCERTAIN",
  "confidence": <number 0-100>,
  "summary": "<one-sentence overall assessment>",
  "reasoning": "<2-4 sentences explaining the verdict>",
  "redFlags": ["<flag1>", "<flag2>", ...],
  "positiveIndicators": ["<indicator1>", ...],
  "credibilityScore": <number 0-10>,
  "category": "<Misinformation|Satire|Propaganda|Clickbait|Credible|Uncertain>"
}`

export const Route = createFileRoute('/api/analyze')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { text } = body

          if (!text || typeof text !== 'string' || text.trim().length < 20) {
            return new Response(
              JSON.stringify({ error: 'Please provide at least 20 characters of text to analyze.' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: `Analyze this news article or text for authenticity:\n\n---\n${text.slice(0, 8000)}\n---\n\nReturn only valid JSON.`,
              },
            ],
            system: SYSTEM_PROMPT,
          })

          const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

          // Extract JSON from response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            throw new Error('Invalid response format from AI')
          }

          const analysis = JSON.parse(jsonMatch[0])

          return new Response(JSON.stringify(analysis), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error: any) {
          console.error('Analysis error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to analyze text. Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
