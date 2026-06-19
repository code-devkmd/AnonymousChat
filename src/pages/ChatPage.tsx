import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { Link2, Copy, Check, X, SendHorizontal } from "lucide-react";

import Loading from "../components/Loading";
import MobileHamburger from "../components/MobileHamburger";
import ChatTitleBlock from "../components/ChatTitleBlock";
import ChatStatus from "../components/ChatStatus";

interface Message {
    id: string;
    text: string;
    sender: string;
    type: "user" | "system";
    timestamp?: string;
}

interface RoomUser {
    id: string;
    username: string;
}

export default function ChatPage() {
    const params = useParams<{ roomId: string }>();
    const roomId = params.roomId ?? "";
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [hasJoined, setHasJoined] = useState(false);
    const [username, setUsername] = useState("");
    const [joinError, setJoinError] = useState<string | null>(null);

    const [showShareToast, setShowShareToast] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    const [onlineCount, setOnlineCount] = useState<number>(1);
    const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy link", err);
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const verifyRoom = async () => {
            try {
                const result = await fetch(`https://websocket-backend-a6nm.onrender.com/api/rooms/${roomId}`);
                const data = await result.json();

                if (!data.success) {
                    navigate("/");
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Room validation failed:", err);
                navigate("/");
            }
        };

        if (roomId) verifyRoom();
    }, [roomId, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        if (!trimmedUsername) return;

        setJoinError(null);

        socketRef.current = io("https://websocket-backend-a6nm.onrender.com");
        const socket = socketRef.current;

        socket.on("connect_error", (error) => {
            console.error("Socket connect error:", error);
            setJoinError("Unable to connect to chat server.");
            socket.disconnect();
            socketRef.current = null;
        });

        socket.on("load_messages", (previousMessages: Message[]) => {
            setMessages(previousMessages);
        });

        socket.on("room_stats", ({ onlineCount, users }: { onlineCount: number, users: RoomUser[] }) => {
            setOnlineCount(onlineCount);
            setRoomUsers(users);

            if (onlineCount === 1) {
                setShowShareToast(true);
            } else {
                setShowShareToast(false);
            }
        });

        socket.on("receive_message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("user_typing", ({ username: typingUser }) => {
            setTypingUsers((prev) => {
                if (prev.includes(typingUser)) return prev;
                return [...prev, typingUser];
            });
        });

        socket.on("user_stopped_typing", ({ username: typingUser }) => {
            setTypingUsers((prev) => prev.filter((user) => user !== typingUser));
        });

        socket.emit("join_room", { roomId, username: trimmedUsername }, (response: { success: boolean; message?: string }) => {
            if (!response.success) {
                setJoinError(response.message || "Could not join room.");
                socket.disconnect();
                socketRef.current = null;
                return;
            }

            setHasJoined(true);
        });
    };

    const isTypingRef = useRef(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value);

        if (!socketRef.current) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socketRef.current.emit("typing", { roomId, username });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit("stop_typing", { roomId, username });
            isTypingRef.current = false;
        }, 1500);
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMessage.trim() || !socketRef.current) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        socketRef.current.emit("stop_typing", { roomId, username });

        const newMessage: Message = {
            id: Date.now().toString(),
            text: currentMessage,
            sender: username,
            type: "user",
            timestamp: new Date().toISOString()
        };

        socketRef.current.emit("send_message", { roomId, message: newMessage });

        setMessages((prev) => [...prev, newMessage]);
        setCurrentMessage("");
    };

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.off("load_messages");
                socketRef.current.off("receive_message");
                socketRef.current.off("user_typing");
                socketRef.current.off("user_stopped_typing");
                socketRef.current.off("room_stats");
            }
        };
    }, []);


    if (isLoading) {
        return <Loading />
    }

    if (!hasJoined) {
        return (
            <div className="h-screen bg-slate-100 flex items-center justify-center p-4">
                <form onSubmit={handleJoin} className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full space-y-4 border">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800">Join Room</h1>
                        <p className="text-sm text-slate-500 mt-1">Room ID: {roomId}</p>
                    </div>

                    {/* --- DISPLAY USERNAME ERROR HERE --- */}
                    {joinError && (
                        <div className="bg-red-50 text-red-600 text-xs px-4 py-2.5 rounded-xl border border-red-100 font-medium">
                            {joinError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter a display name..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium">
                        Enter Chat
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">

                {/* Left section */}
                <div className="flex items-center gap-3 min-w-0">

                    {/* Mobile hamburger */}
                    <MobileHamburger setIsSidebarOpen={setIsSidebarOpen} />

                    {/* Title block */}
                    <ChatTitleBlock roomId={roomId} username={username} />
                </div>

                {/* Right section (status) */}
                {ChatStatus(onlineCount)}
            </header>

            {/* Core Application Body split layout */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Responsive Sliding Sidebar */}
                <aside className={`
                    absolute md:static top-0 left-0 h-full w-64 bg-white border-r z-20 transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
                `}>
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50 md:bg-transparent">
                        <h2 className="font-bold text-slate-700">Active Members ({onlineCount})</h2>
                        {/* Close button inside mobile menu */}
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <ul className="p-2 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
                        {roomUsers.map((user) => (
                            <li
                                key={user.id}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${user.username === username ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-600"
                                    }`}
                            >
                                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                <span className="truncate">{user.username} {user.username === username && "(You)"}</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Mobile Backdrop overlay shadow */}
                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/20 z-10 md:hidden transition-opacity"
                    />
                )}

                {/* Main Chat Feed Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                    <main className="flex-1 overflow-y-auto px-4 py-6">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg, index) => {
                                if (msg.type === "system") {
                                    return (
                                        <div key={index} className="flex justify-center my-2">
                                            <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                                                {msg.text}
                                            </span>
                                        </div>
                                    );
                                }

                                const isMe = msg.sender === username;
                                return (
                                    <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                                            {!isMe && (
                                                <div className="flex items-baseline gap-2 ml-2">
                                                    <span className="text-xs font-medium text-slate-600">{msg.sender}</span>
                                                    <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                                                </div>
                                            )}
                                            <div className={`${isMe ? "bg-slate-900 text-white" : "bg-white text-slate-800 border"} rounded-2xl px-4 py-2.5 shadow-sm text-sm sm:text-base break-words relative group`}>
                                                <p>{msg.text}</p>
                                                {/* For the sender, show the time inside the bubble */}
                                                {isMe && (
                                                    <span className="text-[10px] text-slate-400 block text-right mt-1 select-none">
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </main>

                    {/* Input Footer & Typing Status container */}
                    <footer className="bg-white border-t p-4">
                        <div className="max-w-3xl mx-auto">

                            {/* Animated Dynamic Typing Status Area */}
                            <div className={`text-xs text-slate-500 italic mb-1.5 transition-all duration-300 overflow-hidden ${typingUsers.length > 0 ? "opacity-100 h-5" : "opacity-0 h-0"
                                }`}>
                                {typingUsers.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span>
                                            {typingUsers.length === 1
                                                ? `${typingUsers[0]} is typing`
                                                : `${typingUsers.slice(0, 2).join(', ')}${typingUsers.length > 2 ? ` and ${typingUsers.length - 2} others` : ''} are typing`
                                            }
                                        </span>
                                        <span className="flex gap-0.5 items-center pt-1.5">
                                            <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={sendMessage} className="flex items-center gap-2 sm:gap-3 w-full max-w-4xl mx-auto p-2">
                                {/* Input Field */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={currentMessage}
                                    onChange={handleInputChange}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 min-w-0 bg-slate-50/50 focus:bg-white"
                                />

                                {/* Animated Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!currentMessage?.trim()}
                                    className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-full shadow-md hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:active:scale-100 transition-all duration-200 shrink-0 select-none"
                                >
                                    <SendHorizontal className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </form>
                        </div>
                    </footer>
                </div>

            </div>
            {/* --- SHARE SUGGESTION TOAST --- */}
            {showShareToast && (
                <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-96 bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-slate-800 z-50 animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                            <Link2 size={20} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold text-sm">
                                        You're the only one here
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        Share this room link with friends and start chatting together instantly.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowShareToast(false)}
                                    className="text-slate-500 hover:text-white transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-100 transition"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={14} />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            Copy Link
                                        </>
                                    )}
                                </button>

                                {copied && (
                                    <span className="text-xs text-green-400 animate-in fade-in duration-200">
                                        Link copied to clipboard
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}