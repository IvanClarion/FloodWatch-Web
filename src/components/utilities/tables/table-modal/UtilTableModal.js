import { useState, useEffect } from "react"
import SideModal from "@/components/Modal/SideModal"
import CardSubHeader from "@/components/cards/CardSubHeader"
import PrimaryButton from "@/components/button/PrimaryButton"
import CardBasedText from "@/components/cards/CardBasedText"
import GeneralInput from "@/components/forms/GeneralInput"
import TextArea from "@/components/forms/TextArea"
import TagsInput from "@/components/forms/TagsInput"
import { X, SquareDashed, ToolCase, Hash, Package, FileText, CalendarDays, User, Loader2 } from "lucide-react"
import { supabase } from "@/supabase/util/supabase"
import DeleteUtilConfirmationModal from "./DeleteUtilConfirmationModal"

export default function UtilTableModal({ item, onClose, onDeleteSuccess }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    serial_number: [],
    quantity: "",
    description: ""
  })

  useEffect(() => {
    if (item) {
      setEditForm({
        name: item.name || "",
        type: item.type || "",
        serial_number: item.serial_number ? item.serial_number.split(',').map(s => s.trim()) : [],
        quantity: item.quantity?.toString() || "",
        description: item.description || ""
      })
      setIsEditing(false)
    }
  }, [item])

  const handleQuantityChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "")
    setEditForm(prev => {
      const num = parseInt(val) || 0
      let newTags = prev.serial_number
      if (newTags.length > num) newTags = newTags.slice(0, num)
      return { ...prev, quantity: val, serial_number: newTags }
    })
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('utilities')
        .delete()
        .eq('id', item.id)
      
      if (error) throw error
      
      setShowDeleteModal(false)
      onDeleteSuccess()
    } catch (error) {
      console.error("Error deleting utility:", error)
      alert("Failed to delete the utility.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveUpdate = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('utilities')
        .update({
          name: editForm.name,
          type: editForm.type,
          quantity: parseInt(editForm.quantity) || 0,
          serial_number: editForm.serial_number.join(', '),
          description: editForm.description
        })
        .eq('id', item.id)

      if (error) throw error

      setIsEditing(false)
      onDeleteSuccess() // Reusing this prop to refresh the table and close modal
    } catch (error) {
      console.error("Error updating utility:", error)
      alert("Failed to update the utility.")
    } finally {
      setIsUpdating(false)
    }
  }

  if (!item) return null;

  return (
    <>
      <SideModal>
          <div className="p-4 bg-white sticky top-0 flex justify-between items-center border-b border-gray-100 z-10">
              <CardSubHeader className="text-lg text-primary">{item.name}</CardSubHeader>
              <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded-full transition-colors"><X className="size-5 text-gray-500"/></button>
          </div>
          <div className="p-4 grid gap-6 overflow-y-auto">
              
              {/* Utilities Information */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <SquareDashed className="text-primary size-4"/>
                      <CardSubHeader>Utilities Information</CardSubHeader>
                  </div>
                  <div>
                      {isEditing ? (
                          <GeneralInput 
                              value={editForm.name} 
                              onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))} 
                          />
                      ) : (
                          <CardBasedText>{item.name}</CardBasedText>
                      )}
                  </div>
              </div>

              {/* Utility Type */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <ToolCase className="text-primary size-4"/>
                      <CardSubHeader>Utility Type</CardSubHeader>
                  </div>
                  <div>
                      {isEditing ? (
                          <GeneralInput 
                              value={editForm.type} 
                              onChange={(e) => setEditForm(prev => ({...prev, type: e.target.value}))} 
                          />
                      ) : (
                          <CardBasedText>{item.type}</CardBasedText>
                      )}
                  </div>
              </div>

              {/* Serial Numbers */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <Hash className="text-primary size-4"/>
                      <CardSubHeader>Serial Numbers</CardSubHeader>
                  </div>
                  <div className={isEditing ? "" : "flex flex-wrap gap-2"}>
                      {isEditing ? (
                          <TagsInput 
                              value={editForm.serial_number}
                              onChange={(tags) => setEditForm(prev => ({...prev, serial_number: tags}))}
                              maxTags={parseInt(editForm.quantity) || 0}
                              disabled={!editForm.quantity}
                              placeholder={editForm.quantity ? `Add up to ${editForm.quantity} serials (press space)` : 'Set quantity first'}
                          />
                      ) : (
                          item.serial_number ? item.serial_number.split(',').map((sn, i) => (
                              <span key={i} className="tag-default text-xs">{sn.trim()}</span>
                          )) : <CardBasedText>N/A</CardBasedText>
                      )}
                  </div>
              </div>

              {/* Quantity */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <Package className="text-primary size-4"/>
                      <CardSubHeader>Quantity</CardSubHeader>
                  </div>
                  <div>
                      {isEditing ? (
                          <GeneralInput 
                              value={editForm.quantity} 
                              onChange={handleQuantityChange}
                              type="text"
                              inputMode="numeric"
                          />
                      ) : (
                          <CardBasedText>{item.quantity}</CardBasedText>
                      )}
                  </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <FileText className="text-primary size-4"/>
                      <CardSubHeader>Description</CardSubHeader>
                  </div>
                  <div>
                      {isEditing ? (
                          <TextArea 
                              value={editForm.description} 
                              onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))} 
                              className="text-xs"
                          />
                      ) : (
                          <CardBasedText>{item.description || "No description provided."}</CardBasedText>
                      )}
                  </div>
              </div>

              {/* Added By */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <User className="text-primary size-4"/>
                      <CardSubHeader>Added By</CardSubHeader>
                  </div>
                  <div>
                      <CardBasedText>{item.profiles?.full_name || 'System'}</CardBasedText>
                  </div>
              </div>

              {/* Date Added */}
              <div className="grid gap-2">
                  <div className="flex items-center font-semibold gap-2">
                      <CalendarDays className="text-primary size-4"/>
                      <CardSubHeader>Date Added</CardSubHeader>
                  </div>
                  <div>
                      <CardBasedText>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardBasedText>
                  </div>
              </div>

          </div>
          
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
              {isEditing ? (
                  <>
                      <button 
                          onClick={() => setIsEditing(false)} 
                          className="px-4"
                          disabled={isUpdating}
                      >
                          <CardBasedText className='text-xs text-gray-500 font-semibold'>Cancel</CardBasedText>
                      </button>
                      <PrimaryButton 
                          onClick={handleSaveUpdate} 
                          disabled={isUpdating}
                          className="flex items-center gap-2"
                      >
                          {isUpdating ? <Loader2 className="size-4 animate-spin"/> : null}
                          {isUpdating ? "Saving..." : "Save Changes"}
                      </PrimaryButton>
                  </>
              ) : (
                  <>
                      <button onClick={() => setShowDeleteModal(true)} className="px-4"><CardBasedText className='text-xs text-red-500 font-semibold'>Delete</CardBasedText></button>
                      <PrimaryButton onClick={() => setIsEditing(true)}>Edit Utility</PrimaryButton>
                  </>
              )}
          </div>
      </SideModal>

      {showDeleteModal && (
          <DeleteUtilConfirmationModal 
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={handleConfirmDelete}
              isDeleting={isDeleting}
          />
      )}
    </>
  )
}
