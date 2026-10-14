import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex max-w-lg flex-col items-center gap-5 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <BookOpen className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            QueryPad
          </h1>
          <p className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed max-w-md">
            Sign in to start learning and chatting with your sources.
          </p>
        </div>

        <Link href="/login" className="mt-2">
          <Button size="lg" className="h-10 gap-2 rounded-xl px-6 text-[13.5px] font-semibold shadow-md">
            <span>Get started</span>
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}