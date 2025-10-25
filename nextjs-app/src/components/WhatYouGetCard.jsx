import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'

export default function WhatYouGetCard() {
  const { getCardContent } = useEditableContent()
  const content = getCardContent('what-you-get')

  return (
    <CardWithName cardId="what-you-get" cardName="What You Get Card">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">{content.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="text-4xl mb-4">{content.emoji}</div>
            <h3 className="text-lg font-semibold">{content.subtitle}</h3>
            <p className="text-muted-foreground text-sm">
              {content.description}
            </p>
          </div>
          
          <div className="space-y-3">
            {content.features?.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
