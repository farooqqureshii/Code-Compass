import { GitHubIssue } from '../types'

interface AIProcessingResult {
  summary: string
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedFiles: string[]
  estimatedTime?: string
}

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function fallbackProcessing(issue: GitHubIssue): AIProcessingResult {
  const content = `${issue.title} ${issue.body || ''}`.toLowerCase()
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  const easyKeywords = ['typo', 'documentation', 'readme', 'comment', 'formatting', 'style', 'lint', 'spelling']
  const hardKeywords = ['bug', 'fix', 'refactor', 'performance', 'optimization', 'security', 'core', 'architecture']
  const easyLabelNames = issue.labels.map(l => l.name.toLowerCase())
  const hasEasyLabels = easyLabelNames.some(name =>
    name.includes('good first issue') || name.includes('beginner') || name.includes('easy') || name.includes('help wanted')
  )
  const hasHardLabels = easyLabelNames.some(name =>
    name.includes('bug') || name.includes('enhancement') || name.includes('feature') || name.includes('core')
  )
  if (hasEasyLabels || easyKeywords.some(keyword => content.includes(keyword))) {
    difficulty = 'easy'
  } else if (hasHardLabels || hardKeywords.some(keyword => content.includes(keyword))) {
    difficulty = 'hard'
  }
  const summary = (issue.body && issue.body.length > 200)
    ? issue.body.substring(0, 200) + '...'
    : issue.body || 'No description provided.'
  const suggestedFiles: string[] = []
  if (content.includes('readme') || content.includes('documentation')) {
    suggestedFiles.push('README.md', 'docs/')
  }
  if (content.includes('test') || content.includes('spec')) {
    suggestedFiles.push('test/', '__tests__/', '*.test.js', '*.spec.js')
  }
  if (content.includes('component') || content.includes('ui')) {
    suggestedFiles.push('components/', 'src/components/')
  }
  if (content.includes('api') || content.includes('endpoint')) {
    suggestedFiles.push('api/', 'routes/', 'controllers/')
  }
  if (content.includes('config') || content.includes('setting')) {
    suggestedFiles.push('config/', '*.config.js', 'package.json')
  }
  // Heuristic time estimate
  const bodyLen = (issue.body || '').length
  let estimatedTime = '1–3 hours'
  if (difficulty === 'easy') estimatedTime = bodyLen < 300 ? '<1 hour' : '1–2 hours'
  if (difficulty === 'medium') estimatedTime = bodyLen < 500 ? '1–3 hours' : '3–6 hours'
  if (difficulty === 'hard') estimatedTime = bodyLen < 800 ? '3–6 hours' : '6+ hours'
  return {
    summary,
    difficulty,
    suggestedFiles: suggestedFiles.slice(0, 3),
    estimatedTime
  }
}

export async function processIssueWithAI(issue: GitHubIssue): Promise<AIProcessingResult> {
  if (!GROQ_API_KEY) {
    console.warn('Groq API key not found, using fallback processing')
    return fallbackProcessing(issue)
  }
  try {
    const prompt = `Summarize the following GitHub issue for a new contributor. Only return the summary, do not preface with any explanation. Then estimate the time to complete (in hours, e.g. '<1 hour', '1-3 hours', '3+ hours').\n\nTitle: ${issue.title}\n\nBody: ${issue.body || ''}`
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for open source contributors.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Groq API error: ${response.status}, body:`, errorText)
      return fallbackProcessing(issue)
    }
    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''
    // Try to extract summary and time estimate from the response
    let summary = content
    let estimatedTime = undefined
    const timeMatch = content.match(/(\d+\s*-?\s*\d*\+?\s*hours?|<\s*\d+\s*hour)/i)
    if (timeMatch) {
      estimatedTime = timeMatch[0].replace(/\s+/g, ' ').trim()
      summary = content.replace(timeMatch[0], '').replace(/\s+/, ' ').trim()
    }
    // Remove boilerplate like 'Here is a summary...' if present
    summary = summary.replace(/^here is a summary[^:]*:\s*/i, '').trim()
    // Use fallback for difficulty and file suggestions
    const fallback = fallbackProcessing(issue)
    return {
      summary: summary.length > 200 ? summary.substring(0, 200) + '...' : summary,
      difficulty: fallback.difficulty,
      suggestedFiles: fallback.suggestedFiles,
      estimatedTime: estimatedTime || fallback.estimatedTime
    }
  } catch (error) {
    console.error('Groq API error:', error)
    return fallbackProcessing(issue)
  }
}

export { fallbackProcessing } 