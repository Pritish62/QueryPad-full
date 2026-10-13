import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { MemorySettings } from "@/features/memory";

export const metadata = {
  title: "Memory · QueryPad",
};

export default function MemoryPage() {
  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6 md:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to dashboard
          </Link>
          <ModeToggle />
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8 md:py-14">
        <MemorySettings />
      </div>
    </main>
  );
}
