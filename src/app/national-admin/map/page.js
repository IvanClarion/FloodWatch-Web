"use client";

import { useState, Suspense, lazy } from "react";
import MapToggleSwitch from "@/components/maps/MapToggleSwitch";
import MapsDocumentation from "@/components/maps/MapsDocumentation";
import MapSkeleton from "@/components/skeleton/MapSkeleton";

const Map = lazy(() => import("@/components/maps/Map"));
const WeatherMap = lazy(() => import("@/components/maps/WeatherMap"));

export default function Page() {
  const [activeTab, setActiveTab] = useState('Risk Mapping');

  return (
    <section className="grid relative gap-5 mt-2">
      <div className="flex justify-between">
        <MapToggleSwitch activeTab={activeTab} onTabChange={setActiveTab} />
        <MapsDocumentation/>
      </div>
      
      <Suspense fallback={<MapSkeleton />}>
        {activeTab === 'Risk Mapping' ? <Map /> : <WeatherMap />}
      </Suspense>
      
    </section>
  )
}
