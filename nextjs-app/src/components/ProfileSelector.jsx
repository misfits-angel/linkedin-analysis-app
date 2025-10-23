'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ChevronDown, 
  Upload, 
  Trash2, 
  Calendar,
  BarChart3,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  ChevronUp,
  ChevronRight as ChevronRightIcon,
  Eye,
  EyeOff
} from 'lucide-react'
import { useDataPersistence } from '@/lib/hooks/useDataPersistence'

export function ProfileSelector({ 
  currentProfile, 
  onProfileSelect, 
  onUploadNew,
  showUploadButton = true,
  defaultCollapsed = false
}) {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, mostPosts, leastPosts, nameAZ, nameZA
  const [currentPage, setCurrentPage] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const profilesPerPage = 10
  const { loadAllDatasets, deleteDataset } = useDataPersistence()

  // Load all available datasets
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setLoading(true)
        const data = await loadAllDatasets()
        setDatasets(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load datasets:', err)
        setError('Failed to load profiles')
      } finally {
        setLoading(false)
      }
    }

    loadDatasets()
  }, [loadAllDatasets])

  // Filter, sort, and paginate datasets
  const filteredAndSortedDatasets = useMemo(() => {
    let filtered = datasets.filter(dataset => 
      dataset.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort datasets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'mostPosts':
          return (b.total_posts || 0) - (a.total_posts || 0)
        case 'leastPosts':
          return (a.total_posts || 0) - (b.total_posts || 0)
        case 'nameAZ':
          return a.author_name.localeCompare(b.author_name)
        case 'nameZA':
          return b.author_name.localeCompare(a.author_name)
        default:
          return 0
      }
    })

    return filtered
  }, [datasets, searchQuery, sortBy])

  // Paginate datasets
  const paginatedDatasets = useMemo(() => {
    const startIndex = (currentPage - 1) * profilesPerPage
    const endIndex = startIndex + profilesPerPage
    return filteredAndSortedDatasets.slice(startIndex, endIndex)
  }, [filteredAndSortedDatasets, currentPage, profilesPerPage])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredAndSortedDatasets.length / profilesPerPage)
  const totalFiltered = filteredAndSortedDatasets.length

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  const handleProfileSelect = (datasetId) => {
    if (datasetId && onProfileSelect) {
      onProfileSelect(datasetId)
    }
  }

  const handleDeleteProfile = async (datasetId, authorName) => {
    if (window.confirm(`Are you sure you want to delete ${authorName}'s profile?`)) {
      try {
        const success = await deleteDataset(datasetId)
        if (success) {
          // Remove from local state
          setDatasets(prev => prev.filter(ds => ds.id !== datasetId))
          // If this was the current profile, clear it
          if (currentProfile?.id === datasetId) {
            onProfileSelect(null)
          }
        }
      } catch (err) {
        console.error('Failed to delete profile:', err)
        alert('Failed to delete profile')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'N/A'
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${startDate} - ${endDate}`
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm text-muted-foreground">Loading profiles...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (datasets.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>No Profiles Available</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              No LinkedIn profiles have been uploaded yet.
            </p>
            {showUploadButton && (
              <Button onClick={onUploadNew} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload First Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Select Profile</span>
            <Badge variant="secondary">{totalFiltered}</Badge>
            {searchQuery && (
              <Badge variant="outline" className="text-xs">
                {datasets.length} total
              </Badge>
            )}
            {currentProfile && (
              <Badge variant="default" className="text-xs">
                {currentProfile.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
              title={isCollapsed ? "Show profile selector" : "Hide profile selector"}
            >
              {isCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            {showUploadButton && (
              <Button onClick={onUploadNew} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
      }`}>
        <CardContent className="space-y-4">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center space-x-2">
                    <SortDesc className="h-4 w-4" />
                    <span>Newest First</span>
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center space-x-2">
                    <SortAsc className="h-4 w-4" />
                    <span>Oldest First</span>
                  </div>
                </SelectItem>
                <SelectItem value="mostPosts">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Most Posts</span>
                  </div>
                </SelectItem>
                <SelectItem value="leastPosts">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Least Posts</span>
                  </div>
                </SelectItem>
                <SelectItem value="nameAZ">
                  <div className="flex items-center space-x-2">
                    <SortAsc className="h-4 w-4" />
                    <span>Name A-Z</span>
                  </div>
                </SelectItem>
                <SelectItem value="nameZA">
                  <div className="flex items-center space-x-2">
                    <SortDesc className="h-4 w-4" />
                    <span>Name Z-A</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Profiles Grid */}
        <div className="space-y-2">
          {paginatedDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                currentProfile?.id === dataset.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleProfileSelect(dataset.id)}
            >
              <div className="flex-1 min-w-0 flex items-center space-x-3">
                <h3 className="font-medium text-sm truncate">
                  {dataset.author_name}
                </h3>
                
                {currentProfile?.id === dataset.id && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
                
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{dataset.total_posts || 0}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(dataset.created_at)}</span>
                  </div>
                  
                  {dataset.median_engagement && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">📊</span>
                      <span>{dataset.median_engagement}</span>
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProfileSelect(dataset.id)
                    }}
                  >
                    View Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteProfile(dataset.id, dataset.author_name)
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * profilesPerPage) + 1} to {Math.min(currentPage * profilesPerPage, totalFiltered)} of {totalFiltered} profiles
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {totalFiltered > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            {searchQuery ? (
              <span>
                {totalFiltered} of {datasets.length} profiles match "{searchQuery}"
              </span>
            ) : (
              <span>
                {totalFiltered} profile{totalFiltered !== 1 ? 's' : ''} available
              </span>
            )}
          </div>
        )}
        </CardContent>
      </div>
    </Card>
  )
}

export default ProfileSelector
