import { Bug, Droplets, Hammer, HardHat, Paintbrush, Shirt, Snowflake, Sparkles, Truck, Wifi, Zap } from "lucide-react"

const ICONS = {
  shirt: Shirt,
  wifi: Wifi,
  zap: Zap,
  droplet: Droplets,
  snow: Snowflake,
  spark: Sparkles,
  bug: Bug,
  paint: Paintbrush,
  hammer: Hammer,
  truck: Truck,
  hardhat: HardHat,
} as const

export function CategoryIcon({ name, className = "size-6" }: { name: string; className?: string }) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Sparkles
  return <Icon className={className} />
}
