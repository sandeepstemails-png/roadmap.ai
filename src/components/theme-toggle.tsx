"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid a hydration mismatch: the resolved theme isn't known until the
  // client reads localStorage/media query, so render a stable icon on the
  // server and swap in the real one once hydrated.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Toggle theme">
            {mounted && theme === "dark" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
