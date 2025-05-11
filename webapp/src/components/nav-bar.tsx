import { Link } from "react-router-dom";
import { ChainSelect } from "./chain/chain-select";
import { WalletSelect } from "./account/wallet-select";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  // {
  //   title: "Products",
  //   href: "/products",
  //   items: [
  //     { title: "Product 1", href: "#" },
  //     { title: "Product 2", href: "#" },
  //     { title: "Product 3", href: "#" },
  //   ],
  // },
  // {
  //   title: "Solutions",
  //   href: "/solutions",
  //   items: [
  //     { title: "Solution 1", href: "#" },
  //     { title: "Solution 2", href: "#" },
  //     { title: "Solution 3", href: "#" },
  //   ],
  // },
  {
    title: "Home",
    href: "/",
    items: [],
  },
  {
    title: "Contracts",
    href: "/contracts",
    items: [],
  },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 h-16 bg-gradient-to-b from-background via-background/50 to-background/0 backdrop-blur-sm -z-10" />
      <div className="px-6 sm:px-8 flex h-16 items-center justify-between">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}

          {/* Mobile menu control - includes both toggle button and menu */}
          <div className="md:hidden flex items-center gap-2">
            {/* <ThemeToggle /> */}
            <ConnectButton />
            <ChainSelect />
            <WalletSelect />
            {/* <NavMobileControl items={navItems} /> */}
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:flex-1 absolute left-1/2 -translate-x-1/2">
            <ul className="flex gap-6">
              {navItems.map((item) => (
                <li key={item.title} className="group relative">
                  {item.items && item.items.length > 0 ? (
                    <div className="flex cursor-pointer items-center gap-1 py-2 text-sm">
                      {item.title}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="flex cursor-pointer items-center gap-1 py-2 text-sm"
                    >
                      {item.title}
                    </Link>
                  )}

                  {/* Dropdown menu that appears on hover */}
                  {item.items && item.items.length > 0 && (
                    <div className="invisible absolute left-1/2 top-full z-50 min-w-[180px] -translate-x-1/2 rounded-md border bg-background p-2 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
                      <div className="flex flex-col space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            to={subItem.href || "#"}
                            key={subItem.title}
                            // href={subItem.href || "#"}
                            className="rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex gap-1 items-center">
            {/* <ThemeToggle /> */}
            <ConnectButton />
            <ChainSelect />
            <WalletSelect />
          </div>
        </div>
      </div>
    </header>
  );
}
