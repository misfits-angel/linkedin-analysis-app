import WhyUsCard from '@/components/WhyUsCard'
import HowWeWorkCard from '@/components/HowWeWorkCard'
import WhatYouGetCard from '@/components/WhatYouGetCard'
import InvestmentTermsCard from '@/components/InvestmentTermsCard'
import NextStepsCard from '@/components/NextStepsCard'
import EditableWhyUsCard from '@/components/EditableWhyUsCard'
import EditableHowWeWorkCard from '@/components/EditableHowWeWorkCard'
import EditableWhatYouGetCard from '@/components/EditableWhatYouGetCard'
import EditableInvestmentTermsCard from '@/components/EditableInvestmentTermsCard'
import EditableNextStepsCard from '@/components/EditableNextStepsCard'
import ConditionalCard from '@/components/ConditionalCard'
import { Button } from '@/components/ui/button'
import { Edit2, Save, RotateCcw, CheckCircle, Clock } from 'lucide-react'
import { useEditableContent } from '@/lib/contexts/EditableContentContext'

export default function UnstoppableSection() {
  const { isEditMode, toggleEditMode, resetToDefaults, isSaving, lastSaved, saveContent } = useEditableContent()
  
  // Check if we're in a shared report (no localStorage saving)
  const isSharedReport = typeof window !== 'undefined' && !localStorage.getItem('unstoppableContent')

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-3xl font-bold">Unstoppable</h2>
          {!isSharedReport && (
            <div className="flex gap-2">
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={toggleEditMode}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditMode ? 'Exit Edit' : 'Edit Content'}
              </Button>
              {isEditMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveContent}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Now'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <p className="text-muted-foreground">Your path to LinkedIn success starts here</p>
        {isEditMode && !isSharedReport && (
          <div className="space-y-2">
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              ✏️ Edit mode is active. Click on any text or content to edit it directly.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              {isSaving ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Saving changes...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Saved at {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Single Column Layout for Unstoppable Cards */}
      <div className="grid grid-cols-1 gap-6">
        <ConditionalCard cardId="why-us">
          {isEditMode ? <EditableWhyUsCard /> : <WhyUsCard />}
        </ConditionalCard>
        <ConditionalCard cardId="how-we-work">
          {isEditMode ? <EditableHowWeWorkCard /> : <HowWeWorkCard />}
        </ConditionalCard>
        <ConditionalCard cardId="what-you-get">
          {isEditMode ? <EditableWhatYouGetCard /> : <WhatYouGetCard />}
        </ConditionalCard>
        <ConditionalCard cardId="investment-terms">
          {isEditMode ? <EditableInvestmentTermsCard /> : <InvestmentTermsCard />}
        </ConditionalCard>
        <ConditionalCard cardId="next-steps">
          {isEditMode ? <EditableNextStepsCard /> : <NextStepsCard />}
        </ConditionalCard>
      </div>
    </section>
  )
}
