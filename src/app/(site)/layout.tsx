import { SiteShell } from "@/components/shell/site-shell"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
