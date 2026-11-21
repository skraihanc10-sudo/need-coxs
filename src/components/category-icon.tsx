import { Building2, Droplets, HardHat, Pencil, Shirt, Snowflake, Sparkles, Truck, Wifi, Wrench, Zap, type LucideIcon } from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  shirt: Shirt,
  wifi: Wifi,
  zap: Zap,
  droplet: Droplets,
  snow: Snowflake,
  spark: Sparkles,
  building: Building2,
  truck: Truck,
  hardhat: HardHat,
  pencil: Pencil,
  wrench: Wrench,
}

export const ICON_NAMES = Object.keys(ICONS)

export function CategoryIcon({ name, className = "size-6" }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles
  return <Icon className={className} />
}
