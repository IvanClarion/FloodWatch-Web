import TableScrollWrapper from "@/components/table/TableScrollWrapper"
import Table from "@/components/table/Table"
import DataTable from "@/components/table/DataTable"
import TableHead from "@/components/table/TableHead"
import Th from "@/components/table/Th"
import TableRow from "@/components/table/TableRow"
import TableData from "@/components/table/TableData"
import TableDataMuted from "@/components/table/TableDataMuted"
import TableDataAction from "@/components/table/TableDataAction"
import { ChevronRight } from "lucide-react"

const staticData = [
  { request_id: '1', requested_by: 'Juan Dela Cruz', municipality_id: 'Butuan City', status: 'pending', created_at: '2026-07-14T08:30:00Z' },
  { request_id: '2', requested_by: 'Maria Santos', municipality_id: 'Cabadbaran City', status: 'approved', created_at: '2026-07-13T14:15:00Z' },
  { request_id: '3', requested_by: 'Pedro Reyes', municipality_id: 'Nasipit', status: 'rejected', created_at: '2026-07-12T09:45:00Z' },
  { request_id: '4', requested_by: 'Ana Garcia', municipality_id: 'Buenavista', status: 'pending', created_at: '2026-07-11T16:00:00Z' },
  { request_id: '5', requested_by: 'Carlos Mendoza', municipality_id: 'Carmen', status: 'approved', created_at: '2026-07-10T11:20:00Z' },
]

const statusStyles = {
  pending: 'summary-data-icon-yellow',
  approved: 'summary-data-icon-green',
  rejected: 'summary-data-icon-red',
}

export default function RequestTable() {
  return (
    <Table>
      <TableScrollWrapper>
        <DataTable>
          <TableHead>
            <tr>
              <Th>Requestor</Th>
              <Th>Municipality</Th>
              <Th>Status</Th>
              <Th>Requested At</Th>
              <Th>Action</Th>
            </tr>
          </TableHead>
          <tbody>
            {staticData.map((item) => (
              <TableRow key={item.request_id}>
                <TableData>{item.requested_by}</TableData>
                <TableDataMuted>{item.municipality_id}</TableDataMuted>
                <TableData>
                  <span className={`${statusStyles[item.status] || ''} px-3 py-1 text-xs font-semibold capitalize`}>
                    {item.status}
                  </span>
                </TableData>
                <TableDataMuted className='truncate max-w-[200px]'>
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableDataMuted>
                <TableDataAction>
                  <button className="modal-icon-button"><ChevronRight className="size-5"/></button>
                </TableDataAction>
              </TableRow>
            ))}
          </tbody>
        </DataTable>
      </TableScrollWrapper>
    </Table>
  )
}
