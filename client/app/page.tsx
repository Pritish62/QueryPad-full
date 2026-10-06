import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {

    
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6">
            <div className="flex max-w-lg flex-col items-center gap-4 text-center">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    QueryPad
                </h1>
                <p className="text-muted-foreground">
                    Sign in to start chatting with your books.
                </p>
                    Get started
               
            </div>
        </div>
    );
}