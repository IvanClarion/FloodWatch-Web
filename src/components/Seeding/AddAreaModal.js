"use client"

import { useState, useEffect } from 'react'
import SideModal from "../Modal/SideModal"
import CardSubHeader from "../cards/CardSubHeader"
import CardBasedText from "../cards/CardBasedText"
import PrimaryButton from "../button/PrimaryButton"
import GeneralInput from "../forms/GeneralInput"
import { 
  X, 
  MapPin, 
  Building2, 
  Compass, 
  Loader2, 
  ChevronDown, 
  Check, 
  Search, 
  Plus, 
  Crosshair 
} from "lucide-react"
import { supabase } from '@/supabase/util/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function AddAreaModal() {
  const router = useRouter()
  const [provinces, setProvinces] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState("")
  const [newProvinceName, setNewProvinceName] = useState("")
  const [isNewProvince, setIsNewProvince] = useState(false)

  // Custom Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [provinceSearch, setProvinceSearch] = useState("")

  const [municipalityName, setMunicipalityName] = useState("")
  const [latitude, setLatitude] = useState("8.9475")
  const [longitude, setLongitude] = useState("125.5406")

  const [viewState, setViewState] = useState({
    latitude: 8.9475,
    longitude: 125.5406,
    zoom: 11
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await supabase.from('province').select('province_id, name').order('name')
        if (data) setProvinces(data)
      } catch (err) {
        console.error("Error loading provinces:", err)
      }
    }
    fetchProvinces()
  }, [])

  const handleLatChange = (val) => {
    const cleanVal = val.replace(/[^0-9.-]/g, "")
    setLatitude(cleanVal)
    const parsedLat = parseFloat(cleanVal)
    if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
      setViewState(prev => ({ ...prev, latitude: parsedLat }))
    }
  }

  const handleLngChange = (val) => {
    const cleanVal = val.replace(/[^0-9.-]/g, "")
    setLongitude(cleanVal)
    const parsedLng = parseFloat(cleanVal)
    if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
      setViewState(prev => ({ ...prev, longitude: parsedLng }))
    }
  }

  const handleMarkerDragEnd = (evt) => {
    const newLat = evt.lngLat.lat
    const newLng = evt.lngLat.lng
    setLatitude(newLat.toFixed(6))
    setLongitude(newLng.toFixed(6))
    setViewState(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!municipalityName.trim()) {
      alert("Please enter a municipality or city name.")
      return
    }

    const latNum = parseFloat(latitude)
    const lngNum = parseFloat(longitude)

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("Please enter valid numeric latitude and longitude values.")
      return
    }

    setIsSubmitting(true)

    try {
      let targetProvinceId = selectedProvinceId

      if (isNewProvince || !targetProvinceId) {
        if (!newProvinceName.trim()) {
          alert("Please specify a province name.")
          setIsSubmitting(false)
          return
        }

        const { data: newProv, error: provErr } = await supabase
          .from('province')
          .insert({ name: newProvinceName.trim() })
          .select('province_id')
          .single()

        if (provErr) throw provErr
        targetProvinceId = newProv.province_id
      }

      const { error: muniErr } = await supabase
        .from('municipality_or_city')
        .insert({
          province_id: targetProvinceId,
          name: municipalityName.trim(),
          center_latitude: latNum,
          center_longitude: lngNum,
          added_on: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (muniErr) throw muniErr

      router.push('/national-admin/seeding')
      router.refresh()
    } catch (err) {
      console.error("Failed to add area:", err)
      alert(err.message || "Failed to add area record.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentLat = parseFloat(latitude) || 8.9475
  const currentLng = parseFloat(longitude) || 125.5406

  const selectedProvinceObj = provinces.find(p => p.province_id === selectedProvinceId)
  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(provinceSearch.toLowerCase().trim())
  )

  return (
    <SideModal>
      {/* Modal Header */}
      <div className="flex justify-between items-center sticky top-0 bg-white p-4 border-b border-gray-100 z-10">
        <div>
          <CardSubHeader className="text-lg text-primary">Add New Seeding Area</CardSubHeader>
          <CardBasedText className="text-xs text-gray-400 font-medium mt-0.5">
            Register a province or municipality with map coordinates
          </CardBasedText>
        </div>
        <Link href="/national-admin/seeding" className="hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer">
          <X className="size-5 text-gray-500" />
        </Link>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 grid gap-5 overflow-y-auto">
        
        {/* Styled Province Dropdown Section */}
        <div className="grid gap-2 p-3 bg-gray-50/70 rounded-xl border border-gray-100 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 font-semibold text-xs text-gray-700">
              <MapPin className="size-4 text-primary" />
              <span>Province Name *</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsNewProvince(!isNewProvince)
                setIsDropdownOpen(false)
              }}
              className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isNewProvince ? "Select Existing Province" : "+ Create New Province"}
            </button>
          </div>

          {isNewProvince ? (
            <GeneralInput
              value={newProvinceName}
              onChange={(e) => setNewProvinceName(e.target.value)}
              placeholder="Enter new province name (e.g. Agusan del Norte)"
              required
            />
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-white text-xs text-gray-800 border border-gray-200 rounded-xl p-3 shadow-2xs hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary opacity-70" />
                  <span className={selectedProvinceObj ? "font-semibold text-gray-800" : "text-gray-400"}>
                    {selectedProvinceObj ? selectedProvinceObj.name : "Select Province from Database"}
                  </span>
                </div>
                <ChevronDown className={`size-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Custom Styled Dropdown Popover */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden max-h-60 flex flex-col">
                  {/* Search Bar inside dropdown */}
                  <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                    <Search className="size-3.5 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      placeholder="Search provinces..."
                      className="w-full bg-transparent text-xs outline-0"
                    />
                  </div>

                  <div className="overflow-y-auto max-h-48 p-1">
                    {filteredProvinces.length > 0 ? (
                      filteredProvinces.map((p) => {
                        const isSelected = p.province_id === selectedProvinceId
                        return (
                          <button
                            key={p.province_id}
                            type="button"
                            onClick={() => {
                              setSelectedProvinceId(p.province_id)
                              setIsDropdownOpen(false)
                            }}
                            className={`w-full flex items-center justify-between text-left text-xs p-2.5 rounded-lg transition-colors cursor-pointer ${
                              isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span>{p.name}</span>
                            {isSelected && <Check className="size-4 text-primary" />}
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No provinces matching "{provinceSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Municipality / City Name */}
        <div className="grid gap-1">
          <div className="flex items-center gap-2 font-semibold text-xs text-gray-700">
            <Building2 className="size-4 text-primary" />
            <span>Municipality / City Name *</span>
          </div>
          <GeneralInput
            value={municipalityName}
            onChange={(e) => setMunicipalityName(e.target.value)}
            placeholder="e.g. Butuan City"
            required
          />
        </div>

        {/* Interactive Mapbox Map for Coordinates */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center font-semibold gap-2">
              <Compass className="text-primary size-4" />
              <CardSubHeader>Map Location Picker</CardSubHeader>
            </div>
            <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
              <Crosshair className="size-3" /> Drag pin or edit numbers to move map
            </span>
          </div>

          <div className="h-56 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group">
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
                draggable
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

            {/* Coordinate Overlay Badge */}
            <div className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
              <span className="text-emerald-400 font-bold">Lat:</span> {currentLat.toFixed(6)}
              <span className="text-emerald-400 font-bold">Lng:</span> {currentLng.toFixed(6)}
            </div>
          </div>
        </div>

        {/* Latitude and Longitude Input Fields */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
          <div className="grid gap-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-gray-700">
              <Compass className="size-3.5 text-primary" />
              <span>Center Latitude *</span>
            </div>
            <GeneralInput
              value={latitude}
              onChange={(e) => handleLatChange(e.target.value)}
              type="text"
              inputMode="decimal"
              placeholder="8.9475"
              required
            />
          </div>

          <div className="grid gap-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-gray-700">
              <Compass className="size-3.5 text-primary" />
              <span>Center Longitude *</span>
            </div>
            <GeneralInput
              value={longitude}
              onChange={(e) => handleLngChange(e.target.value)}
              type="text"
              inputMode="decimal"
              placeholder="125.5406"
              required
            />
          </div>
        </div>

        {/* Submit Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
          <Link
            href="/national-admin/seeding"
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <PrimaryButton type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Adding Area..." : "Register Area"}
          </PrimaryButton>
        </div>
      </form>
    </SideModal>
  )
}
