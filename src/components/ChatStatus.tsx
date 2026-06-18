export default function ChatStatus(onlineCount: number) {
    return (
        <div className="flex items-center">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>

                <span className="text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">
                    {onlineCount} online
                </span>
            </div>
        </div>
    );
}