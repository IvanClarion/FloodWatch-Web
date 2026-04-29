"use client"

import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, ChevronRight } from "lucide-react"
import TableHeader from "../TableHeader"
import Table from "../Table"
import TableScrollWrapper from "../TableScrollWrapper"
import TableHead from "../TableHead"
import DataTable from "../DataTable"
import Th from "../Th"
import TableRow from "../TableRow"
import TableData from "../TableData"
import TableDataMuted from "../TableDataMuted"
import TableBadge from "../TableBadge"
import TableDataAction from "../TableDataAction"
import SingleLineSkeleton from "@/components/skeleton/SingleLineSkeleton"

// "hidden"  → not in viewport, cells are display:none
// "loading" → just entered viewport, show skeleton shimmer
// "loaded"  → data revealed after brief skeleton flash
function LazyRow({ row, onRowClick, scrollRoot }) {
  const [state, setState] = useState("hidden"); // hidden | loading | loaded
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("loading");
          observer.disconnect();
        }
      },
      { root: scrollRoot, rootMargin: "100px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [scrollRoot]);

  // Once we enter "loading", hold the skeleton briefly then reveal data
  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("loaded"), 300);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <TableRow ref={ref} style={state === "hidden" ? { visibility: "hidden", height: "56px" } : undefined}>
      {state === "hidden" ? (
        // Cells exist for table structure but content is not displayed
        <>
          <TableData><div style={{ display: "none" }} /></TableData>
          <TableData><div style={{ display: "none" }} /></TableData>
          <TableData><div style={{ display: "none" }} /></TableData>
          <TableData><div style={{ display: "none" }} /></TableData>
          <TableDataAction><div style={{ display: "none" }} /></TableDataAction>
        </>
      ) : state === "loading" ? (
        <>
          <TableData><SingleLineSkeleton /></TableData>
          <TableData><SingleLineSkeleton /></TableData>
          <TableData><SingleLineSkeleton /></TableData>
          <TableData><SingleLineSkeleton /></TableData>
          <TableDataAction>
            <div style={{ width: '32px', height: '32px' }} />
          </TableDataAction>
        </>
      ) : (
        <>
          <TableData className=" font-medium text-gray-800">{row.province}</TableData>
          <TableData>
            <span className="text-sm text-gray-600">
              {row.municipality}
            </span>
          </TableData>
          <TableDataMuted>{row.added_on}</TableDataMuted>
          <TableDataMuted>{row.updated_at}</TableDataMuted>
          <TableDataAction>
            <button
              className="table-action-btn"
              onClick={() => onRowClick?.(row)}
              aria-label={`View ${row.province}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </TableDataAction>
        </>
      )}
    </TableRow>
  );
}

export default function SeedTable({ data = [], title = "Area Seeding Table", onRowClick }) {
  const scrollRef = useRef(null);

  return (
    <Table>
      {/* Table Header */}
      <TableHeader>
        <h2 className="table-title">{title}</h2>
        <button className="table-filter-btn">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter by Region</span>
        </button>
      </TableHeader>

      {/* Scrollable Table Body */}
      <TableScrollWrapper ref={scrollRef}>
        <DataTable>
          <TableHead>
            <tr>
              <Th>Province Name</Th>
              <Th>Municipality</Th>
              <Th>Added On</Th>
              <Th>Last Update</Th>
              <Th className="table-th-right">Action</Th>
            </tr>
          </TableHead>

          <tbody>
            {data.map((row) => (
              <LazyRow key={row.id} row={row} onRowClick={onRowClick} scrollRoot={scrollRef.current} />
            ))}
          </tbody>
        </DataTable>
      </TableScrollWrapper>

    </Table>
  )
}

