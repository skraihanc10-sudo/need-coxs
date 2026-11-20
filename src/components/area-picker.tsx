"use client"

import { useState } from "react"
import { AREAS } from "@/lib/format"

export function AreaPicker() {
  const [area, setArea] = useState(AREAS.find((item) => item.name === "Dhanmondi") ?? AREAS[0])
  return (
    <>
      <select
        name="area"
        value={area.name}
        onChange={(event) => setArea(AREAS.find((item) => item.name === event.target.value) ?? AREAS[0])}
        className="h-12 w-full rounded-xl border px-3"
      >
        {AREAS.map((item) => (
          <option key={item.name} value={item.name}>{item.name}</option>
        ))}
      </select>
      <input type="hidden" name="lat" value={area.lat} />
      <input type="hidden" name="lng" value={area.lng} />
    </>
  )
}
