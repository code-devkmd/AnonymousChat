import type { Dispatch, SetStateAction } from "react";

export default function MobileHamburger({
    setIsSidebarOpen,
}: {
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}) {
    return (
        <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    );
}