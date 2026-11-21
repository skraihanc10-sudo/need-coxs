import type { MetadataRoute } from "next"
import { brand } from "@/theme/brand"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} · ${brand.nameBn}`,
    short_name: brand.nameBn,
    description: brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1463f3",
    lang: "bn",
  }
}
