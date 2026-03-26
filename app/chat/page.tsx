import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { redirect } from 'next/navigation';

export default async function ChatPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/login'); // Assuming login is at /auth/login or /login. Middleware handles this mostly.

    const payload = await verifyToken(token);
    if (!payload) redirect('/login');

    return (
        <>
            <ChatSidebar userId={payload.id} userRole={payload.role} />
            <ChatWindow userId={payload.id} userRole={payload.role} />
        </>
    );
}
