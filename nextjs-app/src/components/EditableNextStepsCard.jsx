import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'
import { useState } from 'react'

export default function EditableNextStepsCard() {
  const { getCardContent, updateCardField, addCardItem, updateCardItem, removeCardItem, isEditMode } = useEditableContent()
  const [editingField, setEditingField] = useState(null)
  const [tempValue, setTempValue] = useState('')
  
  const content = getCardContent('next-steps')

  const handleEdit = (field, currentValue) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSave = () => {
    if (editingField) {
      updateCardField('next-steps', editingField, tempValue)
      setEditingField(null)
      setTempValue('')
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleAddStep = () => {
    const nextNumber = (content.steps?.length || 0) + 1
    addCardItem('next-steps', 'steps', {
      number: nextNumber,
      title: 'New Step',
      description: 'Step description'
    })
  }

  const handleUpdateStep = (index, field, value) => {
    updateCardItem('next-steps', 'steps', index, { [field]: value })
  }

  const handleRemoveStep = (index) => {
    removeCardItem('next-steps', 'steps', index)
    // Renumber remaining steps
    const updatedSteps = content.steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      number: i + 1
    }))
    updateCardField('next-steps', 'steps', updatedSteps)
  }

  return (
    <CardWithName cardId="next-steps" cardName="Next Steps Card">
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
            {content.steps?.map((step, index) => (
              <div key={`step-${index}-${step.title}`} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {isEditMode ? (
                    <Input
                      value={step.number}
                      onChange={(e) => handleUpdateStep(index, 'number', parseInt(e.target.value) || 1)}
                      className="w-8 h-6 text-xs text-center p-0 border-0 bg-transparent"
                      type="number"
                      min="1"
                    />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="space-y-2">
                      <Input
                        value={step.title}
                        onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                        className="font-medium text-sm"
                        placeholder="Step title"
                      />
                      <Textarea
                        value={step.description}
                        onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                        className="text-xs text-muted-foreground min-h-[40px]"
                        placeholder="Step description"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddStep}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            )}
          </div>
          
          <div className="pt-4 space-y-3">
            <Button className="w-full" size="lg">
              {isEditMode && editingField === 'buttonText' ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="text-center"
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
                  {content.buttonText}
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('buttonText', content.buttonText)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Or contact us directly at{' '}
                {isEditMode && editingField === 'contactEmail' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="text-primary hover:underline text-xs"
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
                    <a href={`mailto:${content.contactEmail}`} className="text-primary hover:underline">
                      {content.contactEmail}
                    </a>
                    {isEditMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit('contactEmail', content.contactEmail)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
