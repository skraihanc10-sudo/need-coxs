import Link from "next/link"
import { Bell, Search, ShoppingBag } from "lucide-react"
import { Logo } from "@/components/logo"
import { HeroArt } from "@/components/art"
import { db } from "@/lib/db"
import { copy } from "@/lib/i18n"
import { getViewer } from "@/lib/queries"
import { isOpen, km, taka } from "@/lib/format"
import { KindIcon, StoreLogo } from "@/components/laundry-icons"

export default async function AppHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const viewer = await getViewer()
  const t = copy(viewer.locale)
  const { q = "" } = await searchParams
  const query = q.trim().toLowerCase()
  const [stores, kinds, banners] = await Promise.all([
    db.store.findMany({
      where: { status: "APPROVED" },
      include: { prices: { where: { active: true }, select: { amount: true } } },
    }),
    db.kind.findMany({ orderBy: { sort: "asc" } }),
    db.banner.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
  ])
  const near = viewer.address?.lat && viewer.address.lng ? { lat: viewer.address.lat, lng: viewer.address.lng } : null
  const list = stores
    .filter((store) => !query || `${store.name} ${store.area}`.toLowerCase().includes(query))
    .map((store) => ({
      ...store,
      from: store.prices.length ? Math.min(...store.prices.map((price) => price.amount)) : 0,
      distance: near ? km(near, store) : null,
    }))
    .sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99))

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between px-4 pt-4">
        <Logo size={30} />
        <div className="flex items-center gap-2">
          <Link href="/profile/language" className="rounded-full bg-[color-mix(in_srgb,var(--accent)_20%,white)] px-3 py-1 text-xs font-extrabold text-[var(--accent-ink)]">
            {viewer.locale === "bn" ? "বাং" : "EN"}
          </Link>
          <Link href="/notices" className="grid size-10 place-items-center rounded-full bg-muted" aria-label={t.notices}>
            <Bell className="size-5" />
          </Link>
          <Link href="/cart" className="relative grid size-10 place-items-center rounded-full bg-muted" aria-label={t.bag}>
            <ShoppingBag className="size-5" />
            {viewer.cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[#06283a]">
                {viewer.cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
      <p className="px-4 pt-3 text-xs text-muted-foreground">{t.deliverTo}</p>
      <p className="px-4 font-extrabold">{viewer.address?.area ?? "Dhaka"}</p>
      <div className="hero-banner mx-4 mt-3 flex items-center justify-between gap-2 px-4 py-4">
        <div>
          <h2 className="text-xl font-extrabold leading-tight">{t.findNearest}</h2>
          <p className="mt-1 text-sm text-white/85">{t.findSub}</p>
        </div>
        <HeroArt />
      </div>
      <form action="/app" className="relative mx-4 -mt-4">
        <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
        <input name="q" defaultValue={q} placeholder={t.search} className="h-12 w-full rounded-full border bg-white pr-4 pl-10 text-sm shadow-sm" />
      </form>
      <div className="mt-5 flex gap-3 overflow-x-auto px-4">
        {kinds.map((kind) => (
          <Link key={kind.id} href={`/c/${kind.slug}`} className="flex w-16 shrink-0 flex-col items-center gap-1 text-center text-[11px] font-semibold">
            <span className="icon-chip"><KindIcon slug={kind.slug} /></span>
            {viewer.locale === "bn" ? kind.nameBn : kind.name}
          </Link>
        ))}
      </div>
      {banners.length ? (
        <div className="mt-4 flex gap-3 overflow-x-auto px-4">
          {banners.map((banner) => (
            <Link key={banner.id} href={banner.href} className="surface-card min-w-[75%] px-4 py-3">
              <p className="font-extrabold">{viewer.locale === "bn" ? banner.titleBn : banner.title}</p>
              <p className="text-sm text-muted-foreground">{viewer.locale === "bn" ? banner.subtitleBn : banner.subtitle}</p>
            </Link>
          ))}
        </div>
      ) : null}
      <div className="mt-5 flex items-center justify-between px-4">
        <h2 className="font-extrabold">{t.nearYou}</h2>
        <Link href="/stores" className="text-sm font-bold text-[var(--brand)]">{t.browse}</Link>
      </div>
      <div className="mt-3 space-y-3 px-4">
        {list.map((store) => (
          <Link key={store.id} href={`/stores/${store.slug}`} className="surface-card block overflow-hidden">
            <div className="relative h-32">
              {store.cover ? <img src={store.cover} alt="" className="h-full w-full object-cover" /> : <div className="h-full" style={{ background: `linear-gradient(135deg, hsl(${store.hue} 62% 42%), hsl(${store.hue + 24} 80% 58%))` }} />}
              <span className="absolute -bottom-4 left-3"><StoreLogo mark={store.logo || "both"} /></span>
            </div>
            <div className="p-3 pt-6">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold">{store.name}</h3>
                <span className="text-sm font-bold">★ {store.rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {store.area}
                {store.distance != null ? ` · ${store.distance.toFixed(1)} km` : ""} · {isOpen(store.openTime, store.closeTime) ? t.open : t.closed}
              </p>
              <p className="mt-1 text-sm">
                {t.from} <span className="price">{taka(store.from, viewer.locale)}</span> · {t.delivery} {taka(store.deliveryFee, viewer.locale)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
