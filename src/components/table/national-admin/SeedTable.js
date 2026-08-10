"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  X, 
  MapPin, 
  Building2, 
  CalendarDays, 
  CheckCircle2, 
  Map as MapIcon,
  Pencil,
  Loader2,
  Compass,
  Crosshair,
  Trash2
} from "lucide-react"
import TableHeader from "../TableHeader"
import Table from "../Table"
import TableScrollWrapper from "../TableScrollWrapper"
import TableHead from "../TableHead"
import DataTable from "../DataTable"
import Th from "../Th"
import TableRow from "../TableRow"
import TableData from "../TableData"
import TableDataMuted from "../TableDataMuted"
import TableDataAction from "../TableDataAction"
import SingleLineSkeleton from "@/components/skeleton/SingleLineSkeleton"
import SideModal from "@/components/Modal/SideModal"
import CardSubHeader from "@/components/cards/CardSubHeader"
import CardBasedText from "@/components/cards/CardBasedText"
import PrimaryButton from "@/components/button/PrimaryButton"
import GeneralInput from "@/components/forms/GeneralInput"
import SearchInput from "@/components/forms/SearchInput"
import DeleteSeedAreaModal from "@/components/Seeding/DeleteSeedAreaModal"
import { supabase } from "@/supabase/util/supabase"

import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

function LazyRow({ row, onRowClick, scrollRoot }) {
  const [state, setState] = useState("hidden");
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

  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("loaded"), 300);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <TableRow ref={ref} style={state === "hidden" ? { visibility: "hidden", height: "56px" } : undefined}>
      {state === "hidden" ? (
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
          <TableData className="font-medium text-gray-800">{row.province}</TableData>
          <TableData>
            <span className="text-sm text-gray-600">
              {row.municipality}
            </span>
          </TableData>
          <TableDataMuted>{row.added_on}</TableDataMuted>
          <TableDataMuted>{row.updated_at}</TableDataMuted>
          <TableDataAction>
            <button
              className="modal-icon-button hover:bg-gray-200"
              onClick={() => onRowClick?.(row)}
              aria-label={`View details for ${row.municipality || row.province}`}
              title="View details"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </TableDataAction>
        </>
      )}
    </TableRow>
  );
}

