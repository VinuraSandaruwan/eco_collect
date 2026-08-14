function Header() {
  return (
    <header className="bg-surface w-full sticky top-0 z-50 shadow-sm border-b border-surface-variant flex justify-between items-center px-6 py-3 h-16">
      <div className="flex items-center gap-4 flex-1">
        <div className="md:hidden">
          <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
        </div>
        <h2 className="text-lg font-semibold text-primary md:hidden">EcoCollect</h2>
        <div className="hidden md:flex relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-variant rounded focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary text-sm text-on-surface transition-colors"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container-low transition-all p-2 rounded-full cursor-pointer relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-low transition-all p-2 rounded-full cursor-pointer hidden md:block">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-surface-variant cursor-pointer flex items-center justify-center text-on-secondary-container text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  );
}

export default Header;