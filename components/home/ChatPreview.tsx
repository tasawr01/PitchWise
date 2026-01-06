import { Send, MoreVertical, Phone, Video } from 'lucide-react';

export default function ChatPreview() {
    return (
        <section className="py-24 bg-secondary/30 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                    <div className="lg:col-span-5 mb-12 lg:mb-0">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading mb-6">
                            Connect in Real-Time
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            No more waiting for emails. Chat directly with investors, get instant feedback from mentors, and build relationships that matter.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Direct messaging with verified investors",
                                "Community channels for peer support",
                                "Video calls for pitch meetings",
                                "File sharing for pitch decks"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="relative rounded-2xl bg-white shadow-2xl border border-border overflow-hidden max-w-2xl mx-auto">
                            {/* Chat Interface */}
                            <div className="grid grid-cols-12 h-[500px]">
                                {/* Sidebar */}
                                <div className="col-span-4 border-r border-border bg-secondary/30 hidden sm:block">
                                    <div className="p-4 border-b border-border bg-white">
                                        <div className="font-bold text-foreground">Messages</div>
                                    </div>
                                    <div className="overflow-y-auto h-full pb-20">
                                        {[
                                            { name: "Sarah Investor", msg: "Loved your pitch deck!", time: "2m", active: true },
                                            { name: "#pitch-feedback", msg: "Anyone free to review?", time: "15m", active: false, hash: true },
                                            { name: "Mike Mentor", msg: "Let's schedule a call.", time: "1h", active: false },
                                            { name: "#investor-lounge", msg: "New opportunities in...", time: "3h", active: false, hash: true },
                                            { name: "Ali Founder", msg: "Thanks for the intro!", time: "1d", active: false },
                                        ].map((chat, i) => (
                                            <div key={i} className={`p-3 border-b border-border/50 cursor-pointer hover:bg-white transition-colors ${chat.active ? 'bg-white border-l-4 border-l-primary' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${chat.hash ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                                                        {chat.hash ? '#' : chat.name.charAt(0)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-semibold text-sm truncate">{chat.name}</div>
                                                            <div className="text-[10px] text-muted-foreground">{chat.time}</div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate">{chat.msg}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="col-span-12 sm:col-span-8 flex flex-col bg-white">
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-border flex justify-between items-center bg-white z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                S
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">Sarah Investor</div>
                                                <div className="text-xs text-green-500 flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                    Online
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-muted-foreground">
                                            <Phone className="h-5 w-5 cursor-pointer hover:text-foreground" />
                                            <Video className="h-5 w-5 cursor-pointer hover:text-foreground" />
                                            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-foreground" />
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-border rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%] shadow-sm">
                                                <p className="text-sm text-foreground">Hi! I just reviewed your pitch deck for CampusBites.</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-border rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%] shadow-sm">
                                                <p className="text-sm text-foreground">The unit economics look really solid. Are you open to a quick call this week?</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-primary text-white rounded-2xl rounded-tr-none py-3 px-4 max-w-[80%] shadow-md">
                                                <p className="text-sm">Hi Sarah! Thanks for reaching out. Absolutely, I'd love to discuss further.</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-primary text-white rounded-2xl rounded-tr-none py-3 px-4 max-w-[80%] shadow-md">
                                                <p className="text-sm">How does Thursday at 2 PM look for you?</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-border rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%] shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="typing-indicator flex gap-1">
                                                        <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                        <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span>
                                                        <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce animation-delay-400"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 border-t border-border bg-white">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-sm">
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
