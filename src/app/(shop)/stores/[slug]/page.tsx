import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { PageHeader, Money } from "@/components/bits"
import { ItemPicker } from "@/components/interactive"
import { AUDIENCES } from "@/lib/status"
import { copy } from "@/lib/i18n"
import { getLocale, getUser } from "@/lib/auth"
import { isOpen } from "@/lib/format"
import Link from "next/link"

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ for?: string }>
}) {
  const { slug } = await params
  const { for: audience = "MEN" } = await searchParams
  const locale = await getLocale()
  const t = copy(locale)
  const user = await getUser()
  const store = await db.store.findUnique({
    where: { slug },
    include: {
      faqs: { orderBy: { sort: "asc" } },
      reviews: { include: { customer: true }, orderBy: { createdAt: "desc" }, take: 4 },
    },
  })
  if (!store || (store.status !== "APPROVED" && user?.id !== store.ownerId && user?.role !== "ADMIN")) notFound()
  const [items, bulk, cart] = await Promise.all([
    db.item.findMany({
      where: { active: true, audience },
      orderBy: { sort: "asc" },
      include: { prices: { where: { storeId: store.id, active: true }, include: { kind: true }, orderBy: { kind: { sort: "asc" } } } },
    }),
    db.item.findMany({
      where: { active: true, audience: "BULK" },
      orderBy: { sort: "asc" },
      include: { prices: { where: { storeId: store.id, active: true }, include: { kind: true } } },
    }),
    user?.role === "CUSTOMER"
      ? db.cartItem.findMany({ where: { userId: user.id }, include: { price: true } })
      : Promise.resolve([]),
  ])
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price.amount, 0)

  return (
    <div className="pb-24">
      <PageHeader title={store.name} back="/" />
      <div className="mx-4 h-28 rounded-3xl" style={{ background: `linear-gradient(135deg, hsl(${store.hue} 62% 40%), hsl(${store.hue + 18} 75% 58%))` }} />
      <div className="px-4 pt-3">
        <p className="text-sm text-muted-foreground">{store.area} · ★ {store.rating.toFixed(1)} ({store.reviewCount}) · {isOpen(store.openTime, store.closeTime) ? t.open : t.closed}</p>
        <p className="mt-1 text-sm">{store.tagline}</p>
        <p className="mt-1 text-sm">{t.delivery} <Money value={store.deliveryFee} locale={locale} /> · {t.minOrder} <Money value={store.minOrder} locale={locale} /></p>
      </div>
      <div className="seg mt-4 px-4">
        {AUDIENCES.map((item) => (
          <Link key={item.id} href={`/stores/${store.slug}?for=${item.id}`} data-on={audience === item.id}>
            {locale === "bn" ? item.bn : item.en}
          </Link>
        ))}
      </div>
      <section className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-extrabold">{t.byKilo}</h2>
        <div className="space-y-2">
          {bulk.map((item) => (
            <Row key={item.id} item={item} locale={locale} add={t.add} choose={t.chooseService} />
          ))}
        </div>
      </section>
      <section className="mt-4 space-y-2 px-4">
        {items.map((item) => (
          <Row key={item.id} item={item} locale={locale} add={t.add} choose={t.chooseService} />
        ))}
      </section>
      {store.faqs.length ? (
        <section className="mt-6 px-4">
          <h2 className="font-extrabold">{t.faq}</h2>
          {store.faqs.map((faq) => (
            <details key={faq.id} className="mt-2 rounded-2xl border px-3 py-2">
              <summary className="cursor-pointer font-semibold">{faq.question}</summary>
              <p className="pt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </section>
      ) : null}
      {store.reviews.length ? (
        <section className="mt-6 px-4">
          <h2 className="font-extrabold">{t.writeReview}</h2>
          {store.reviews.map((review) => (
            <article key={review.id} className="mt-2 text-sm">
              <p className="font-bold">{review.customer.name} · ★ {review.rating}</p>
              <p className="text-muted-foreground">{review.comment}</p>
            </article>
          ))}
        </section>
      ) : null}
      {count > 0 ? (
        <Link href="/cart" className="dock mx-4 flex items-center justify-between rounded-full bg-primary px-5 py-3 text-primary-foreground">
          <span className="font-bold">{t.bag} · {count}</span>
          <span className="font-extrabold">{takaSafe(subtotal, locale)}</span>
        </Link>
      ) : null}
    </div>
  )
}

function takaSafe(value: number, locale: "en" | "bn") {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(value).replace(/^/, "৳")
}

function Row({
  item,
  locale,
  add,
  choose,
}: {
  item: {
    name: string
    nameBn: string
    unit: string
    unitBn: string
    prices: { id: string; amount: number; kind: { name: string; nameBn: string } }[]
  }
  locale: "en" | "bn"
  add: string
  choose: string
}) {
  if (!item.prices.length) return null
  const from = Math.min(...item.prices.map((price) => price.amount))
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-3">
      <span className="icon-chip text-xs font-extrabold">{item.name.slice(0, 1)}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{locale === "bn" ? item.nameBn : item.name}</p>
        <p className="text-sm"><span className="price">৳{from}</span> / {locale === "bn" ? item.unitBn : item.unit}</p>
      </div>
      <ItemPicker
        itemName={locale === "bn" ? item.nameBn : item.name}
        unit={locale === "bn" ? item.unitBn : item.unit}
        locale={locale}
        addLabel={add}
        chooseLabel={choose}
        prices={item.prices.map((price) => ({
          id: price.id,
          kind: locale === "bn" ? price.kind.nameBn : price.kind.name,
          amount: price.amount,
        }))}
      />
    </div>
  )
}
