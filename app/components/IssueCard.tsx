import { ExternalLink, FileText, Tag, User, Clock } from 'lucide-react'
import { Issue } from '../types'

interface IssueCardProps {
  issue: Issue
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
          #{issue.number} {issue.title}
        </h3>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Difficulty Badge & Estimated Time */}
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(issue.difficulty)}`}>
          {issue.difficulty.charAt(0).toUpperCase() + issue.difficulty.slice(1)}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 ml-2">
          <Clock className="w-3 h-3" />
          {issue.estimatedTime}
        </span>
      </div>

      {/* Summary */}
      <p className="text-gray-600 text-sm mb-4">
        {issue.summary}
      </p>

      {/* Assignees */}
      <div className="mb-4 flex items-center gap-2">
        <User className="w-3 h-3 text-gray-400" />
        {issue.assignees && issue.assignees.length > 0 ? (
          <div className="flex -space-x-2">
            {issue.assignees.map((a) => (
              <a
                key={a.login}
                href={a.html_url}
                target="_blank"
                rel="noopener noreferrer"
                title={a.login}
                className="block border-2 border-white rounded-full"
              >
                <img
                  src={a.avatar_url}
                  alt={a.login}
                  className="w-6 h-6 rounded-full"
                />
              </a>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-500 ml-1">Unassigned</span>
        )}
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <Tag className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">Labels</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {issue.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `#${label.color}`,
                  color: parseInt(label.color, 16) > 0x888888 ? '#000' : '#fff'
                }}
              >
                {label.name}
              </span>
            ))}
            {issue.labels.length > 3 && (
              <span className="text-xs text-gray-500">
                +{issue.labels.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Suggested Files */}
      {issue.suggestedFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <FileText className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">Likely files to edit</span>
          </div>
          <div className="space-y-1">
            {issue.suggestedFiles.slice(0, 3).map((file, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                {file}
              </div>
            ))}
            {issue.suggestedFiles.length > 3 && (
              <span className="text-xs text-gray-500">
                +{issue.suggestedFiles.length - 3} more files
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>Updated {new Date(issue.updatedAt).toLocaleDateString()}</span>
        <button
          onClick={() => window.open(issue.url, '_blank')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View Issue →
        </button>
      </div>
    </div>
  )
} 