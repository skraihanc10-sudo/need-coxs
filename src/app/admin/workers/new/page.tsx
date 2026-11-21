import { requireUser, getLocale } from "@/lib/auth"
import { db } from "@/lib/db"
import { pick } from "@/lib/i18n"
import { PageHeader } from "@/components/bits"
import { WorkerForm } from "@/components/admin/worker-form"

export default async function NewWorkerPage() {
  const [, locale] = await Promise.all([requireUser(["ADMIN"], "/admin/workers/new"), getLocale()])
  const [categories, areas] = await Promise.all([db.serviceCategory.findMany({ orderBy: { sort: "asc" } }), db.serviceArea.findMany({ orderBy: { sort: "asc" } })])
  return (
    <div>
      <PageHeader back="/admin/workers" title={pick(locale, "নতুন কর্মী", "New worker")} />
      <WorkerForm locale={locale} worker={null} categories={categories} areas={areas} />
    </div>
  )
}
