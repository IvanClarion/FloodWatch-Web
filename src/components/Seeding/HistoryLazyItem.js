"use client"

import { useState, useEffect, useRef } from "react"
import SingleLineSkeleton from "@/components/skeleton/SingleLineSkeleton"

export default function HistoryLazyItem({ item }) {
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
            { rootMargin: "100px" } // Triggers slightly before it enters the viewport
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (state !== "loading") return;
        const timer = setTimeout(() => setState("loaded"), 300);
        return () => clearTimeout(timer);
    }, [state]);

    return (
        <div 
            ref={ref}
            className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-white/50 hover:bg-white/80 transition-colors"
            style={state === "hidden" ? { visibility: "hidden", height: "54px" } : undefined}
        >
            {state === "hidden" ? (
                <>
                    <div style={{ display: 'none' }} />
                    <div style={{ display: 'none' }} />
                </>
            ) : state === "loading" ? (
                <>
                    <div className="w-1/2"><SingleLineSkeleton /></div>
                    <div className="w-1/4"><SingleLineSkeleton /></div>
                </>
            ) : (
                <>
                    <span className="font-medium text-gray-800">
                        {item.municipality_or_city?.name || 'Unknown Area'}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100/80 px-2 py-1 rounded-md">
                        {new Date(item.added_on).toLocaleString('en-US', {
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true
                        })}
                    </span>
                </>
            )}
        </div>
    )
}
