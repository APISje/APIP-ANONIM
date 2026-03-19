import { Link, useRoute } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-x-0 border-t-0 rounded-none px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform duration-300">
            <span className="font-display font-bold text-xl text-white">V</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:block text-gradient">
            Vireon Project
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Kirim Pesan</NavLink>
          <NavLink href="/guests">Menu Tamu</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white/80 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-card border-t border-white/10 p-4 flex flex-col gap-4">
          <MobileNavLink href="/" onClick={() => setIsOpen(false)}>Kirim Pesan</MobileNavLink>
          <MobileNavLink href="/guests" onClick={() => setIsOpen(false)}>Menu Tamu</MobileNavLink>
          <MobileNavLink href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  const [isActive] = useRoute(href);
  return (
    <Link 
      href={href} 
      className={cn(
        "text-sm font-semibold transition-colors duration-200 relative",
        isActive ? "text-white" : "text-white/60 hover:text-white"
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-neon rounded-full" />
      )}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void }) {
  const [isActive] = useRoute(href);
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={cn(
        "block px-4 py-3 rounded-xl text-base font-semibold transition-colors",
        isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}
