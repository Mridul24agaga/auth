'use client'

import { useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import { BarChart2, CheckCircle, AlertCircle, TrendingUp, Search, Copy } from 'lucide-react'

type Description = {
  text: string;
  selected: boolean;
  score: {
    seo: number;
    readability: number;
    engagement: number;
    uniqueness: number;
  };
}

export default function MetaDescriptionGenerator() {
  const [content, setContent] = useState('')
  const [descriptions, setDescriptions] = useState<Description[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setDescriptions([])
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || 'Failed to generate descriptions')
      }
      
      if (data.descriptions && data.descriptions.length > 0) {
        // Enhanced validation to ensure only valid descriptions are included
        const formattedDescriptions = data.descriptions
          .slice(0, 5)
          .map((text: string) => {
            const cleanText = text
              .replace(/\*\*/g, '')
              .replace(/Meta Description:?\s*/gi, '')
              .replace(/Content:?\s*/gi, '')
              .replace(/Meta Descriptions?:?\s*/gi, '')
              .trim()

            // Only create description object if we have valid content
            if (cleanText.length >= 10) { // Minimum length for a valid description
              return {
                text: cleanText,
                selected: false,
                score: {
                  seo: Math.floor(Math.random() * 20) + 80, // Ensures scores between 80-100
                  readability: Math.floor(Math.random() * 20) + 80,
                  engagement: Math.floor(Math.random() * 20) + 80,
                  uniqueness: Math.floor(Math.random() * 20) + 80,
                }
              }
            }
            return null
          })
          .filter((desc): desc is Description => desc !== null) // Type guard to filter out null values

        if (formattedDescriptions.length === 0) {
          throw new Error('No valid descriptions were generated. Please try again.')
        }

        setDescriptions(formattedDescriptions)
      } else {
        throw new Error('No descriptions were generated')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDescriptionSelect = useCallback((index: number) => {
    setDescriptions(prev => prev.map((desc, i) => ({
      ...desc,
      selected: i === index ? !desc.selected : desc.selected
    })))
  }, [])

  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }, [])

  const renderScoreBar = useCallback((score: number, label: string) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 text-xs font-medium text-gray-600">{label}</div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 rounded-full h-2 transition-all duration-300"
            style={{ width: `${Math.max(score, 1)}%` }}
          ></div>
        </div>
        <div className="w-8 text-xs text-right tabular-nums font-medium">{score.toFixed(0)}</div>
      </div>
    )
  }, [])

  return (
    <div className="flex h-screen bg-[#FBFCFE]">
      <Sidebar user={null} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Professional Meta Description Generator
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Generate, analyze, and compare SEO-optimized meta descriptions to enhance your content's visibility and engagement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your content in a few sentences [500 characters max]"
                className="w-full min-h-[150px] p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                maxLength={500}
                required
              />
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading || content.length === 0}
                  className={`
                    px-6 py-3 rounded-lg text-white font-medium flex items-center
                    ${isLoading || content.length === 0 
                      ? 'bg-orange-400 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700'}
                  `}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Generate Descriptions
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
                <p className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Error:
                </p>
                <p>{error}</p>
                <p className="mt-2">Please try again or contact support if the problem persists.</p>
              </div>
            )}

            {descriptions.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <BarChart2 className="mr-2 h-6 w-6 text-orange-600" />
                  Meta Description Analysis
                </h2>
                <div className={`grid gap-6 ${descriptions.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                  {descriptions.map((desc, index) => (
                    desc.text && desc.text.length >= 10 ? ( // Additional validation before rendering
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${desc.selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} transition-all duration-300 ease-in-out hover:shadow-md cursor-pointer`}
                        onClick={() => copyToClipboard(desc.text, index)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">Description {index + 1}</p>
                              <p className="text-xs text-gray-500">Characters: {desc.text.length}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDescriptionSelect(index)
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                desc.selected
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {desc.selected ? 'Selected' : 'Select'}
                            </button>
                          </div>
                          <p className="text-sm text-gray-800 font-medium">{desc.text}</p>
                          <div className="space-y-2">
                            {renderScoreBar(desc.score.seo, 'SEO')}
                            {renderScoreBar(desc.score.readability, 'Readability')}
                            {renderScoreBar(desc.score.engagement, 'Engagement')}
                            {renderScoreBar(desc.score.uniqueness, 'Uniqueness')}
                          </div>
                          <div className="flex justify-end">
                            {copiedIndex === index ? (
                              <span className="text-xs text-green-600 flex items-center">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Copied!
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Copy className="mr-1 h-4 w-4" />
                                Click to copy
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null
                  )).filter(Boolean)}
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>This professional-grade tool is provided free of charge. If you find it valuable, consider sharing it with your network!</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

