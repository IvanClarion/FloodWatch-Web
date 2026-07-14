import LantawExtractForms from "../utilforms/LantawExtractForms"
import ExtractedTable from "../tables/ExtractedTable"
import ExtractSummaryDetails from "../summary/ExtractSummaryDetails"
import LantawExtractLoader from "./LantawExtractLoader"
import GeneralCard from "@/components/cards/GeneralCard"
import CardSubHeader from "@/components/cards/CardSubHeader"
import CardBasedText from "@/components/cards/CardBasedText"
import { CircleAlert, RotateCcw } from "lucide-react"

export default function ExtractMainComponents({ isExtracting, isRendering, extractedData, extractionError, onFileChange, onRetry }) {

  // Show the loader while Lantaw is extracting
  if (isExtracting) {
    return (
      <section className="grid gap-5">
        <LantawExtractForms onFileChange={onFileChange} disabled />
        <LantawExtractLoader />
      </section>
    )
  }

  return (
    <section className="grid gap-5">
        <LantawExtractForms onFileChange={onFileChange} />

        {/* Show error if extraction failed validation */}
        {extractionError && (
          <GeneralCard className="border border-red-200 bg-red-50/50">
            <div className="flex items-start gap-3">
              <div className="bg-red-500/10 p-2 rounded-full shrink-0 mt-0.5">
                <CircleAlert className="size-5 text-red-500" />
              </div>
              <div className="grid gap-2 flex-1">
                <CardSubHeader className="text-red-600">Extraction Failed — Missing Required Information</CardSubHeader>
                <CardBasedText className="text-red-500/80">
                  The uploaded file is missing required fields. Lantaw could not extract the following:
                </CardBasedText>
                <ul className="grid gap-1 mt-1">
                  {extractionError.map((err, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-500">
                      <span className="size-1.5 bg-red-400 rounded-full shrink-0"></span>
                      {err}
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <button 
                    onClick={onRetry} 
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <RotateCcw className="size-4" />
                    Try again with a different file
                  </button>
                </div>
              </div>
            </div>
          </GeneralCard>
        )}

        {/* Only show results after extraction is complete and valid */}
        {(extractedData || isRendering) && !extractionError && (
          <div className="grid gap-3">
              <ExtractSummaryDetails 
                totalItems={extractedData ? extractedData.length : 0}
                isRendering={isRendering}
              />
              <ExtractedTable 
                data={extractedData} 
                isRendering={isRendering} 
              />
          </div>
        )}
    </section>
  )
}

