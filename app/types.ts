export interface Issue {
  id: number
  title: string
  body: string
  url: string
  number: number
  state: string
  labels: Label[]
  summary: string
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedFiles: string[]
  createdAt: string
  updatedAt: string
  assignees: Assignee[]
  estimatedTime: string
}

export interface Label {
  id: number
  name: string
  color: string
  description?: string
}

export interface RepoData {
  name: string
  description: string
  url: string
  stars: number
  language: string
  readme?: string
  contributingGuide?: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string
  html_url: string
  state: string
  labels: GitHubLabel[]
  created_at: string
  updated_at: string
  assignees: GitHubAssignee[]
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
  description?: string
}

export interface GitHubRepo {
  name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
}

export interface Assignee {
  login: string
  avatar_url: string
  html_url: string
}

export interface GitHubAssignee {
  login: string
  avatar_url: string
  html_url: string
} 