import Link from "next/link"
import { notFound } from "next/navigation"
import { PageBanner } from "@/components/site/chrome"
import { postBySlug, posts } from "@/content/public"

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) notFound()
  return (
    <div>
      <PageBanner title={post.title} crumbs={["Blog", post.title]} />
      <article className="site-wrap grid gap-10 py-14 lg:grid-cols-[1fr_280px]">
        <div>
          <img src={post.image} alt="" className="h-80 w-full object-cover" />
          <p className="mt-4 text-xs font-bold text-[var(--pub-green)]">{post.date}</p>
          <p className="mt-4 text-sm leading-7">{post.body}</p>
          <Link href="/app" className="pub-btn mt-6">Book now</Link>
        </div>
        <aside className="space-y-3">
          <h2 className="text-2xl">More articles</h2>
          {posts.filter((item) => item.slug !== post.slug).map((item) => (
            <Link key={item.slug} href={`/blog/${item.slug}`} className="block text-sm font-semibold">{item.title}</Link>
          ))}
        </aside>
      </article>
    </div>
  )
}
