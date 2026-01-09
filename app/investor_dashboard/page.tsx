import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import Investor from '@/models/Investor';
import { jwtVerify } from 'jose';
import DashboardNavbar from '@/components/DashboardNavbar';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'investor') {
            return null;
        }

        await dbConnect();
        const user = await Investor.findById(payload.id).select('-password');

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        return null;
    }
}

export default async function InvestorDashboard() {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNavbar title="Investor Dashboard" profilePhoto={user.profilePhoto} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar / Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-100 mb-4">
                                {user.profilePhoto ? (
                                    <Image src={user.profilePhoto} alt={user.fullName} fill className="object-cover" sizes="128px" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-[#0B2C4A]">{user.fullName}</h2>
                            {user.organizationName && <p className="text-[#0B2C4A] font-medium">{user.organizationName}</p>}
                            <p className="text-gray-500 mb-2">{user.email}</p>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {user.status}
                            </span>
                        </div>

                        <div className="bg-white rounded-lg shadow mt-6 p-6">
                            <h3 className="font-bold text-[#0B2C4A] mb-4">Contact Info</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs">Phone</span>
                                    <span className="font-medium text-gray-800">{user.phone}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Location</span>
                                    <span className="font-medium text-gray-800">{user.cityCountry}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Investment Profile */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-[#0B2C4A]">Investment Profile</h3>
                                <span className="text-xs bg-[#0B2C4A]/10 text-[#0B2C4A] px-2 py-1 rounded uppercase">
                                    {user.investorType}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Min Investment</span>
                                    <p className="text-lg font-medium text-gray-900">{user.investmentMin}</p>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Max Investment</span>
                                    <p className="text-lg font-medium text-gray-900">{user.investmentMax}</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <span className="block text-gray-500 text-xs uppercase mb-3">Industry Preferences</span>
                                <div className="flex flex-wrap gap-2">
                                    {user.industryPreferences?.length ? (
                                        user.industryPreferences.map((pref: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                {pref}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 italic">No preferences specified</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
