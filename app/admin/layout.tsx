import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

import AdminDashboardLayout from '@/components/AdminDashboardLayout';

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch {
        return false;
    }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        redirect('/admin_login');
    }

    return (
        <AdminDashboardLayout>
            {children}
        </AdminDashboardLayout>
    );
}
