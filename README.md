# Code Compass 🧭

A web application that helps developers (especially new contributors) understand GitHub repositories and find good first issues to work on.

## Features

- **Repository Analysis**: Input any public GitHub repository URL
- **AI Issue Summaries**: Uses Groq's Llama 3 model for high-quality, real-time summaries
- **Difficulty Assessment**: Categorizes issues as Easy, Medium, or Hard
- **Estimated Time to Complete**: AI estimates how long each issue might take
- **Assignee Display**: Shows who is assigned to each issue (with avatars)
- **How to Contribute**: Extracts and displays the "Contributing" section from the repo's README
- **File Suggestions**: Suggests which files are likely to be edited
- **Filtering**: Filter issues by difficulty level
- **Recommendations**: Get AI-powered issue recommendations for beginners
- **Load More**: First 5 issues use real AI, rest use fast heuristics (with "Load more" button)

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **APIs**: GitHub REST API + Groq Llama 3 API
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token
- Groq API Key (free, generous tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd code-compass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # GitHub API (Required)
   GITHUB_TOKEN=ghp_your_github_token_here
   
   # Groq API (Required for AI features)
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Get API Keys**

   **GitHub Token:**
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `public_repo` scope
   - Copy the token to your `.env.local` file

   **Groq API Key:**
   - Go to [groq.com](https://groq.com/) and sign up
   - Create an API key from your dashboard
   - Copy the key to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a GitHub repository URL** (e.g., `https://github.com/vercel/next.js`)
2. **Click "Analyze"** to fetch and process the repository
3. **Browse issues** with AI-generated summaries, time estimates, and difficulty ratings
4. **Filter by difficulty** to find suitable issues for your skill level
5. **Click "Recommended Issue"** for AI-suggested beginner-friendly issues
6. **Click on any issue** to view it on GitHub
7. **Click "Load more issues"** to see additional issues (processed with fast heuristics)

## How It Works

### Issue Analysis Process

1. **Fetch Issues**: Retrieves open issues from the GitHub API
2. **AI Processing**: Uses Groq Llama 3 to:
   - Generate concise summaries
   - Estimate time to complete
   - Assess difficulty based on content and labels (heuristic)
   - Suggest relevant files to edit (heuristic)
3. **Display Results**: Shows processed issues in an easy-to-scan format

### Difficulty Assessment

The AI analyzes issue content and labels to categorize difficulty:

- **Easy**: Documentation, typo fixes, simple UI changes
- **Medium**: Bug fixes, feature additions, refactoring
- **Hard**: Core functionality, performance optimization, security fixes

## API Endpoints

### POST `/api/analyze-repo`

Analyzes a GitHub repository and returns processed issues.

**Request Body:**
```json
{
  "repoUrl": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "repoData": {
    "name": "repo-name",
    "description": "Repository description",
    "url": "https://github.com/owner/repo",
    "stars": 1000,
    "language": "JavaScript",
    "contributingGuide": "..."
  },
  "issues": [
    {
      "id": 123,
      "title": "Issue title",
      "summary": "AI-generated summary",
      "difficulty": "easy",
      "estimatedTime": "1-3 hours",
      "assignees": [
        { "login": "octocat", "avatar_url": "...", "html_url": "..." }
      ],
      "suggestedFiles": ["src/components/Button.js"],
      "url": "https://github.com/owner/repo/issues/123",
      "ai": true
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] AI-powered label suggestions
- [ ] Show issue comments/discussion previews
- [ ] StackBlitz/Codesandbox integration for quick setup
- [ ] Issue bookmarking and favorites
- [ ] Advanced filtering (by language, labels, etc.)
- [ ] User accounts and issue history

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- GitHub API for repository data
- Groq for blazing-fast LLM inference
- Next.js team for the amazing framework
- Tailwind CSS for the beautiful styling 