'use client'

import Card, { CardContent } from '@/components/CardWithName'
import ConditionalCard from './ConditionalCard'
import PostTypeDistribution from './PostTypeDistribution'

export default function PostTypeDistributionCard({ data }) {
  if (!data?.mix?.type_share) {
    return null
  }

  return (
    <ConditionalCard cardId="post-type-mosaic">
      <Card cardName="Post Type Distribution Card">
        <CardContent>
          <div className="flex justify-center items-start">
            <div className="w-full max-w-[500px]">
              <PostTypeDistribution
                data={(() => {
                  const entries = Object.entries(data.mix.type_share);
                  return entries.map(([type, share]) => ({
                    type: type.charAt(0).toUpperCase() + type.slice(1),
                    value: Math.round((share || 0) * 100),
                    color: undefined
                  }));
                })()}
                options={{
                  columns: 1,
                  preferOneColumnForThree: false,
                  minH: 80,
                  maxH: 250,
                  unit: 2.5
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </ConditionalCard>
  )
}