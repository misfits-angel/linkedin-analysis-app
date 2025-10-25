import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import ProfileSelector from '@/components/ProfileSelector'
import CardToggleSettings from '@/components/CardToggleSettings'
import MenuDropdown from '@/components/MenuDropdown'
import { useState } from 'react'

export default function AdminControlSection({ 
  currentProfile, 
  onProfileSelect, 
  onUploadNew, 
  showProfileSelector,
  shareableUrl,
  isShareableReportCollapsed,
  setIsShareableReportCollapsed,
  onGenerateReport,
  isGeneratingReport,
  onCopyUrl,
  onDeleteReport,
  isDeletingReport,
  data,
  savedData,
  isLoading,
  isInitialLoad,
  user,
  showCardNames,
  toggleCardNames,
  onFileUpload,
  onPrint,
  onDownloadPDF
}) {
  return (
    <section className="space-y-6">
      {/* Section Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold">Admin Control</h2>
          <p className="text-muted-foreground">Manage profiles, settings, and sharing options</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCardNames}
            className="text-xs"
          >
            {showCardNames ? '🙈 Hide Names' : '🏷️ Show Names'}
          </Button>
          <MenuDropdown
            onFileUpload={onFileUpload}
            onPrint={onPrint}
            onDownloadPDF={onDownloadPDF}
          />
        </div>
      </div>

      {/* Single Container with Three Collapsible Sections */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Admin Control Panel</span>
            <Badge variant="outline" className="text-xs">All Settings</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Profile Selection</h3>
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            </div>
            <ProfileSelector
              currentProfile={currentProfile}
              onProfileSelect={onProfileSelect}
              onUploadNew={onUploadNew}
              showUploadButton={true}
              defaultCollapsed={false}
            />
          </div>

          {/* Card Selection Form Section */}
          {!isLoading && !isInitialLoad && (data || savedData) && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Card Selection Form</h3>
                <Badge variant="secondary" className="text-xs">Settings</Badge>
              </div>
              <CardToggleSettings />
            </div>
          )}

          {/* Shareable Link Section */}
          {currentProfile && (
            <div className="space-y-2 pt-4 border-t">
              <div
                className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg p-2 -m-2"
                onClick={() => setIsShareableReportCollapsed(!isShareableReportCollapsed)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Shareable Link</h3>
                    <Badge variant="outline" className="text-xs">
                      {currentProfile.name}
                    </Badge>
                  </div>
                  {isShareableReportCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
              
              {/* Collapsible Content */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isShareableReportCollapsed ? 'max-h-0 opacity-0' : 'max-h-[200px] opacity-100'
              }`}>
                <div className="space-y-4">
                  {shareableUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={shareableUrl}
                          readOnly
                          className="flex-1"
                          placeholder="Report URL will appear here..."
                        />
                        <Button
                          onClick={onCopyUrl}
                          variant="outline"
                          size="sm"
                        >
                          Copy URL
                        </Button>
                        <Button
                          onClick={onDeleteReport}
                          disabled={isDeletingReport}
                          variant="destructive"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{isDeletingReport ? 'Deleting...' : 'Delete'}</span>
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Share this URL to give others access to view this report. No login required.
                        <br />
                        <span className="text-destructive font-medium">⚠️ Deleting will permanently remove this report and cannot be undone.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Generate a shareable URL for this report. Others can view it without logging in.
                      </div>
                      <Button
                        onClick={onGenerateReport}
                        disabled={isGeneratingReport}
                        className="w-full sm:w-auto"
                      >
                        {isGeneratingReport ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Shareable Report'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
