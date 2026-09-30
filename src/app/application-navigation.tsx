"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ApplicationNavigationItem = {
  href: string;
  label: string;
  exact?: boolean;
};

type ApplicationNavigationProps = {
  items: ApplicationNavigationItem[];
};

export function ApplicationNavigation({
  items,
}: ApplicationNavigationProps) {
  const pathname = usePathname();
  const activeItem = items
    .filter((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    )
    .sort((left, right) => right.href.length - left.href.length)[0];

  return (
    <nav className="app-navigation" aria-label="Navigation principale">
      <p className="app-navigation-label">Navigation</p>
      <ul>
        {items.map((item) => {
          const active = activeItem?.href === item.href;

          return (
            <li key={item.href}>
              <Link
                className={
                  active
                    ? "app-navigation-link is-active"
                    : "app-navigation-link"
                }
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                <span className="app-navigation-marker" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
