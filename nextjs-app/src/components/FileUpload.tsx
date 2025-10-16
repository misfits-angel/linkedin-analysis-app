'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'

interface FileUploadProps {
  onFileUpload: (csvData: any[]) => void
  isLoading?: boolean
}

export default function FileUpload({ onFileUpload, isLoading = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      processFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const processFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors)
        }
        
        if (results.data && results.data.length > 0) {
          onFileUpload(results.data)
        } else {
          console.error('No data found in CSV file')
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
      }
    })
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="menu-container relative">
      <button 
        onClick={handleButtonClick}
        disabled={isLoading}
        className="menu-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Upload CSV"
      >
        {isLoading ? '⏳ Processing...' : '📊 Upload CSV'}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload CSV data file"
      />

      {/* Drag and drop overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
          isDragOver ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-xl font-semibold">Drop your CSV file here</div>
          <div className="text-gray-600 mt-2">Release to upload and analyze</div>
        </div>
      </div>
    </div>
  )
}
