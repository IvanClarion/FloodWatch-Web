"use client"
import { memo, useRef, useMemo } from "react"
import { Origami } from "lucide-react"
import ReactMarkdown from "react-markdown"
import useTypewriter from "./TypewriterText"
import useOnScreen from "@/hooks/useOnScreen"
import LantawVisualization from "./LantawVisualization"

function LantawMessageBox({ children, isNew = false }) {
  const ref = useRef(null)
  const isVisible = useOnScreen(ref, { rootMargin: '200px' })

  // Intercept and parse JSON visualization data
  const visualData = useMemo(() => {
    if (typeof children !== 'string') return null
    try {
      // Sometimes AI wraps JSON in markdown blocks
      const cleanStr = children.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1')
      const parsed = JSON.parse(cleanStr.trim())
      if (parsed && parsed.visualization) {
        return parsed
      }
    } catch (e) {
      return null
    }
    return null
  }, [children])

  return (
    <section ref={ref} className="flex items-start gap-2">
        <div className="summary-data-icon mt-1 shrink-0">
            <Origami className="size-4"/>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed lantaw-prose w-full overflow-hidden">
            {visualData ? (
                <LantawVisualization data={visualData} />
            ) : isNew ? (
                <TypewriterMarkdown text={children} />
            ) : isVisible ? (
                <ReactMarkdown>{children}</ReactMarkdown>
            ) : (
                <PlainPreview text={children} />
            )}
        </div>
    </section>
  )
}


// Memoize to prevent re-renders when parent state changes but this message hasn't
export default memo(LantawMessageBox)

function TypewriterMarkdown({ text }) {
  const { displayedText } = useTypewriter(text, 15)
  return <ReactMarkdown>{displayedText}</ReactMarkdown>
}

// Lightweight plain-text preview for off-screen messages (no markdown parsing)
function PlainPreview({ text }) {
  const preview = text.length > 120 ? text.slice(0, 120) + "..." : text
  return <p className="text-slate-400">{preview}</p>
}
