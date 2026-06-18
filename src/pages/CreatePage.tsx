import { useState, useEffect } from "react";
import { ArrowRight, Link2, Rocket, ShieldCheck, Smartphone, User, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const useInView = (options = { threshold: 0.1, triggerOnce: true }) => {
    const [ref, setRef] = useState(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (!ref) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                if (options.triggerOnce) observer.unobserve(ref);
            }
        }, options);

        observer.observe(ref);
        return () => {
            if (ref) observer.unobserve(ref);
        };
    }, [ref, options]);

    return [setRef, inView];
};

const AnimateOnView = ({ children, animation = "fade-up", delay = 0, duration = 700, className = "" }) => {
    const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

    const getTransform = () => {
        switch (animation) {
            case "fade-up": return "translateY(40px)";
            case "fade-down": return "translateY(-40px)";
            case "fade-left": return "translateX(40px)";
            case "fade-right": return "translateX(-40px)";
            case "scale": return "scale(0.95)";
            default: return "none";
        }
    };

    const style = {
        opacity: inView ? 1 : 0,
        transform: inView ? (animation === "scale" ? "scale(1)" : "translate(0,0)") : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };

    return (
        <div ref={ref} style={style} className={className}>
            {children}
        </div>
    );
};

export default function App() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const createRoom = async () => {
        setIsLoading(true);
        try {
            const result = await fetch(
                "https://websocket-backend-a6nm.onrender.com/api/rooms/create",
                { method: "POST" }
            );
            const data = await result.json();

            navigate(`/room/${data.roomId}`);
        } catch (err) {
            console.log("API Connection failed, using mock room fallback:", err);
            setTimeout(() => {
                setIsLoading(false);
            }, 800);
        }
    };

    const faqs = [
        {
            q: "Do I need an account?",
            a: "No. Anonymous Chat works completely without registration."
        },
        {
            q: "Is it free?",
            a: "Yes, creating and joining rooms is completely free forever."
        },
        {
            q: "Can I share rooms with friends?",
            a: "Yes! Simply copy and send them the unique room link."
        },
        {
            q: "Is my identity visible?",
            a: "No personal information is required or displayed to others."
        }
    ];

    return (
        <div className="bg-slate-50 text-slate-900 font-sans min-h-screen overflow-hidden selection:bg-blue-200 selection:text-blue-900">
            {/* Navbar */}
            <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h1 className="font-bold text-xl tracking-tight">Anonymous</h1>
                    </div>

                    <button
                        onClick={createRoom}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 active:scale-95 disabled:opacity-70 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "Create Room"}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative">
                {/* Background ambient blurs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
                    <div>
                        <AnimateOnView animation="fade-right" delay={0}>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Anonymous • Secure • Instant
                            </span>
                        </AnimateOnView>

                        <AnimateOnView animation="fade-right" delay={150}>
                            <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                                Talk Freely.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Stay Anonymous.
                                </span>
                            </h1>
                        </AnimateOnView>

                        <AnimateOnView animation="fade-right" delay={300}>
                            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
                                Create private chat rooms instantly. No registration, no personal information, and no unnecessary complexity.
                            </p>
                        </AnimateOnView>

                        <AnimateOnView animation="fade-right" delay={450}>
                            <div className="flex flex-col sm:flex-row gap-4 mt-10">
                                <button
                                    onClick={createRoom}
                                    disabled={isLoading}
                                    className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? "Creating room..." : "Create room"}
                                    {!isLoading && (
                                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                                    )}
                                </button>
                                <a
                                    href="#features"
                                    className="px-8 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center text-center"
                                >
                                    Learn More
                                </a>
                            </div>
                        </AnimateOnView>
                    </div>

                    {/* Hero Mockup Card */}
                    <AnimateOnView animation="fade-left" delay={200} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2.5rem] transform rotate-3 scale-[1.02] opacity-10"></div>
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-6 sm:p-8 relative">
                            {/* Browser/Window Header */}
                            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="mx-auto bg-slate-100 px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 flex items-center gap-2">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    anon.chat/room/x8j92
                                </div>
                            </div>

                            <div className="space-y-6">
                                <AnimateOnView animation="fade-up" delay={600}>
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 max-w-[85%] text-slate-700 shadow-sm">
                                            Hello 👋 Just created this room!
                                        </div>
                                    </div>
                                </AnimateOnView>

                                <AnimateOnView animation="fade-up" delay={1400}>
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] shadow-md shadow-blue-500/20">
                                            Hi there! The link worked perfectly.
                                        </div>
                                    </div>
                                </AnimateOnView>

                                <AnimateOnView animation="fade-up" delay={2200}>
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 max-w-[85%] text-slate-700 shadow-sm">
                                            Awesome. And it's completely anonymous.
                                        </div>
                                    </div>
                                </AnimateOnView>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm text-slate-400">
                                    Type a message...
                                </div>
                                <div className="w-11 h-11 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md">
                                    <svg className="w-5 h-5 -ml-0.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </AnimateOnView>
                </div>
            </section>

            {/* Trust Bar */}
            <AnimateOnView animation="fade-up" delay={100}>
                <section className="border-y border-slate-200 bg-white">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-4 text-sm sm:text-base font-medium text-slate-500">
                            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> No Sign Up</div>
                            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Instant Rooms</div>
                            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Private Links</div>
                            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Mobile Friendly</div>
                            <div className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Fast & Lightweight</div>
                        </div>
                    </div>
                </section>
            </AnimateOnView>

            {/* Features */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                <AnimateOnView animation="fade-up">
                    <div className="text-center mb-16 lg:mb-24">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                            Everything You Need
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                            Built for simple, secure, and private conversations without the baggage of modern social apps.
                        </p>
                    </div>
                </AnimateOnView>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {[
                        { title: "Instant Room Creation", icon: <Zap className="w-6 h-6 text-blue-600" />, desc: "Generate a unique room URL in a second. No forms to fill out." },
                        { title: "No Accounts Required", icon: <User className="w-6 h-6 text-blue-600" />, desc: "Skip sign-up, email, or passwords. Just open the room and start talking." },
                        { title: "Shareable Links", icon: <Link2 className="w-6 h-6 text-blue-600" />, desc: "Send a room link to anyone and they can join instantly." },
                        { title: "Real-Time Messaging", icon: <Rocket className="w-6 h-6 text-blue-600" />, desc: "Messages arrive live through WebSocket so it feels immediate." },
                        { title: "Privacy Focused", icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, desc: "No usernames, profiles, or public chat history to track you." },
                        { title: "Works Everywhere", icon: <Smartphone className="w-6 h-6 text-blue-600" />, desc: "The interface works smoothly on desktop, tablet, and mobile." }
                    ].map((feature, index) => (
                        <AnimateOnView key={feature.title} animation="fade-up" delay={index * 100}>
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-xl text-slate-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-slate-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </AnimateOnView>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-white border-y border-slate-200 py-24 lg:py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <AnimateOnView animation="fade-up">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 tracking-tight">
                            How It Works
                        </h2>
                    </AnimateOnView>

                    <div className="grid md:grid-cols-3 gap-12 mt-16 lg:mt-24 relative">
                        {/* Connecting Line for Desktop */}
                        <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-slate-100 -z-10"></div>

                        {[
                            { step: "Create a Room", desc: "Click one button to instantly generate a secure, ephemeral chat room." },
                            { step: "Share the Link", desc: "Copy the unique URL and send it to whoever you want to talk to." },
                            { step: "Start Chatting", desc: "They click the link, and you are both instantly connected." }
                        ].map((item, index) => (
                            <AnimateOnView key={item.step} animation="fade-up" delay={index * 150} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-slate-900/20 mb-6">
                                    {index + 1}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {item.step}
                                </h3>
                                <p className="mt-4 text-slate-600 max-w-xs mx-auto">
                                    {item.desc}
                                </p>
                            </AnimateOnView>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white text-center shadow-2xl relative overflow-hidden">
                    {/* Decorative elements inside stats */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-30"></div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                        {[
                            { num: "10K+", label: "Rooms Created" },
                            { num: "250K+", label: "Messages Sent" },
                            { num: "3s", label: "Average Setup Time" },
                            { num: "0%", label: "Registration Required" }
                        ].map((stat, index) => (
                            <AnimateOnView key={stat.label} animation="scale" delay={index * 100}>
                                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">
                                    {stat.num}
                                </h3>
                                <p className="text-slate-400 mt-3 font-medium text-sm sm:text-base">
                                    {stat.label}
                                </p>
                            </AnimateOnView>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-white py-24 lg:py-32 border-y border-slate-200">
                <div className="max-w-3xl mx-auto px-6">
                    <AnimateOnView animation="fade-up">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center tracking-tight mb-16">
                            Frequently Asked Questions
                        </h2>
                    </AnimateOnView>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <AnimateOnView key={faq.q} animation="fade-up" delay={index * 100}>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                                    <h3 className="font-bold text-lg text-slate-900">
                                        {faq.q}
                                    </h3>
                                    <p className="mt-2 text-slate-600">
                                        {faq.a}
                                    </p>
                                </div>
                            </AnimateOnView>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 lg:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <AnimateOnView animation="scale">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                            Ready to start chatting?
                        </h2>
                        <p className="mt-6 text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                            Start a private conversation now with no sign-up required.
                        </p>

                        <button
                            onClick={createRoom}
                            disabled={isLoading}
                            className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mx-auto w-full sm:w-auto"
                        >
                            {isLoading ? "Preparing secure connection..." : "Create Room Now"}
                            {!isLoading && (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            )}
                        </button>
                    </AnimateOnView>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        Anonymous Chat
                    </div>
                    <div className="text-sm">
                        © 2026 Anonymous Chat. Built for privacy.
                    </div>
                </div>
            </footer>
        </div>
    );
}