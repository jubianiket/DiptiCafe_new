'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Coffee,
  LayoutDashboard,
  Menu,
  Gamepad2,
  Warehouse,
  History,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { getRole } from '@/lib/actions/auth';
import type { UserRole } from '@/lib/types';

export function MobileNav() {
    const pathname = usePathname();
    const [role, setRole] = useState<UserRole>('Staff');

    useEffect(() => {
      async function fetchRole() {
        const currentRole = await getRole();
        setRole(currentRole);
      }
      fetchRole();
    }, []);

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/menu', label: 'Menu', icon: BookOpen },
        { href: '/play', label: 'Play', icon: Gamepad2 },
        { href: '/inventory', label: 'Inventory', icon: Warehouse },
        { href: '/history', label: 'History', icon: History },
    ];

    if (role === 'Admin') {
      navItems.push({ href: '/settings', label: 'Settings', icon: Settings });
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Coffee className="h-6 w-6 text-primary" />
                    <span>Dipti’s Orders</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium mt-4">
                {navItems.map(item => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                            pathname === item.href && "bg-muted text-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
    )
}
