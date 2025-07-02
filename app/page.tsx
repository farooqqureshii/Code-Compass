'use client'

import { useState } from 'react'
import { Search, Github, Loader2, Filter, Star } from 'lucide-react'
import IssueCard from './components/IssueCard'
import { Issue, RepoData } from './types'
import { motion, AnimatePresence } from 'framer-motion'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' })
const inter = Inter({ subsets: ['latin'] })

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
    <div className="min-h-screen flex flex-col bg-[#f7f7fa] relative overflow-hidden">
      {/* Subtle Outlined Circles Background - expanded and more dynamic */}
      <svg className="absolute left-1/2 top-0 -translate-x-1/2 z-0 pointer-events-none" width="2200" height="1600" viewBox="0 0 2200 1600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="1100" cy="700" r="900" stroke="#b6c2d6" strokeWidth="1.7" opacity="0.22" />
        <circle cx="1100" cy="700" r="700" stroke="#b6c2d6" strokeWidth="1.4" opacity="0.18" />
        <circle cx="1100" cy="700" r="500" stroke="#b6c2d6" strokeWidth="1.2" opacity="0.15" />
        <circle cx="1100" cy="700" r="340" stroke="#b6c2d6" strokeWidth="1.7" opacity="0.28" />
        <circle cx="1100" cy="700" r="180" stroke="#b6c2d6" strokeWidth="1.1" opacity="0.22" />
      </svg>
      {/* Top left logo when repo loaded */}
      {repoData && (
        <button className="absolute top-6 left-8 z-20 flex items-center group" onClick={() => { setRepoUrl(''); setRepoData(null); setIssues([]); }} aria-label="Back to homepage">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="19" cy="19" r="18" stroke="#2563eb" strokeWidth="2" fill="#fff" />
            <path d="M19 7L22 19L31 22L19 31L16 19L7 16L19 7Z" stroke="#2563eb" strokeWidth="2" fill="#e0e7ff" />
          </svg>
          <span className="ml-2 text-lg font-bold text-blue-700 tracking-tight group-hover:underline">Code Compass</span>
        </button>
      )}
      <main className="flex-1 flex flex-col items-center justify-center z-10 relative px-4 w-full">
        {/* Show hero and input only if no repo loaded */}
        {!repoData && (
          <>
            {/* Logo integrated in hero */}
            <div className="flex flex-col items-center mb-6">
              <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                <circle cx="27" cy="27" r="25" stroke="#2563eb" strokeWidth="3" fill="#fff" />
                <path d="M27 10L31 27L45 31L27 45L23 27L9 23L27 10Z" stroke="#2563eb" strokeWidth="2.2" fill="#e0e7ff" />
              </svg>
              <span className="text-xl font-bold text-blue-700 tracking-tight">Code Compass</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-full max-w-2xl mx-auto rounded-2xl p-10 mb-10 mt-10 flex flex-col items-center"
            >
              <motion.h1
                className={`text-5xl md:text-6xl font-extrabold text-gray-900 text-center mb-4 leading-tight ${inter.className}`}
                style={{ letterSpacing: '-0.01em' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              >
                <span className="relative inline-block">
                  <motion.span
                    className="font-extrabold"
                    initial={{ color: '#2563eb' }}
                    animate={{ color: ['#2563eb', '#3b82f6', '#2563eb'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ WebkitTextStroke: '0.5px #2563eb' }}
                  >
                    Secure
                  </motion.span>
                  <motion.span
                    className="absolute left-0 -bottom-1 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'left' }}
                  />
                </span>{' '}
                <span className="text-gray-900">your next</span>
                <br />
                <span className="text-gray-700">open source</span>
                <br />
                <span className="text-gray-700">contribution</span>
              </motion.h1>
              <motion.p
                className={`text-lg text-gray-600 text-center max-w-xl mb-8 font-sans ${inter.className}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              >
                Instantly discover, understand, and filter the best GitHub issues to work on.<br />
                Powered by Groq Llama 3.
              </motion.p>
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4" autoComplete="off">
                <motion.input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Paste a GitHub repo URL (e.g., https://github.com/vercel/next.js)"
                  className={`w-full max-w-md px-5 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 shadow transition-all duration-200 bg-white text-center font-sans ${inter.className}`}
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                  whileFocus={{ scale: 1.03, boxShadow: '0 0 0 4px #3b82f6' }}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !repoUrl.trim()}
                  className={`w-full max-w-xs px-7 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 text-lg font-sans ${inter.className}`}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 16px 2px #3b82f6' }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Get started'
                  )}
                </motion.button>
              </form>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg shadow"
                >
                  <p className="text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        {/* Repo loaded: show repo info, filters, issues, etc. */}
        {repoData && (
          <div className="w-full flex flex-col items-center pt-20">
            {/* Repo info card */}
            <motion.div className="max-w-4xl w-full mx-auto mb-8 p-6 bg-white rounded-xl shadow border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
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
              <a href={repoData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">View on GitHub →</a>
            </motion.div>
            {/* Filter bar */}
            <div className="w-full max-w-6xl flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <span className="text-gray-600">{filteredIssues.length} of {issues.length} issues</span>
              </div>
              {getRecommendedIssue() && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => { const recommended = getRecommendedIssue(); if (recommended) { window.open(recommended.url, '_blank'); } }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow">
                  <Star className="w-4 h-4" />
                  Recommended Issue
                </motion.button>
              )}
            </div>
            {/* Issues grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
              {(showAll ? filteredIssues : aiIssues).map((issue) => (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3, delay: 0.05 * (issue.ai ? aiIssues.indexOf(issue) : 0) }}>
                  <IssueCard issue={issue} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6" />
                </motion.div>
              ))}
              {/* Loading animation for AI issues */}
              {isLoading && !showAll && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 animate-pulse" />
              ))}
            </div>
            {/* Load More Button */}
            {!showAll && fallbackIssues.length > 0 && !isLoading && (
              <div className="flex justify-center mt-8">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAll(true)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow">Load more issues</motion.button>
              </div>
            )}
            {filteredIssues.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No issues match the selected difficulty filter.</p>
              </div>
            )}
          </div>
        )}
      </main>
      {/* Built by Farooq link, only show if no repo loaded */}
      {!repoData && (
        <div className="w-full flex justify-center items-center py-4 text-xs text-gray-500 font-sans">
          Built by <a href="https://farooqureshi.com" target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-blue-400">Farooq</a>
        </div>
      )}
    </div>
  )
} 