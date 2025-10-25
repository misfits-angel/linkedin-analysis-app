import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'

export default function HowWeWorkCard() {
  const { getCardContent } = useEditableContent()
  const content = getCardContent('how-we-work')

  return (
    <CardWithName cardId="how-we-work" cardName="How We Work Card">
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
          
          <div className="space-y-4">
            {content.steps?.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
