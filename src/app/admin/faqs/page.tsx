import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteAdminFaq, saveFaq } from "@/actions/admin"

export default async function AdminFaqs() {
  await requireUser(["ADMIN"], "/admin/faqs")
  const faqs = await db.faq.findMany({ where: { storeId: null } })
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-extrabold">FAQs</h1>
      <div className="mt-3 space-y-2">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-2xl border bg-white p-3">
            <p className="font-bold">{faq.question}</p>
            <p className="text-sm">{faq.answer}</p>
            <form action={deleteAdminFaq}><input type="hidden" name="id" value={faq.id} /><button className="text-sm text-rose-600">Delete</button></form>
          </div>
        ))}
      </div>
      <form action={saveFaq} className="mt-4 grid max-w-lg gap-2">
        <input name="question" required placeholder="Question" className="h-11 rounded-xl border px-3" />
        <textarea name="answer" required placeholder="Answer" className="min-h-24 rounded-xl border px-3 py-2" />
        <button className="pill bg-primary text-primary-foreground">Add</button>
      </form>
    </div>
  )
}
