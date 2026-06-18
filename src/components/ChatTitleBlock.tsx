interface GroupData {
    roomId: string,
    username: string
}

export default function ChatTitleBlock({roomId, username}: GroupData) {
    return (
        <div className="min-w-0">
            <h1 className="text-base md:text-xl font-semibold text-slate-800 truncate">
                Anonymous Chat
            </h1>
            <p className="text-xs md:text-sm text-slate-500 flex flex-col md:flex-row md:gap-1">
                <span className="truncate">Room: {roomId}</span>
                <span className="hidden md:inline">•</span>
                <span>Joined as {username}</span>
            </p>
        </div>
    );
}