'use client'

import { useState, useEffect } from 'react'
import Card, { CardContent } from '@/components/CardWithName'

export default function ValueProposition({ data }) {
  const [hourlyRate, setHourlyRate] = useState(50)
  const [serviceFee, setServiceFee] = useState(500)
  const [showConfig, setShowConfig] = useState(false)

  // Calculate current metrics
  const currentPosts = data?.summary?.posts_last_12m || 0
  const currentMedianEngagement = data?.summary?.median_engagement || 0
  const currentP90Engagement = data?.summary?.p90_engagement || 0
  const currentActiveMonths = data?.summary?.active_months || 0

  // Calculate time investment (assuming 40-45 minutes per post)
  const avgTimePerPost = 45 // minutes per post
  const currentTimeInvestmentHours = Math.round((currentPosts * avgTimePerPost) / 60) // hours per year
  const currentTimePerWeek = Math.round((currentTimeInvestmentHours / 52) * 7) // hours per week

  // Calculate future projections with Unstoppable
  const futurePostsPerYear = 250 // ~250 posts per year
  const futureTimePerWeek = 15 // 15 minutes per week
  const futureTimeInvestmentHours = Math.round((futureTimePerWeek * 52) / 60) // hours per year

  // Engagement improvements (6x based on better content strategy)
  const engagementMultiplier = 6
  const futureMedianEngagement = Math.round(currentMedianEngagement * engagementMultiplier)
  const futureP90Engagement = Math.round(currentP90Engagement * engagementMultiplier)

  // Calculate cost per post (current state - no service fee)
  const timeValueOfMoney = currentTimeInvestmentHours * hourlyRate
  const costPerPost = currentPosts > 0 ? Math.round((timeValueOfMoney / currentPosts) * 100) / 100 : 0

  // Calculate future time value of money
  const futureTimeValueOfMoney = futureTimeInvestmentHours * hourlyRate
  const annualServiceFee = serviceFee * 12
  const totalFutureCost = futureTimeValueOfMoney + annualServiceFee
  const futureCostPerPost = futurePostsPerYear > 0 ? Math.round((totalFutureCost / futurePostsPerYear) * 100) / 100 : 0

  return (
    <Card cardName="Value Proposition Card" className="bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-200 relative">
      <CardContent>
        {/* Configuration Toggle */}
        <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
          title="Customize time value calculations"
        >
          ⋯
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-gray-800 mb-2">
          🚀 Transform Your LinkedIn Presence with Unstoppable
        </div>
        <div className="text-sm text-gray-600">
          See how our AI-powered content creation can multiply your impact
        </div>
      </div>
      
      {/* Cost per hour input - Hidden by default */}
      {showConfig && (
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="font-semibold text-gray-800 mb-2">💰 Configure the values</div>
            </div>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">Cost per hour:</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input 
                    type="number" 
                    id="hourlyRate" 
                    value={hourlyRate} 
                    min="10" 
                    max="500" 
                    step="5"
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-600 text-sm">/hour</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="serviceFee" className="text-sm font-medium text-gray-700">Service fee:</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input 
                    type="number" 
                    id="serviceFee" 
                    value={serviceFee} 
                    min="100" 
                    max="2000" 
                    step="50"
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-600 text-sm">/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 max-w-4xl mx-auto">
        {/* Current State */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <div className="font-semibold text-gray-800">Your Current State</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Posts per year:</span>
              <span className="font-semibold text-gray-800">{currentPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time investment:</span>
              <span className="font-semibold text-gray-800">~{avgTimePerPost} mins/post</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time per year:</span>
              <span className="font-semibold text-gray-800">{currentTimeInvestmentHours} hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time value of money:</span>
              <span className="font-semibold text-gray-800">${timeValueOfMoney.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost per post:</span>
              <span className="font-semibold text-orange-600">${costPerPost}</span>
            </div>
          </div>
        </div>
        
        {/* Future State with Unstoppable */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="font-semibold text-gray-800">With Unstoppable Content Creation</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Posts per year:</span>
              <span className="font-semibold text-green-600">~{futurePostsPerYear}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time per week:</span>
              <span className="font-semibold text-green-600">{futureTimePerWeek} mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time per year:</span>
              <span className="font-semibold text-green-600">{futureTimeInvestmentHours} hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service fee (annual):</span>
              <span className="font-semibold text-green-600">${annualServiceFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost per post:</span>
              <span className="font-semibold text-green-600">${futureCostPerPost}</span>
            </div>
          </div>
        </div>
      </div>
      
        {/* Value Proposition Highlight */}
        <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-lg font-semibold text-gray-800 mb-2">
            🎯 Get Multifold Output with Fractional Time Investment
          </div>
          <div className="text-sm text-gray-600">
            Spend less than half the time while achieving exponentially better results
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
