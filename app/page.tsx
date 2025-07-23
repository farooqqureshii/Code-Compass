'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Github, Loader2, Filter, Star } from 'lucide-react'
import IssueCard from './components/IssueCard'
import { Issue, RepoData } from './types'
import { motion, AnimatePresence } from 'framer-motion'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], weight: ['400', '700'] })

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

  // Easter egg: bounce circles on 'C' key
  const circlesRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        const circles = circlesRef.current?.querySelectorAll('.easter-egg-circle')
        circles?.forEach((el, i) => {
          (el as HTMLElement).animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.15)' },
            { transform: 'scale(1)' }
          ], { duration: 600 + i * 80, easing: 'cubic-bezier(.68,-0.55,.27,1.55)' })
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={`min-h-screen flex flex-col bg-[#fdf6f0] relative overflow-hidden ${sora.className}`} ref={circlesRef}>
      {/* Animated Circles Background */}
      <svg className="absolute left-1/2 top-0 -translate-x-1/2 z-0 pointer-events-none" width="2200" height="1600" viewBox="0 0 2200 1600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="easter-egg-circle" cx="1100" cy="700" r="900" stroke="#14b8a6" strokeWidth="2.5" opacity="0.13">
          <animate attributeName="r" values="900;940;900" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle className="easter-egg-circle" cx="1100" cy="700" r="700" fill="#fca5a5" opacity="0.10">
          <animate attributeName="r" values="700;740;700" dur="10s" repeatCount="indefinite" />
        </circle>
        <circle className="easter-egg-circle" cx="1100" cy="700" r="500" stroke="#fbbf24" strokeWidth="2" opacity="0.13">
          <animate attributeName="r" values="500;540;500" dur="14s" repeatCount="indefinite" />
        </circle>
        <circle className="easter-egg-circle" cx="1100" cy="700" r="340" fill="#a7f3d0" opacity="0.18">
          <animate attributeName="r" values="340;370;340" dur="9s" repeatCount="indefinite" />
        </circle>
        <circle className="easter-egg-circle" cx="1100" cy="700" r="180" stroke="#38bdf8" strokeWidth="2" opacity="0.18">
          <animate attributeName="r" values="180;210;180" dur="11s" repeatCount="indefinite" />
        </circle>
      </svg>
      {/* Floating logo badge with spin on hover */}
      {repoData && (
        <button className="absolute top-6 left-8 z-20 flex items-center group bg-white/90 rounded-full shadow-lg px-4 py-2 border border-teal-200 hover:scale-105 transition" onClick={() => { setRepoUrl(''); setRepoData(null); setIssues([]); }} aria-label="Back to homepage">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:rotate-180">
            <circle cx="19" cy="19" r="18" stroke="#14b8a6" strokeWidth="2.5" fill="#fff" />
            <path d="M19 7L22 19L31 22L19 31L16 19L7 16L19 7Z" stroke="#14b8a6" strokeWidth="2.2" fill="#a7f3d0" />
          </svg>
          <span className="ml-2 text-lg font-bold text-teal-700 tracking-tight group-hover:underline">Code Compass</span>
        </button>
      )}
      <main className="flex-1 flex flex-col items-center justify-center z-10 relative px-4 w-full">
        {/* Show hero and input only if no repo loaded */}
        {!repoData && (
          <>
            {/* Logo integrated in hero */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-white rounded-full shadow-lg p-3 mb-2 border-2 border-teal-200 animate-float">
                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="27" cy="27" r="25" stroke="#14b8a6" strokeWidth="3" fill="#fff" />
                  <path d="M27 10L31 27L45 31L27 45L23 27L9 23L27 10Z" stroke="#14b8a6" strokeWidth="2.2" fill="#a7f3d0" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-teal-700 tracking-tight">Code Compass</span>
            </div>
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold text-center mb-4 leading-tight text-gray-900"
              style={{ letterSpacing: '-0.01em' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: [0.95, 1.05, 1] }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <span className="text-teal-600 animate-gradient-x bg-gradient-to-r from-teal-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Find your next</span>
              <br />
              <span className="text-coral-600">open source adventure</span>
            </motion.h1>
            <motion.p
              className="text-lg text-gray-700 text-center max-w-xl mb-8 font-sans"
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
                  className="w-full max-w-md px-5 py-4 border border-teal-200 rounded-full focus:ring-2 focus:ring-teal-400 focus:border-transparent text-gray-900 shadow transition-all duration-200 bg-white text-center font-sans"
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                  whileFocus={{ scale: 1.03, boxShadow: '0 0 0 4px #14b8a6' }}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !repoUrl.trim()}
                  className="w-full max-w-xs px-7 py-4 bg-gradient-to-r from-teal-400 to-pink-400 text-white rounded-full font-bold hover:from-teal-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 text-lg font-sans relative overflow-hidden"
                  whileHover={{ scale: 1.06, boxShadow: '0 0 24px 2px #14b8a6' }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
                >
                  <span className="relative z-10">{isLoading ? (<Loader2 className="w-5 h-5 animate-spin mx-auto" />) : ('Get started')}</span>
                </motion.button>
            </form>
          </>
        )}
        {/* Repo loaded: show repo info, filters, issues, etc. */}
        {repoData && (
          <div className="w-full flex flex-col items-center pt-20">
            {/* Repo info card */}
            <motion.div className="max-w-4xl w-full mx-auto mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-teal-200 flex flex-col md:flex-row items-center justify-between gap-6 animate-float">
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
              <a href={repoData.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-pink-500 font-bold">View on GitHub →</a>
            </motion.div>
            {/* Filter bar */}
            <div className="w-full max-w-6xl flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-teal-400" />
                <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="px-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 text-gray-900 bg-white font-bold">
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <span className="text-gray-600 font-bold">{filteredIssues.length} of {issues.length} issues</span>
              </div>
              {getRecommendedIssue() && (
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} onClick={() => { const recommended = getRecommendedIssue(); if (recommended) { window.open(recommended.url, '_blank'); } }} className="px-4 py-2 bg-gradient-to-r from-teal-400 to-pink-400 text-white rounded-full hover:from-teal-500 hover:to-pink-500 font-bold flex items-center gap-2 shadow-lg">
                  <Star className="w-4 h-4" />
                  Recommended Issue
                </motion.button>
              )}
            </div>
            {/* Issues grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
              {(showAll ? filteredIssues : aiIssues).map((issue) => (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3, delay: 0.05 * (issue.ai ? aiIssues.indexOf(issue) : 0) }}>
                  <IssueCard issue={issue} className="bg-white border-2 border-teal-100 rounded-2xl shadow-xl p-6 hover:scale-[1.025] hover:shadow-2xl transition-transform duration-200" />
                </motion.div>
              ))}
              {/* Loading animation for AI issues */}
              {isLoading && !showAll && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 p-6 flex flex-col gap-4 animate-pulse" />
              ))}
            </div>
            {/* Load More Button */}
            {!showAll && fallbackIssues.length > 0 && !isLoading && (
              <div className="flex justify-center mt-8">
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAll(true)} className="px-6 py-3 bg-gradient-to-r from-teal-400 to-pink-400 text-white rounded-full hover:from-teal-500 hover:to-pink-500 font-bold shadow-lg">Load more issues</motion.button>
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
          Built by <a href="https://farooqureshi.com" target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-teal-500">Farooq</a>
        </div>
      )}
    </div>
  )
} 