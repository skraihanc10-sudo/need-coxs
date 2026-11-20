import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, ErrorNote } from "@/components/bits"
import { deleteFaq, saveStoreFaq } from "@/actions/vendor"

export default async function StoreFaq({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser(["STORE"], "/vendor/faq")
  const sp = await searchParams
  const faqs = await db.faq.findMany({ where: { storeId: user.store!.id } })
  return (
    <div>
      <PageHeader title="FAQs" back="/vendor/account" />
      <ErrorNote message={sp.error} />
      <div className="space-y-2 px-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-2xl border p-3">
            <p className="font-bold">{faq.question}</p>
            <p className="text-sm">{faq.answer}</p>
            <form action={deleteFaq}><input type="hidden" name="id" value={faq.id} /><button className="text-sm text-rose-600">Delete</button></form>
          </div>
        ))}
      </div>
      <form action={saveStoreFaq} className="mt-4 space-y-2 px-4 pb-8">
        <input name="question" required placeholder="Question" className="h-11 w-full rounded-xl border px-3" />
        <textarea name="answer" required placeholder="Answer" className="min-h-20 w-full rounded-xl border px-3 py-2" />
        <button className="pill w-full bg-primary text-primary-foreground">Add FAQ</button>
      </form>
    </div>
  )
}
