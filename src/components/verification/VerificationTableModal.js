import CardBasedText from "../cards/CardBasedText"
import CardSubHeader from "../cards/CardSubHeader"
import { X, CheckCircle2, XCircle, FileImage } from "lucide-react"
import SideModal from "../Modal/SideModal"

export default function VerificationTableModal({ data, onClose }) {
  if (!data) return null;

  return (
    <SideModal className="z-50">
      <div className="p-6 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
          <CardSubHeader>Verification Details</CardSubHeader>
          <button onClick={onClose} className="modal-icon-button">
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          
          {/* User Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">User Information</h4>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <CardBasedText className="text-xs text-gray-500 mb-1">User Name</CardBasedText>
                <div className="font-medium text-sm text-gray-800">{data.user_name}</div>
              </div>
              <div className="overflow-hidden">
                <CardBasedText className="text-xs text-gray-500 mb-1">User ID</CardBasedText>
                <div className="font-medium text-xs text-gray-800 truncate" title={data.user_id}>{data.user_id}</div>
              </div>
            </div>
          </div>

          {/* ID Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">ID Details</h4>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-4">
              <div>
                <CardBasedText className="text-xs text-gray-500 mb-1">ID Type</CardBasedText>
                <div className="font-medium text-sm text-gray-800">{data.id_type}</div>
              </div>
              <div className="overflow-hidden">
                <CardBasedText className="text-xs text-gray-500 mb-1">Verification ID</CardBasedText>
                <div className="font-medium text-xs text-gray-800 truncate" title={data.id_verification_id}>{data.id_verification_id}</div>
              </div>
              <div>
                <CardBasedText className="text-xs text-gray-500 mb-1">Submitted At</CardBasedText>
                <div className="font-medium text-sm text-gray-800">{new Date(data.submitted_at).toLocaleString()}</div>
              </div>
              <div>
                <CardBasedText className="text-xs text-gray-500 mb-1">Status</CardBasedText>
                <div className={`font-semibold text-sm ${data.status.toLowerCase() === 'verified' ? 'text-green-500' : data.status.toLowerCase() === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>
                  {data.status}
                </div>
              </div>
              <div>
                <CardBasedText className="text-xs text-gray-500 mb-1">Read Status</CardBasedText>
                <div className="font-medium text-sm text-gray-800">{data.is_read ? 'Read' : 'Unread'}</div>
              </div>
              {data.reviewed_by && (
                <div className="overflow-hidden">
                  <CardBasedText className="text-xs text-gray-500 mb-1">Reviewed By</CardBasedText>
                  <div className="font-medium text-xs text-gray-800 truncate" title={data.reviewed_by}>{data.reviewed_by}</div>
                </div>
              )}
            </div>

            {/* ID Image Placeholder */}
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex flex-col items-center justify-center h-48">
               <FileImage className="size-10 text-gray-400 mb-2" />
               <span className="text-sm text-gray-500">ID Image</span>
               <span className="text-xs text-gray-400 mt-1 truncate max-w-[300px]">{data.id_image_url}</span>
            </div>
          </div>

          {/* AI Insights */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">AI Analysis</h4>
            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardBasedText className="text-xs text-gray-500 mb-1">AI Validity Check</CardBasedText>
                  <div className="flex items-center gap-2">
                    {data.ai_is_valid ? (
                      <><CheckCircle2 className="size-4 text-green-500" /><span className="text-sm font-medium text-green-600">Valid Format</span></>
                    ) : (
                      <><XCircle className="size-4 text-red-500" /><span className="text-sm font-medium text-red-600">Invalid Format</span></>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <CardBasedText className="text-xs text-gray-500 mb-1">Confidence Score</CardBasedText>
                  <div className="text-lg font-bold text-gray-800">{(data.ai_confidence_score * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <CardBasedText className="text-xs text-gray-500 mb-1">AI Insight</CardBasedText>
                <p className="text-sm text-gray-700 italic mt-1">"{data.ai_insight}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          {data.status.toLowerCase() === 'pending' && (
            <>
             <button className="success-button ">Approve</button>
             <button className="danger-button">Reject</button>
             
            </>
          )}
        </div>
      </div>
    </SideModal>
  )
}
