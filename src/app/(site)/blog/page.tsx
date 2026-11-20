import Link from "next/link"
import { PageBanner } from "@/components/site/chrome"
import { posts } from "@/content/public"

export default function BlogPage() {
  return (
    <div>
      <PageBanner title="Blog" crumbs={["Blog"]} />
      <div className="site-wrap grid gap-6 py-14 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white shadow-sm">
            <img src={post.image} alt="" className="h-48 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs font-bold text-[var(--pub-green)]">{post.date}</p>
              <h2 className="mt-2 text-2xl normal-case"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p className="mt-2 text-sm text-[var(--pub-muted)]">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
