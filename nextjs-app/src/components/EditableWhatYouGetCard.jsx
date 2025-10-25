import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import CardWithName from '@/components/CardWithName'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'
import { useState } from 'react'

export default function EditableWhatYouGetCard() {
  const { getCardContent, updateCardField, addCardItem, removeCardItem, isEditMode } = useEditableContent()
  const [editingField, setEditingField] = useState(null)
  const [tempValue, setTempValue] = useState('')
  
  const content = getCardContent('what-you-get')

  const handleEdit = (field, currentValue) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const handleSave = () => {
    if (editingField) {
      updateCardField('what-you-get', editingField, tempValue)
      setEditingField(null)
      setTempValue('')
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleAddFeature = () => {
    addCardItem('what-you-get', 'features', 'New feature')
  }

  const handleUpdateFeature = (index, value) => {
    const updatedFeatures = [...content.features]
    updatedFeatures[index] = value
    updateCardField('what-you-get', 'features', updatedFeatures)
  }

  const handleRemoveFeature = (index) => {
    removeCardItem('what-you-get', 'features', index)
  }

  return (
    <CardWithName cardId="what-you-get" cardName="What You Get Card">
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
          
          <div className="space-y-3">
            {content.features?.map((feature, index) => (
              <div key={`feature-${index}-${feature.substring(0, 20)}`} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleUpdateFeature(index, e.target.value)}
                        className="text-sm"
                        placeholder="Feature description"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm">{feature}</span>
                  )}
                </div>
              </div>
            ))}
            
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </CardWithName>
  )
}
