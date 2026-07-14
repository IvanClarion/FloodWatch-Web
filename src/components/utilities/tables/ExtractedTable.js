import TableScrollWrapper from "@/components/table/TableScrollWrapper"
import Table from "@/components/table/Table"
import DataTable from "@/components/table/DataTable"
import TableHead from "@/components/table/TableHead"
import Th from "@/components/table/Th"
import TableRow from "@/components/table/TableRow"
import TableData from "@/components/table/TableData"
import TableDataMuted from "@/components/table/TableDataMuted"
import SingleLineSkeleton from "@/components/skeleton/SingleLineSkeleton"

export default function ExtractedTable({ data, isRendering }) {
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
              <Th>Description</Th>
            </tr>
          </TableHead>
          <tbody>
            {isRendering ? (
              // Show skeleton rows while rendering
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                  <TableData><SingleLineSkeleton /></TableData>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableData>{item.name}</TableData>
                  <TableDataMuted>{item.type}</TableDataMuted>
                  <TableDataMuted>{item.serial_number}</TableDataMuted>
                  <TableData>{item.quantity}</TableData>
                  <TableDataMuted className="truncate max-w-[200px]">{item.description}</TableDataMuted>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableData colSpan={5} className="text-center text-gray-400">No data extracted yet</TableData>
              </TableRow>
            )}
          </tbody>
        </DataTable>
      </TableScrollWrapper>
    </Table>
  )
}
