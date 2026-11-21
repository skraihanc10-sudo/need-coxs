import { randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { AppError } from "./errors"

const MAX_BYTES = 5 * 1024 * 1024

/** Uploads live next to the SQLite file, so they share the /data volume in production. */
export function uploadDir() {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR
  const url = process.env.DATABASE_URL ?? ""
  if (url.startsWith("file:")) {
    const file = url.slice(5)
    if (path.isAbsolute(file)) return path.join(path.dirname(file), "uploads")
  }
  return path.join(process.cwd(), "data", "uploads")
}

function sniff(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg"
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png"
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45) return "webp"
  return null
}

/** Save the images from a form field. Returns stored names like "ab12cd.jpg". */
export async function saveImages(files: FormDataEntryValue[], max = 6) {
  const images = files.filter((f): f is File => typeof f !== "string" && f.size > 0)
  if (images.length > max) throw new AppError(`একবারে সর্বোচ্চ ${max}টা ছবি দিন।`, `Upload up to ${max} photos at a time.`)
  const dir = uploadDir()
  await mkdir(dir, { recursive: true })
  const names: string[] = []
  for (const file of images) {
    if (file.size > MAX_BYTES) throw new AppError("প্রতিটা ছবি ৫ MB-এর কম হতে হবে।", "Each photo must be under 5 MB.")
    const bytes = new Uint8Array(await file.arrayBuffer())
    const ext = sniff(bytes)
    if (!ext) throw new AppError("শুধু JPG, PNG বা WebP ছবি দিন।", "Only JPG, PNG or WebP photos.")
    const name = `${randomBytes(12).toString("hex")}.${ext}`
    await writeFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dir, name), bytes)
    names.push(name)
  }
  return names
}

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }

export async function readImage(name: string) {
  if (!/^[a-f0-9]{24}\.(jpg|png|webp)$/.test(name)) return null
  try {
    // The upload folder is runtime config (the /data volume), so Turbopack must not trace it.
    const data = await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ uploadDir(), name))
    return { data, type: TYPES[name.split(".")[1]] }
  } catch {
    return null
  }
}
