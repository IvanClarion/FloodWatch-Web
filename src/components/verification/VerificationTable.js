"use client"
import { useState } from "react"
import CardSubHeader from "../cards/CardSubHeader"
import ToogleButton from "../button/ToogleButton"
import ToogleButtonLayout from "../button/ToogleButtonLayout"
import TableHeader from "../table/TableHeader"
import Table from "../table/Table"
import TableScrollWrapper from "../table/TableScrollWrapper"
import TableHead from "../table/TableHead"
import DataTable from "../table/DataTable"
import Th from "../table/Th"
import TableRow from "../table/TableRow"
import TableData from "../table/TableData"
import TableDataMuted from "../table/TableDataMuted"
import TableBadge from "../table/TableBadge"
import TableDataAction from "../table/TableDataAction"
import { Eye, ChevronRight } from "lucide-react"
import VerificationTableModal from "./VerificationTableModal"

const MOCK_DATA = [
  {
    id_verification_id: "a1b2c3d4-1234-5678-9012-345678901234",
    user_id: "u9876543-abcd-efgh-ijkl-mnopqrstuvwx",
    user_name: "Juan Dela Cruz",
    id_type: "Driver's License",
    id_image_url: "https://example.com/id/juan.jpg",
    status: "Pending",
    reviewed_by: null,
    submitted_at: "2024-05-20T10:30:00Z",
    is_read: false,
    ai_insight: "Text matches typical driver's license format.",
    ai_confidence_score: 0.95,
    ai_is_valid: true
  },
  {
    id_verification_id: "e5f6g7h8-1234-5678-9012-345678901234",
    user_id: "u1234567-abcd-efgh-ijkl-mnopqrstuvwx",
    user_name: "Maria Clara",
    id_type: "Passport",
    id_image_url: "https://example.com/id/maria.jpg",
    status: "Verified",
    reviewed_by: "admin-1234-uuid",
    submitted_at: "2024-05-19T14:15:00Z",
    is_read: true,
    ai_insight: "High confidence in MRZ lines.",
    ai_confidence_score: 0.98,
    ai_is_valid: true
  },
  {
    id_verification_id: "i9j0k1l2-1234-5678-9012-345678901234",
    user_id: "u3456789-abcd-efgh-ijkl-mnopqrstuvwx",
    user_name: "Andres Bonifacio",
    id_type: "National ID",
    id_image_url: "https://example.com/id/andres.jpg",
    status: "Unverified",
    reviewed_by: "admin-1234-uuid",
    submitted_at: "2024-05-18T09:00:00Z",
    is_read: true,
    ai_insight: "Blurry image detected, text unreadable.",
    ai_confidence_score: 0.45,
    ai_is_valid: false
  }
]

export default function VerificationTable() {
  const [selectedRow, setSelectedRow] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (row) => {
    setSelectedRow(row)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRow(null)
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return <TableBadge className="bg-green-500/10 text-green-500">{status}</TableBadge>
      case 'pending':
        return <TableBadge className="bg-amber-500/10 text-amber-500">{status}</TableBadge>
      default:
        return <TableBadge className="bg-red-500/10 text-red-500">{status}</TableBadge>
    }
  }

  return (
    <div className="table-container mt-6">
      <TableHeader className="flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex items-center h-full">
          <CardSubHeader className="!mb-0 leading-none self-center">ID Verifications</CardSubHeader>
        </div>
        <ToogleButtonLayout className="w-full sm:w-auto overflow-x-auto">
          <ToogleButton active>All</ToogleButton>
          <ToogleButton>Pending</ToogleButton>
          <ToogleButton>Verified</ToogleButton>
          <ToogleButton>Unverified</ToogleButton>
        </ToogleButtonLayout>
      </TableHeader>

      <TableScrollWrapper>
        <DataTable>
          <TableHead>
            <TableRow>
              <Th>User Name</Th>
              <Th>ID Type</Th>
              <Th>Submitted At</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </TableRow>
          </TableHead>
          <tbody>
            {MOCK_DATA.map((row) => (
              <TableRow key={row.id_verification_id}>
                <TableData className="font-medium text-gray-800">{row.user_name}</TableData>
                <TableDataMuted>{row.id_type}</TableDataMuted>
                <TableDataMuted>{new Date(row.submitted_at).toLocaleString()}</TableDataMuted>
                <TableData>{getStatusBadge(row.status)}</TableData>
                <TableDataAction>
                  <button 
                    onClick={() => handleOpenModal(row)}
                    className="table-action-btn"
                    title="View Details"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </TableDataAction>
              </TableRow>
            ))}
          </tbody>
        </DataTable>
      </TableScrollWrapper>

      {isModalOpen && selectedRow && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={handleCloseModal}></div>
          <VerificationTableModal 
            data={selectedRow} 
            onClose={handleCloseModal} 
          />
        </>
      )}
    </div>
  )
}