export default function SeedTable({ data = [], title = "Area Seeding Table", onRowClick }) {
  const scrollRef = useRef(null);
  const [tableRows, setTableRows] = useState(data);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync internal tableRows when prop data changes
  useEffect(() => {
    setTableRows(data);
  }, [data]);

  // Client-side refresh from Supabase for real-time table sync without full page reload
  const refreshTableData = async () => {
    try {
      const { data: rawData } = await supabase
        .from('province')
        .select('province_id, name, municipality_or_city(municipality_id, name, center_latitude, center_longitude, added_on, updated_at)')
        .order('name', { ascending: true });

      if (rawData) {
        const newRows = [];
        rawData.forEach((prov) => {
          if (prov.municipality_or_city && prov.municipality_or_city.length > 0) {
            prov.municipality_or_city.forEach((m, idx) => {
              newRows.push({
                id: `${prov.province_id}-${idx}`,
                municipality_id: m.municipality_id,
                province_id: prov.province_id,
                province: prov.name,
                municipality: m.name,
                latitude: m.center_latitude ?? 8.9475,
                longitude: m.center_longitude ?? 125.5406,
                added_on: m.added_on ? new Date(m.added_on).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "N/A",
                updated_at: m.updated_at ? new Date(m.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "N/A"
              });
            });
          }
        });
        newRows.sort((a, b) => (a.municipality || '').localeCompare(b.municipality || ''));
        setTableRows(newRows);
      }
    } catch (err) {
      console.error("Error refreshing seed table data:", err);
    }
  };

  // Realtime subscription on municipality_or_city & province tables
  useEffect(() => {
    const channel = supabase
      .channel('seed-table-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'municipality_or_city' }, refreshTableData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'province' }, refreshTableData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Search and 3-second debouncing state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const [editForm, setEditForm] = useState({
    municipality: "",
    latitude: "8.9475",
    longitude: "125.5406"
  });

  const [viewState, setViewState] = useState({
    latitude: 8.9475,
    longitude: 125.5406,
    zoom: 11
  });

  useEffect(() => {
    if (selectedRow) {
      const lat = parseFloat(selectedRow.latitude) || 8.9475;
      const lng = parseFloat(selectedRow.longitude) || 125.5406;
      setEditForm({
        municipality: selectedRow.municipality || "",
        latitude: lat.toString(),
        longitude: lng.toString()
      });
      setViewState({
        latitude: lat,
        longitude: lng,
        zoom: 11
      });
      setIsEditing(false);
    }
  }, [selectedRow]);

  const handleLatChange = (val) => {
    const cleanVal = val.replace(/[^0-9.-]/g, "");
    setEditForm(prev => ({ ...prev, latitude: cleanVal }));
    const parsedLat = parseFloat(cleanVal);
    if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
      setViewState(prev => ({ ...prev, latitude: parsedLat }));
    }
  };

  const handleLngChange = (val) => {
    const cleanVal = val.replace(/[^0-9.-]/g, "");
    setEditForm(prev => ({ ...prev, longitude: cleanVal }));
    const parsedLng = parseFloat(cleanVal);
    if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
      setViewState(prev => ({ ...prev, longitude: parsedLng }));
    }
  };

  const handleMarkerDragEnd = (evt) => {
    const newLat = evt.lngLat.lat;
    const newLng = evt.lngLat.lng;
    setEditForm(prev => ({
      ...prev,
      latitude: newLat.toFixed(6),
      longitude: newLng.toFixed(6)
    }));
    setViewState(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng
    }));
  };

  const handleSaveUpdate = async () => {
    if (!selectedRow?.municipality_id) {
      alert("Cannot update this area record because municipality_id is missing.");
      return;
    }

    const latNum = parseFloat(editForm.latitude);
    const lngNum = parseFloat(editForm.longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("Please enter valid numeric latitude and longitude coordinates.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/seeding/update-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipality_id: selectedRow.municipality_id,
          name: editForm.municipality.trim(),
          latitude: latNum,
          longitude: lngNum
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to update location coordinates.');
      }

      setIsEditing(false);
      const updatedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      // Dynamically update table state immediately without full page reload
      setTableRows(prevRows =>
        prevRows.map(row =>
          row.municipality_id === selectedRow.municipality_id
            ? { ...row, municipality: editForm.municipality.trim(), latitude: latNum, longitude: lngNum, updated_at: updatedDate }
            : row
        ).sort((a, b) => (a.municipality || '').localeCompare(b.municipality || ''))
      );

      setSelectedRow(prev => ({
        ...prev,
        municipality: editForm.municipality.trim(),
        latitude: latNum,
        longitude: lngNum,
        updated_at: updatedDate
      }));

      // Background re-sync
      refreshTableData();
    } catch (err) {
      console.error("Error updating location:", err);
      alert(err.message || "Failed to update location coordinates.");
    } finally {
      setIsUpdating(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAreaClick = () => {
    if (!selectedRow?.municipality_id && !selectedRow?.province_id) {
      alert("Cannot delete area record because ID is missing.");
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/seeding/delete-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipality_id: selectedRow?.municipality_id || null,
          province_id: selectedRow?.province_id || null
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete area record.');
      }

      setShowDeleteModal(false);

      // Dynamically remove item from local table state immediately without full page reload
      setTableRows(prevRows =>
        prevRows.filter(row => 
          row.municipality_id !== selectedRow.municipality_id && 
          row.province_id !== selectedRow.province_id
        )
      );

      setSelectedRow(null);
      setIsEditing(false);

      // Background re-sync
      refreshTableData();
    } catch (err) {
      console.error("Error deleting area record:", err);
      alert(err.message || "Failed to delete area record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    if (onRowClick) onRowClick(row);
  };

  // Filter table rows based on 3s debounced search query and sort alphabetically by municipality name
  const filteredData = tableRows
    .filter((row) => {
      if (!debouncedSearch.trim()) return true;
      const q = debouncedSearch.toLowerCase().trim();
      const provMatch = row.province?.toLowerCase().includes(q);
      const muniMatch = row.municipality?.toLowerCase().includes(q);
      const addedMatch = row.added_on?.toLowerCase().includes(q);
      const updatedMatch = row.updated_at?.toLowerCase().includes(q);
      return provMatch || muniMatch || addedMatch || updatedMatch;
    })
    .sort((a, b) => (a.municipality || '').localeCompare(b.municipality || ''));

  const currentLat = parseFloat(editForm.latitude) || 8.9475;
  const currentLng = parseFloat(editForm.longitude) || 125.5406;

  return (
    <Table className="w-full min-w-0 overflow-hidden">
      {/* Table Header with Integrated 3s Debounced Search Bar */}
      <TableHeader className="flex-wrap gap-3">
        <h2 className="table-title">{title}</h2>
        <div className="flex items-center gap-3">
          <SearchInput 
            placeholder="Search seeded areas by province, municipality..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm !== debouncedSearch && (
            <span className="text-xs text-amber-600 font-semibold animate-pulse shrink-0">
              Searching in 3s...
            </span>
          )}
        </div>
      </TableHeader>

      {/* Scrollable Table Body */}
      <TableScrollWrapper ref={scrollRef}>
        <DataTable className="w-full min-w-[680px]">
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
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <LazyRow 
                  key={row.id} 
                  row={row} 
                  onRowClick={handleRowClick} 
                  scrollRoot={scrollRef.current} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm font-medium">
                  {debouncedSearch ? `No seeded areas matching "${debouncedSearch}"` : "No area records found"}
                </td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </TableScrollWrapper>

      {/* Side Modal for Row Details & Coordinate Editing */}
      {selectedRow && (
        <SideModal>
          {/* Sticky Modal Header */}
          <div className="p-4 bg-white sticky top-0 flex justify-between items-center border-b border-gray-100 z-10">
            <div>
              <CardSubHeader className="text-lg text-primary">
                {isEditing ? "Edit Location Coordinates" : (selectedRow.municipality !== "No municipalities added" ? selectedRow.municipality : selectedRow.province)}
              </CardSubHeader>
              <CardBasedText className="text-xs text-gray-400 font-medium mt-0.5">
                Area Seeding & Location Details
              </CardBasedText>
            </div>
            <button 
              onClick={() => setSelectedRow(null)} 
              className="hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="size-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 grid gap-5 overflow-y-auto">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Seeded Area Record</h4>
                  <p className="text-xs text-emerald-700 font-medium">Registered in National System</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold uppercase rounded-full">
                Active Sync
              </span>
            </div>

            {/* Mapbox Visual Map Section */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center font-semibold gap-2">
                  <Compass className="text-primary size-4" />
                  <CardSubHeader>Visual Map Location</CardSubHeader>
                </div>
                {isEditing && (
                  <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                    <Crosshair className="size-3" /> Drag pin or edit inputs to move map
                  </span>
                )}
              </div>

              <div className="h-60 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group">
                <Map
                  {...viewState}
                  onMove={evt => setViewState(evt.viewState)}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/apex-yoshi/cmp0s3wq700bg01sx2y9i69pw"
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                >
                  <NavigationControl position="top-right" />
                  
                  <Marker
                    latitude={currentLat}
                    longitude={currentLng}
                    anchor="bottom"
                    draggable={isEditing}
                    onDragEnd={handleMarkerDragEnd}
                  >
                    <div className="relative group cursor-pointer">
                      <div className="bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white transform transition-transform group-hover:scale-110 flex items-center justify-center">
                        <MapPin className="size-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                    </div>
                  </Marker>
                </Map>

                {/* Coordinate Badge Overlay */}
                <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">Lat:</span> {currentLat.toFixed(6)}
                  <span className="text-emerald-400 font-bold">Lng:</span> {currentLng.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Editable Fields vs View Details */}
            {isEditing ? (
              <div className="grid gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                {/* Municipality Name */}
                <div className="grid gap-1">
                  <CardBasedText className="text-xs text-gray-700 font-semibold">Municipality / City Name *</CardBasedText>
                  <GeneralInput 
                    value={editForm.municipality}
                    onChange={(e) => setEditForm(prev => ({ ...prev, municipality: e.target.value }))}
                  />
                </div>

                {/* Latitude & Longitude Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <CardBasedText className="text-xs text-gray-700 font-semibold">Latitude *</CardBasedText>
                    <GeneralInput 
                      value={editForm.latitude}
                      onChange={(e) => handleLatChange(e.target.value)}
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 8.9475"
                    />
                  </div>
                  <div className="grid gap-1">
                    <CardBasedText className="text-xs text-gray-700 font-semibold">Longitude *</CardBasedText>
                    <GeneralInput 
                      value={editForm.longitude}
                      onChange={(e) => handleLngChange(e.target.value)}
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 125.5406"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* View Details Mode */
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5 p-3 bg-gray-50/60 rounded-xl border border-gray-100">
                    <div className="flex items-center font-semibold gap-2">
                      <MapPin className="text-primary size-4" />
                      <CardSubHeader>Province</CardSubHeader>
                    </div>
                    <CardBasedText className="text-sm font-bold text-gray-800">
                      {selectedRow.province}
                    </CardBasedText>
                  </div>

                  <div className="grid gap-1.5 p-3 bg-gray-50/60 rounded-xl border border-gray-100">
                    <div className="flex items-center font-semibold gap-2">
                      <Building2 className="text-primary size-4" />
                      <CardSubHeader>Municipality / City</CardSubHeader>
                    </div>
                    <CardBasedText className="text-sm font-bold text-gray-800">
                      {selectedRow.municipality}
                    </CardBasedText>
                  </div>
                </div>

                {/* Coordinates Details Card */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium flex items-center gap-1.5">
                      <Compass className="size-3.5 text-primary" /> Latitude
                    </span>
                    <span className="font-bold text-gray-800 font-mono block mt-0.5">
                      {currentLat.toFixed(6)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-medium flex items-center gap-1.5">
                      <Compass className="size-3.5 text-primary" /> Longitude
                    </span>
                    <span className="font-bold text-gray-800 font-mono block mt-0.5">
                      {currentLng.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Seeding Timeline */}
                <div className="grid gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-primary" /> Date Added
                    </span>
                    <span className="font-bold text-gray-800">{selectedRow.added_on}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-amber-600" /> Last Updated
                    </span>
                    <span className="font-bold text-gray-800">{selectedRow.updated_at}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Modal Footer */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleDeleteAreaClick}
                  disabled={isDeleting || isUpdating}
                  className="px-3 py-1.5 text-xs text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete Area"}</span>
                </button>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)} 
                    disabled={isUpdating || isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <PrimaryButton 
                    type="button"
                    onClick={handleSaveUpdate} 
                    disabled={isUpdating || isDeleting}
                    className="flex items-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="size-4 animate-spin"/> : null}
                    {isUpdating ? "Saving..." : "Save Location"}
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setSelectedRow(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <PrimaryButton 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit Location & Coordinates</span>
                </PrimaryButton>
              </>
            )}
          </div>
        </SideModal>
      )}

      {/* Floating Delete Confirmation Modal */}
      {showDeleteModal && selectedRow && (
        <DeleteSeedAreaModal
          areaName={selectedRow.municipality || selectedRow.province}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </Table>
  )
}
