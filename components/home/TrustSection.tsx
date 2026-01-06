import { Shield, Lock, FileCheck, Users } from 'lucide-react';

export default function TrustSection() {
    const features = [
        {
            name: 'Verified Profiles',
            description: 'Every founder and investor is manually verified to ensure a safe community.',
            icon: Users,
        },
        {
            name: 'Secure Chat',
            description: 'End-to-end encrypted messaging keeps your negotiations private and secure.',
            icon: Lock,
        },
        {
            name: 'Encrypted Data',
            description: 'Your pitch decks and financial data are protected with bank-grade encryption.',
            icon: Shield,
        },
        {
            name: 'Audit Trail',
            description: 'Track who views your pitch and maintain a complete history of interactions.',
            icon: FileCheck,
        },
    ];

    return (
        <section className="py-24 bg-secondary/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading mb-6">
                            Trust & Transparency First
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            We believe that great partnerships are built on trust. That's why we've built security and verification into the core of PitchWise.
                        </p>

                        <dl className="space-y-8">
                            {features.map((feature) => (
                                <div key={feature.name} className="relative flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <dt className="text-base font-semibold leading-7 text-foreground">
                                            {feature.name}
                                        </dt>
                                        <dd className="mt-1 text-base leading-7 text-muted-foreground">
                                            {feature.description}
                                        </dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="mt-16 lg:mt-0 relative">
                        <div className="relative rounded-2xl bg-gradient-to-br from-primary to-purple-700 p-8 shadow-2xl overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[300px] w-[300px] rounded-full bg-accent-blue/20 blur-3xl" />

                            <div className="relative z-10 text-white">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Shield className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">100% Secure</div>
                                        <div className="text-blue-100">Platform Guarantee</div>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <span className="font-medium">Identity Verification</span>
                                        <span className="bg-green-500/20 text-green-200 text-xs px-2 py-1 rounded-full border border-green-500/30">Passed</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <span className="font-medium">Business Registration</span>
                                        <span className="bg-green-500/20 text-green-200 text-xs px-2 py-1 rounded-full border border-green-500/30">Verified</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Financial Audit</span>
                                        <span className="bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded-full border border-blue-500/30">Pending</span>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <button className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors w-full sm:w-auto">
                                        Learn About Our Security
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
