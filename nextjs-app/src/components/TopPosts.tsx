'use client'

import { useState } from 'react'

interface TopPostsProps {
  data: any
}

export default function TopPosts({ data }: TopPostsProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set())
  const posts = data?.posts || []
  
  if (posts.length === 0) {
    return (
      <div className="card p-4">
        <div className="section-title mb-2">Top Performing Posts</div>
        <div className="text-sm text-gray-500">No post-level data available. Upload CSV to enable this.</div>
      </div>
    )
  }

  // Sort posts by engagement and take top 3
  const topPosts = posts
    .map((p: any, index: number) => ({ 
      ...p, 
      eng: p.eng || (Number(p.likes || 0) + Number(p.comments || 0) + Number(p.reposts || 0)),
      originalIndex: index
    }))
    .sort((a: any, b: any) => b.eng - a.eng)
    .slice(0, 3)

  const togglePostExpansion = (index: number) => {
    const newExpanded = new Set(expandedPosts)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPosts(newExpanded)
  }

  const formatMonth = (month: string) => {
    if (!month) return '-'
    if (/^\d{4}-\d{2}$/.test(month)) {
      const [y, mm] = month.split('-')
      const d = new Date(Number(y), Number(mm) - 1, 1)
      return d.toLocaleString('en-US', { month: 'short' }) + " '" + String(y).slice(-2)
    }
    return month
  }

  const clipContent = (content: string, maxLength: number = 120) => {
    if (!content) return ''
    return content.length > maxLength ? content.slice(0, maxLength - 1) + '…' : content
  }

  return (
    <div className="card p-4">
      <div className="section-title mb-2">Top Performing Posts</div>
      
      <div className="space-y-3">
        {topPosts.map((post: any, index: number) => {
          const isExpanded = expandedPosts.has(index)
          const needsExpansion = post.content && post.content.length > 120
          const clippedContent = clipContent(post.content, 120)
          
          return (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-semibold">#{index + 1}</span> • 
                {(post.type || 'text').toUpperCase()} • 
                {post.eng} engagement
                {post.likes ? ` (${post.likes} likes, ${post.comments || 0} comments)` : ''}
              </div>
              
              <div className="text-sm text-gray-800">
                <span className="post-content-preview">{clippedContent}</span>
                {needsExpansion && (
                  <div className={`post-content-full mt-2 pt-2 border-t border-gray-200 ${isExpanded ? 'block' : 'hidden'}`}>
                    {post.content}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Month: {formatMonth(post.month)}
              </div>
              
              <div className="flex items-baseline gap-3 mt-2">
                {post.url && (
                  <a 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    🔗 View on LinkedIn
                  </a>
                )}
                {needsExpansion && (
                  <span
                    onClick={() => togglePostExpansion(index)}
                    className="text-blue-600 hover:text-blue-800 text-xs cursor-pointer"
                  >
                    {isExpanded ? '📕 Show less' : '📖 Read full post'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
