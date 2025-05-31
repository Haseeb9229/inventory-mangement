export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <div className={`flex items-center ${className}`} {...props}>
            <div className="relative">
                {/* Background shape */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D5BEA4] to-[#8B7355] rounded-lg transform rotate-6 scale-90 opacity-20"></div>
                {/* Main icon */}
                <div className="relative bg-gradient-to-br from-[#8B7355] to-[#54483A] p-2.5 rounded-lg shadow-lg">
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                </div>
            </div>
            <div className="ml-3 flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#54483A] to-[#8B7355] bg-clip-text text-transparent tracking-tight">
                    InvenTrack
                </span>
                <span className="text-xs uppercase tracking-widest text-[#8B7355]/80 -mt-1">
                    Inventory System
                </span>
            </div>
        </div>
    );
}
