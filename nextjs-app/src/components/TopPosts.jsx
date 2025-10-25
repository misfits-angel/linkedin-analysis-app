'use client'

import { useState } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/CardWithName'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function TopPosts({ data }) {
  const [expandedPosts, setExpandedPosts] = useState(new Set())
  const posts = data?.posts || []
  
  if (posts.length === 0) {
    return (
      <Card cardName="Top Posts Card">
        <CardHeader className="pb-0">
          <CardTitle>🏆 Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 -mt-12">
          <div className="text-sm text-muted-foreground">No post-level data available. Upload CSV to enable this.</div>
        </CardContent>
      </Card>
    )
  }

  // Sort posts by engagement and take top 3
  const topPosts = posts
    .map((p, index) => ({ 
      ...p, 
      eng: p.eng || (Number(p.likes || 0) + Number(p.comments || 0) + Number(p.reposts || 0)),
      originalIndex: index
    }))
    .sort((a, b) => b.eng - a.eng)
    .slice(0, 3)

  const togglePostExpansion = (index) => {
    const newExpanded = new Set(expandedPosts)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPosts(newExpanded)
  }

  const formatMonth = (month) => {
    if (!month) return '-'
    if (/^\d{4}-\d{2}$/.test(month)) {
      const [y, mm] = month.split('-')
      const d = new Date(Number(y), Number(mm) - 1, 1)
      return d.toLocaleString('en-US', { month: 'short' }) + " '" + String(y).slice(-2)
    }
    return month
  }

  const clipContent = (content, maxLength = 120) => {
    if (!content) return ''
    return content.length > maxLength ? content.slice(0, maxLength - 1) + '…' : content
  }

  return (
    <Card cardName="Top Posts Card">
      <CardHeader className="pb-0">
        <CardTitle>🏆 Top Performing Posts</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 -mt-12">
      
      <div className="space-y-3">
        {topPosts.map((post, index) => {
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
                <Collapsible open={isExpanded} onOpenChange={() => togglePostExpansion(index)}>
                  <div>
                    {isExpanded ? post.content : clippedContent}
                    {needsExpansion && (
                      <CollapsibleTrigger asChild>
                        <a className="text-gray-500 hover:text-gray-700 ml-1 text-xs underline cursor-pointer">
                          {isExpanded ? 'Show less' : 'Show more'}
                        </a>
                      </CollapsibleTrigger>
                    )}
                  </div>
                </Collapsible>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Month: {formatMonth(post.month)}
              </div>
              
            </div>
          )
        })}
      </div>
      </CardContent>
    </Card>
  )
}
