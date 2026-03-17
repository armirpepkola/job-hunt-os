import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">OS</span>
          </div>
          <h1 className="font-bold text-xl tracking-tight text-zinc-900">
            Job Hunt OS
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600 hidden md:block">
            {user?.email}
          </span>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-zinc-600"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
