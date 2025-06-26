'use client'

import { useState } from 'react'
import { Search, Github, Loader2, Filter, Star } from 'lucide-react'
import IssueCard from './components/IssueCard'
import { Issue, RepoData } from './types'

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [error, setError] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    setIsLoading(true)
    setError('')
    setIssues([])
    setRepoData(null)

    try {
      const response = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze repository')
      }

      setIssues(data.issues)
      setRepoData(data.repoData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredIssues = issues.filter(issue => 
    difficultyFilter === 'all' || issue.difficulty === difficultyFilter
  )

  // Split issues into AI and fallback
  const aiIssues = filteredIssues.filter((issue: any) => issue.ai)
  const fallbackIssues = filteredIssues.filter((issue: any) => !issue.ai)

  const getRecommendedIssue = () => {
    const easyIssues = issues.filter(issue => issue.difficulty === 'easy')
    return easyIssues.length > 0 ? easyIssues[0] : issues[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Github className="w-12 h-12 text-gray-800 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Code Compass</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect first issue to contribute to any GitHub repository
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter GitHub repository URL (e.g., https://github.com/vercel/next.js)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !repoUrl.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Analyze
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Repository Info */}
        {repoData && (
          <div className="max-w-4xl mx-auto mb-8 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{repoData.name}</h2>
                <p className="text-gray-600">{repoData.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {repoData.stars.toLocaleString()}
                </div>
                <span>•</span>
                <span>{repoData.language}</span>
              </div>
            </div>
            <a
              href={repoData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View on GitHub →
            </a>
          </div>
        )}

        {/* Contributing Guide */}
        {repoData?.contributingGuide && (
          <div className="max-w-4xl mx-auto mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-bold mb-2 text-blue-900">How to Contribute</h3>
            <pre className="whitespace-pre-wrap text-sm text-blue-900">{repoData.contributingGuide}</pre>
          </div>
        )}

        {/* Results */}
        {issues.length > 0 && (
          <div className="max-w-6xl mx-auto">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <span className="text-gray-600">
                  {filteredIssues.length} of {issues.length} issues
                </span>
              </div>
              
              {getRecommendedIssue() && (
                <button
                  onClick={() => {
                    const recommended = getRecommendedIssue()
                    if (recommended) {
                      window.open(recommended.url, '_blank')
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Recommended Issue
                </button>
              )}
            </div>

            {/* Issues Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(showAll ? filteredIssues : aiIssues).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {/* Loading animation for AI issues */}
              {isLoading && !showAll && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-6 w-6 bg-gray-100 rounded-full" />
                    <div className="h-6 w-6 bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            {/* Load More Button */}
            {!showAll && fallbackIssues.length > 0 && !isLoading && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAll(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow"
                >
                  Load more issues
                </button>
              </div>
            )}

            {filteredIssues.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No issues match the selected difficulty filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 