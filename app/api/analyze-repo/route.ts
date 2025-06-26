import { NextRequest, NextResponse } from 'next/server'
import { Issue, RepoData, GitHubIssue, GitHubRepo, Assignee } from '../../types'
import { processIssueWithAI } from '../../lib/ai'
import { fallbackProcessing } from '../../lib/ai'

async function fetchGitHubIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
  const githubToken = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  }
  
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30&sort=updated`,
    { headers }
  )
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const githubToken = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  }
  
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers }
  )
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

async function fetchGitHubReadme(owner: string, repo: string): Promise<string | null> {
  const githubToken = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.raw'
  }
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`
  }
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers }
  )
  if (!response.ok) return null
  return response.text()
}

function extractContributingSection(readme: string | null): string | undefined {
  if (!readme) return undefined
  const match = readme.match(/##? Contributing[\s\S]*?(?=\n## |\n# |$)/i)
  if (match) return match[0].trim()
  return undefined
}

function estimateTime(issue: GitHubIssue, difficulty: 'easy' | 'medium' | 'hard'): string {
  // Heuristic: easy = <1h, medium = 1-3h, hard = 3+h, but also consider body length
  const bodyLen = (issue.body || '').length
  if (difficulty === 'easy') return bodyLen < 300 ? '<1 hour' : '1–2 hours'
  if (difficulty === 'medium') return bodyLen < 500 ? '1–3 hours' : '3–6 hours'
  return bodyLen < 800 ? '3–6 hours' : '6+ hours'
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()
    
    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }
    
    // Parse GitHub URL
    const githubUrlRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/
    const match = repoUrl.match(githubUrlRegex)
    
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
    }
    
    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '') // Remove .git suffix if present
    
    // Fetch repository data, issues, and README in parallel
    const [repoData, issues, readme] = await Promise.all([
      fetchGitHubRepo(owner, cleanRepo),
      fetchGitHubIssues(owner, cleanRepo),
      fetchGitHubReadme(owner, cleanRepo)
    ])
    const contributingGuide = extractContributingSection(readme)
    
    // Process first 5 issues with AI, rest with fallback
    const aiCount = 5
    const aiIssues = issues.slice(0, aiCount)
    const fallbackIssues = issues.slice(aiCount)

    const processedAIIssues = await Promise.all(
      aiIssues.map(async (issue) => {
        const aiResult = await processIssueWithAI(issue)
        const assignees: Assignee[] = (issue.assignees || []).map(a => ({
          login: a.login,
          avatar_url: a.avatar_url,
          html_url: a.html_url
        }))
        const estimatedTime = estimateTime(issue, aiResult.difficulty)
        return {
          id: issue.id,
          title: issue.title,
          body: issue.body,
          url: issue.html_url,
          number: issue.number,
          state: issue.state,
          labels: issue.labels.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color,
            description: label.description
          })),
          summary: aiResult.summary,
          difficulty: aiResult.difficulty,
          suggestedFiles: aiResult.suggestedFiles,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          assignees,
          estimatedTime,
          ai: true
        } as Issue & { ai: boolean }
      })
    )

    const processedFallbackIssues = fallbackIssues.map((issue) => {
      const aiResult = fallbackProcessing(issue)
      const assignees: Assignee[] = (issue.assignees || []).map(a => ({
        login: a.login,
        avatar_url: a.avatar_url,
        html_url: a.html_url
      }))
      const estimatedTime = estimateTime(issue, aiResult.difficulty)
      return {
        id: issue.id,
        title: issue.title,
        body: issue.body,
        url: issue.html_url,
        number: issue.number,
        state: issue.state,
        labels: issue.labels.map(label => ({
          id: label.id,
          name: label.name,
          color: label.color,
          description: label.description
        })),
        summary: aiResult.summary,
        difficulty: aiResult.difficulty,
        suggestedFiles: aiResult.suggestedFiles,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        assignees,
        estimatedTime,
        ai: false
      } as Issue & { ai: boolean }
    })

    const allIssues = [...processedAIIssues, ...processedFallbackIssues]
    
    const responseData = {
      repoData: {
        name: repoData.name,
        description: repoData.description || 'No description available',
        url: repoData.html_url,
        stars: repoData.stargazers_count,
        language: repoData.language || 'Unknown',
        readme,
        contributingGuide
      } as RepoData,
      issues: allIssues
    }
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('Error analyzing repository:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('GitHub API error: 404')) {
        return NextResponse.json({ error: 'Repository not found or is private' }, { status: 404 })
      }
      if (error.message.includes('GitHub API error: 403')) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze repository. Please try again.' },
      { status: 500 }
    )
  }
} 