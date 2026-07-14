"use client"
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
import { useState, useEffect } from "react"
import { supabase } from "@/supabase/util/supabase"
import SingleLineSkeleton from "@/components/skeleton/SingleLineSkeleton"
import UtilTableModal from "./table-modal/UtilTableModal"

export default function UtilTable() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    const fetchUtilities = async () => {
      try {
        const { data: utilities } = await supabase
          .from('utilities')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
        if (utilities) {
          setData(utilities)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUtilities()
  }, [])

  return (
    <Table>
      <TableScrollWrapper>
        <DataTable>
          <TableHead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Serial Number</Th>
              <Th>Quantity</Th>
              <Th>Added By</Th>
              <Th>Action</Th>
            </tr>
          </TableHead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((skeleton) => (
                <TableRow key={skeleton}>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableDataAction><SingleLineSkeleton /></TableDataAction>
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableData>{item.name}</TableData>
                  <TableDataMuted>{item.type}</TableDataMuted>
                  <TableDataMuted>{item.serial_number}</TableDataMuted>
                  <TableData>
                    <div className={item.quantity <= 3 ? "summary-data-icon-red px-4" : ""}>
                      {item.quantity}
                    </div>
                  </TableData>
                  <TableDataMuted className="truncate max-w-[120px]">
                    {item.profiles?.full_name || 'System'}
                  </TableDataMuted>
                  <TableDataAction>
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="modal-icon-button"
                    >
                      <ChevronRight className="size-5"/>
                    </button>
                  </TableDataAction>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No utilities found</td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </TableScrollWrapper>

      {/* Side Modal */}
      {selectedItem && (
        <UtilTableModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onDeleteSuccess={() => {
            setSelectedItem(null)
            // Trigger a re-fetch of the table data
            setIsLoading(true)
            supabase
              .from('utilities')
              .select('*, profiles(full_name)')
              .order('created_at', { ascending: false })
              .then(({ data }) => {
                if (data) setData(data)
                setIsLoading(false)
              })
          }}
        />
      )}
    </Table>
  )
}
