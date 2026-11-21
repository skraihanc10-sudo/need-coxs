"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { AppError } from "@/lib/errors"
import { run, type ActionState } from "@/lib/action"
import { actor } from "@/lib/auth"
import { normalisePhone } from "@/lib/format"
import { saveImages } from "@/lib/uploads"
import { saveSettings, SETTING_KEYS } from "@/lib/settings"
import { areaSchema, categorySchema, faqSchema, formObject, offeringSchema, parse, staffSchema, templateSchema, workerSchema } from "@/lib/validation"

const done = (path = "/admin") => {
  revalidatePath(path, "layout")
  revalidatePath("/", "layout")
}

// ── Services ───────────────────────────────────────────────────────────────

export async function saveCategoryAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const { id, ...data } = parse(categorySchema, formObject(form))
    const clash = await db.serviceCategory.findFirst({ where: { slug: data.slug, NOT: id ? { id } : undefined } })
    if (clash) throw new AppError("এই স্লাগ আগে থেকে আছে।", "That slug is already used.")
    const image = (await saveImages(form.getAll("imageFile"), 1))[0]
    const payload = { ...data, ...(image ? { image: `/api/uploads/${image}` } : {}) }
    if (id) await db.serviceCategory.update({ where: { id }, data: payload })
    else await db.serviceCategory.create({ data: payload })
    done()
    return "সেবা সেভ হয়েছে।"
  })
}

export async function toggleCategoryAction(form: FormData) {
  await actor(["ADMIN"])
  const id = String(form.get("id") ?? "")
  const row = await db.serviceCategory.findUnique({ where: { id } })
  if (row) await db.serviceCategory.update({ where: { id }, data: { active: !row.active } })
  done()
}

export async function saveOfferingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const { id, ...data } = parse(offeringSchema, formObject(form))
    const clash = await db.serviceOffering.findFirst({ where: { categoryId: data.categoryId, slug: data.slug, NOT: id ? { id } : undefined } })
    if (clash) throw new AppError("এই সেবায় এই স্লাগ আগে থেকে আছে।", "That slug already exists in this service.")
    if (id) await db.serviceOffering.update({ where: { id }, data })
    else await db.serviceOffering.create({ data })
    done()
    return "সাব-সার্ভিস সেভ হয়েছে।"
  })
}

export async function toggleOfferingAction(form: FormData) {
  await actor(["ADMIN"])
  const id = String(form.get("id") ?? "")
  const row = await db.serviceOffering.findUnique({ where: { id } })
  if (row) await db.serviceOffering.update({ where: { id }, data: { active: !row.active } })
  done()
}

// ── Areas ──────────────────────────────────────────────────────────────────

export async function saveAreaAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const { id, ...data } = parse(areaSchema, formObject(form))
    const clash = await db.serviceArea.findFirst({ where: { slug: data.slug, NOT: id ? { id } : undefined } })
    if (clash) throw new AppError("এই স্লাগ আগে থেকে আছে।", "That slug is already used.")
    if (id) await db.serviceArea.update({ where: { id }, data })
    else await db.serviceArea.create({ data })
    done()
    return "এলাকা সেভ হয়েছে।"
  })
}

export async function toggleAreaAction(form: FormData) {
  await actor(["ADMIN"])
  const id = String(form.get("id") ?? "")
  const row = await db.serviceArea.findUnique({ where: { id } })
  if (row) await db.serviceArea.update({ where: { id }, data: { active: !row.active } })
  done()
}

// ── Workers ────────────────────────────────────────────────────────────────

