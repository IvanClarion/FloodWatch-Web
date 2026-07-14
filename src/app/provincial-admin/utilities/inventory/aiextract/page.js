"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabase/util/supabase"
import CardHeader from "@/components/cards/CardHeader"
import CardBasedText from "@/components/cards/CardBasedText"
import PrimaryButton from "@/components/button/PrimaryButton"
import ExtractMainComponents from "@/components/utilities/extract-with-lantaw/ExtractMainComponents"
import { Loader2 } from "lucide-react"

const REQUIRED_FIELDS = [
  { key: "name", label: "Utilities Information" },
  { key: "type", label: "Utility Type" },
  { key: "serial_number", label: "Serial Numbers" },
  { key: "quantity", label: "Quantity" },
]

function validateExtractedData(data) {
  if (!data || data.length === 0) {
    return { valid: false, errors: ["No items were extracted from the file."] }
  }

  const errors = []

  data.forEach((item, index) => {
    REQUIRED_FIELDS.forEach(({ key, label }) => {
      const value = item[key]
      const isEmpty = value === null || value === undefined || value === "" || (typeof value === "number" && isNaN(value))
      if (isEmpty) {
        errors.push(`Row ${index + 1}: "${label}" is required`)
      }
    })
  })

  return { valid: errors.length === 0, errors }
}

export default function page() {
  const router = useRouter()
  const [extractedData, setExtractedData] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [extractionError, setExtractionError] = useState(null)

  const handleScan = async () => {
    if (!uploadedFile) return

    setIsExtracting(true)
    setExtractedData(null)
    setExtractionError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch('/api/lantaw/extract', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      setIsExtracting(false)
      setIsRendering(true)

      // Simulate a small rendering delay for UX
      setTimeout(() => {
        if (!response.ok) {
          setExtractionError([result.error || "An unknown error occurred during extraction."])
          setIsRendering(false)
          return
        }

        const data = result.data
        let rawData = []

        // Parse extracted data based on file type
        if (data.file_type === 'image') {
          // Images return a JSON string from Gemini Vision
          let contentStr = data.data.content || ""
          contentStr = contentStr.replace(/```json/g, "").replace(/```/g, "").trim()
          try {
            const parsed = JSON.parse(contentStr)
            rawData = parsed.extracted_items || []
          } catch (e) {
            setExtractionError(["Failed to parse AI output. The image might not contain valid tabular data."])
            setIsRendering(false)
            return
          }
        } else if (data.file_type === 'document') {
          // Documents (CSV/XLSX) return an array of row objects
          if (Array.isArray(data.data.content)) {
            // Lowercase the keys just in case the spreadsheet headers are capitalized
            rawData = data.data.content.map(row => {
              const lowerRow = {}
              Object.keys(row).forEach(k => {
                lowerRow[k.toLowerCase().replace(/ /g, '_')] = row[k]
              })
              return lowerRow
            })
          } else {
             setExtractionError(["Could not parse tabular data from this document. Make sure it is a CSV or XLSX file."])
             setIsRendering(false)
             return
          }
        }

        // Validate extracted data
        const validation = validateExtractedData(rawData)

        if (!validation.valid) {
          setExtractionError(validation.errors)
          setExtractedData(null)
        } else {
          // Generate pseudo-IDs for the table key
          const formattedData = rawData.map((item, index) => ({
            ...item,
            id: String(index + 1)
          }))
          setExtractedData(formattedData)
          setExtractionError(null)
        }

        setIsRendering(false)
      }, 1000)

    } catch (err) {
      console.error(err)
      setExtractionError([err.message || "Network error. Please try again."])
      setIsExtracting(false)
      setIsRendering(false)
    }
  }

  const handleRetry = () => {
    setExtractedData(null)
    setExtractionError(null)
    setUploadedFile(null)
  }

  const handleSave = async () => {
    if (!extractedData) return
    setIsSaving(true)
    
    try {
      // 1. Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setExtractionError(["You must be logged in to save data."])
        setIsSaving(false)
        return
      }

      // 2. Remove the pseudo 'id' and append 'added_by' with the user's ID
      const payload = extractedData.map(({ id, ...rest }) => ({
        ...rest,
        added_by: user.id
      }))

      // 3. Insert into database
      const { error } = await supabase
        .from('utilities')
        .insert(payload)

      if (error) {
        console.error("Save error:", error)
        setExtractionError(["Failed to save data to the database."])
        setIsSaving(false)
        return
      }

      router.push('/provincial-admin/utilities/inventory')
    } catch (err) {
      console.error(err)
      setExtractionError(["An unexpected error occurred while saving."])
      setIsSaving(false)
    }
  }

  const hasExtracted = extractedData !== null && !extractionError

  return (
    <section className="grid gap-5">
      <div className="flex justify-between items-center gap-2">
        <div>
        <CardHeader className='text-primary'>Import Your List with Lantaw</CardHeader>
        <CardBasedText className='text-gray-500'>You have existing file with list of Utilities? Import them now!</CardBasedText>
        <CardBasedText className='text-gray-500'>Lantaw AI can make mistake please double check</CardBasedText>
        </div>
        <div>
          {hasExtracted ? (
            <PrimaryButton onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin"/>}
              {isSaving ? "Saving..." : "Save"}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={handleScan} disabled={!uploadedFile || isExtracting}>
              {isExtracting ? "Scanning..." : "Scan"}
            </PrimaryButton>
          )}
        </div>
      </div>
      <div>
        <ExtractMainComponents 
          isExtracting={isExtracting}
          isRendering={isRendering}
          extractedData={extractedData}
          extractionError={extractionError}
          onFileChange={setUploadedFile}
          onRetry={handleRetry}
        />
      </div>
    </section>
  )
}
