import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'

export default function InvestmentTermsCard() {
  const { getCardContent } = useEditableContent()
  const content = getCardContent('investment-terms')

  return (
    <CardWithName cardId="investment-terms" cardName="Investment Terms Card">
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
            {content.plans?.map((plan, index) => (
              <div key={index} className={`border rounded-lg p-3 ${plan.highlighted ? 'bg-primary/5 border-primary' : 'bg-muted/50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">{plan.name}</h4>
                  <span className="text-lg font-bold text-primary">{plan.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  {plan.features?.map((feature, featureIndex) => (
                    <li key={featureIndex}>• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              {content.guarantee}
            </p>
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
