import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'

export default function WhyUsCard() {
  const { getCardContent } = useEditableContent()
  const content = getCardContent('why-us')

  return (
    <CardWithName cardId="why-us" cardName="Why Us Card">
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
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
