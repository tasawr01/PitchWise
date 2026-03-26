import { ChatProvider } from '@/context/ChatContext';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <ChatProvider>
            <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
                {children}
            </div>
        </ChatProvider>
    );
}
