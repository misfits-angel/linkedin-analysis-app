import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'
import { useState } from 'react'

export default function EditableInvestmentTermsCard() {
  const { getCardContent, updateCardField, addCardItem, updateCardItem, removeCardItem, isEditMode } = useEditableContent()
  const [editingField, setEditingField] = useState(null)
  const [tempValue, setTempValue] = useState('')
  
  const content = getCardContent('investment-terms')

  const handleEdit = (field, currentValue) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSave = () => {
    if (editingField) {
      updateCardField('investment-terms', editingField, tempValue)
      setEditingField(null)
      setTempValue('')
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleAddPlan = () => {
    addCardItem('investment-terms', 'plans', {
      name: 'New Plan',
      price: '$0',
      description: 'Plan description',
      features: ['Feature 1', 'Feature 2'],
      highlighted: false
    })
  }

  const handleUpdatePlan = (index, field, value) => {
    updateCardItem('investment-terms', 'plans', index, { [field]: value })
  }

  const handleUpdatePlanFeature = (planIndex, featureIndex, value) => {
    const plan = content.plans[planIndex]
    const updatedFeatures = [...plan.features]
    updatedFeatures[featureIndex] = value
    handleUpdatePlan(planIndex, 'features', updatedFeatures)
  }

  const handleAddPlanFeature = (planIndex) => {
    const plan = content.plans[planIndex]
    const updatedFeatures = [...plan.features, 'New feature']
    handleUpdatePlan(planIndex, 'features', updatedFeatures)
  }

  const handleRemovePlanFeature = (planIndex, featureIndex) => {
    const plan = content.plans[planIndex]
    const updatedFeatures = plan.features.filter((_, i) => i !== featureIndex)
    handleUpdatePlan(planIndex, 'features', updatedFeatures)
  }

  const handleRemovePlan = (index) => {
    removeCardItem('investment-terms', 'plans', index)
  }

  return (
    <CardWithName cardId="investment-terms" cardName="Investment Terms Card">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            {isEditMode && editingField === 'title' ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="text-xl font-bold text-center"
                />
                <Button size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {content.title}
                {isEditMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit('title', content.title)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="text-4xl mb-4">
              {isEditMode && editingField === 'emoji' ? (
                <div className="flex items-center justify-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="text-4xl text-center w-20"
                  />
                  <Button size="sm" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {content.emoji}
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('emoji', content.emoji)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold">
              {isEditMode && editingField === 'subtitle' ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="text-lg font-semibold text-center"
                  />
                  <Button size="sm" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {content.subtitle}
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('subtitle', content.subtitle)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </h3>
            
            <p className="text-muted-foreground text-sm">
              {isEditMode && editingField === 'description' ? (
                <div className="flex items-start gap-2">
                  <Textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="text-muted-foreground text-sm min-h-[60px]"
                  />
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={handleSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-center gap-2">
                  <span className="text-center">{content.description}</span>
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('description', content.description)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </p>
          </div>
          
          <div className="space-y-4">
            {content.plans?.map((plan, planIndex) => (
              <div key={`plan-${planIndex}-${plan.name}`} className={`border rounded-lg p-3 ${plan.highlighted ? 'bg-primary/5 border-primary' : 'bg-muted/50'}`}>
                {isEditMode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={plan.name}
                        onChange={(e) => handleUpdatePlan(planIndex, 'name', e.target.value)}
                        className="font-medium text-sm"
                        placeholder="Plan name"
                      />
                      <Input
                        value={plan.price}
                        onChange={(e) => handleUpdatePlan(planIndex, 'price', e.target.value)}
                        className="text-lg font-bold text-primary w-24"
                        placeholder="Price"
                      />
                      <Button
                        size="sm"
                        variant={plan.highlighted ? "default" : "outline"}
                        onClick={() => handleUpdatePlan(planIndex, 'highlighted', !plan.highlighted)}
                      >
                        {plan.highlighted ? 'Featured' : 'Feature'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePlan(planIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Input
                      value={plan.description}
                      onChange={(e) => handleUpdatePlan(planIndex, 'description', e.target.value)}
                      className="text-xs text-muted-foreground"
                      placeholder="Plan description"
                    />
                    
                    <div className="space-y-2">
                      {plan.features?.map((feature, featureIndex) => (
                        <div key={`feature-${planIndex}-${featureIndex}-${feature.substring(0, 20)}`} className="flex items-center gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleUpdatePlanFeature(planIndex, featureIndex, e.target.value)}
                            className="text-xs text-muted-foreground"
                            placeholder="Feature"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePlanFeature(planIndex, featureIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPlanFeature(planIndex)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">{plan.name}</h4>
                      <span className="text-lg font-bold text-primary">{plan.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      {plan.features?.map((feature, featureIndex) => (
                        <li key={`feature-display-${planIndex}-${featureIndex}`}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPlan}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            )}
          </div>
          
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              {isEditMode && editingField === 'guarantee' ? (
                <div className="flex items-center justify-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="text-xs text-muted-foreground text-center"
                  />
                  <Button size="sm" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {content.guarantee}
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('guarantee', content.guarantee)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