export async function saveWorkerAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const raw = formObject(form)
    const input = parse(workerSchema, {
      ...raw,
      skills: form.getAll("skills"),
      areas: form.getAll("areas"),
    })
    const phone = normalisePhone(input.phone)
    if (!phone) throw new AppError("সঠিক মোবাইল নম্বর দিন।", "Enter a valid mobile number.")
    const email = input.email ? input.email.toLowerCase() : null
    const [photo] = await saveImages(form.getAll("photoFile"), 1)
    const [nidPhoto] = await saveImages(form.getAll("nidFile"), 1)

    let userId: string
    if (input.id) {
      const profile = await db.workerProfile.findUnique({ where: { id: input.id } })
      if (!profile) throw new AppError("কর্মী পাওয়া যায়নি।", "Worker not found.")
      userId = profile.userId
    } else {
      if (!input.password || input.password.length < 6) throw new AppError("নতুন কর্মীর জন্য অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।", "Give the new worker a password of at least 6 characters.")
      userId = ""
    }
    const clash = await db.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])], NOT: userId ? { id: userId } : undefined },
    })
    if (clash) throw new AppError("এই মোবাইল বা ইমেইল অন্য অ্যাকাউন্টে আছে।", "That mobile or email belongs to another account.")

    const userData = {
      name: input.name,
      phone,
      email,
      ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 10) } : {}),
    }
    const user = userId
      ? await db.user.update({ where: { id: userId }, data: userData })
      : await db.user.create({ data: { ...userData, role: "WORKER" } })
    const profileData = {
      isRider: input.isRider,
      nid: input.nid,
      ...(photo ? { photo: `/api/uploads/${photo}` } : {}),
      ...(nidPhoto ? { nidPhoto: `/api/uploads/${nidPhoto}` } : {}),
    }
    const profile = await db.workerProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: { userId: user.id, ...profileData },
    })
    await db.$transaction([
      db.workerSkill.deleteMany({ where: { workerId: profile.id } }),
      db.workerSkill.createMany({ data: input.skills.map((categoryId) => ({ workerId: profile.id, categoryId })) }),
      db.workerArea.deleteMany({ where: { workerId: profile.id } }),
      db.workerArea.createMany({ data: input.areas.map((areaId) => ({ workerId: profile.id, areaId })) }),
    ])
    done()
    return "কর্মী সেভ হয়েছে।"
  })
}

export async function toggleUserAction(form: FormData) {
  const me = await actor(["ADMIN"])
  const id = String(form.get("id") ?? "")
  if (id === me.id) return
  const row = await db.user.findUnique({ where: { id } })
  if (row) await db.user.update({ where: { id }, data: { active: !row.active } })
  done()
}

export async function saveStaffAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const input = parse(staffSchema, formObject(form))
    const email = input.email.toLowerCase()
    if (await db.user.findUnique({ where: { email } })) throw new AppError("এই ইমেইল আগে থেকে আছে।", "That email is already used.")
    const phone = input.phone ? normalisePhone(input.phone) || null : null
    await db.user.create({ data: { name: input.name, email, phone, role: input.role, passwordHash: await bcrypt.hash(input.password, 10) } })
    done()
    return "স্টাফ অ্যাকাউন্ট তৈরি হয়েছে।"
  })
}

export async function resetPasswordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const id = String(form.get("id") ?? "")
    const password = String(form.get("password") ?? "")
    if (password.length < 6) throw new AppError("পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।", "Password must be at least 6 characters.")
    await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } })
    return "পাসওয়ার্ড বদলানো হয়েছে।"
  })
}

// ── Content & settings ─────────────────────────────────────────────────────

export async function saveSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const entries: Record<string, string> = {}
    for (const key of SETTING_KEYS) {
      if (key.startsWith("pay")) entries[key] = form.get(key) ? "1" : "0"
      else if (form.has(key)) entries[key] = String(form.get(key)).trim().slice(0, 500)
    }
    if (entries.workerShare !== undefined) {
      const share = Number(entries.workerShare)
      if (!(share >= 0 && share <= 100)) throw new AppError("কর্মীর ভাগ ০–১০০% এর মধ্যে দিন।", "Worker share must be 0–100%.")
    }
    await saveSettings(entries)
    done()
    return "সেটিংস সেভ হয়েছে।"
  })
}

export async function saveFaqAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN"])
    const { id, ...data } = parse(faqSchema, formObject(form))
    if (id) await db.faq.update({ where: { id }, data })
    else await db.faq.create({ data })
    done()
    return "FAQ সেভ হয়েছে।"
  })
}

export async function deleteFaqAction(form: FormData) {
  await actor(["ADMIN"])
  await db.faq.deleteMany({ where: { id: String(form.get("id") ?? "") } })
  done()
}

export async function saveTemplateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return run(async () => {
    await actor(["ADMIN", "SUPPORT"])
    const { id, ...data } = parse(templateSchema, formObject(form))
    if (id) await db.replyTemplate.update({ where: { id }, data })
    else await db.replyTemplate.create({ data })
    revalidatePath("/support", "layout")
    revalidatePath("/admin", "layout")
    return "টেমপ্লেট সেভ হয়েছে।"
  })
}

export async function deleteTemplateAction(form: FormData) {
  await actor(["ADMIN", "SUPPORT"])
  await db.replyTemplate.deleteMany({ where: { id: String(form.get("id") ?? "") } })
  revalidatePath("/support", "layout")
  revalidatePath("/admin", "layout")
}
