'use client'

import { useState, useRef, useEffect } from 'react'

export default function MenuDropdown({ onFileUpload, onPrint, onDownloadPDF }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const menuRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    console.log('isOpen state changed to:', isOpen)
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
      setIsOpen(false)
    }
  }

  const handlePrint = () => {
    onPrint()
    setIsOpen(false)
  }

  const handleDownloadPDF = async () => {
    setIsPdfGenerating(true)
    try {
      await onDownloadPDF()
    } finally {
      setIsPdfGenerating(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="menu-container relative" ref={menuRef}>
      <button 
        className="menu-btn" 
        title="Options"
        onClick={() => {
          console.log('Menu clicked, current state:', isOpen)
          console.log('Setting isOpen to:', !isOpen)
          setIsOpen(!isOpen)
        }}
      >
        ⋮
      </button>
      
      {isOpen && (
        <div className="menu-dropdown active">
          <label className="menu-item" role="button" tabIndex={0}>
            <span>📊</span>
            <span>Upload CSV</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv,text/csv" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </label>
          
          <div className="h-px bg-gray-200 my-1"></div>
          
          <div 
            className="menu-item" 
            title="Download page as PDF"
            onClick={handleDownloadPDF}
          >
            <span>📄</span>
            <span>{isPdfGenerating ? 'Generating...' : 'Download PDF'}</span>
          </div>
          
          <div 
            className="menu-item" 
            title="Print page (Browser native)"
            onClick={handlePrint}
          >
            <span>🖨️</span>
            <span>Print Page</span>
          </div>
        </div>
      )}
    </div>
  )
}
