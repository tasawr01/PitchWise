import { Lightbulb, ShieldCheck, Handshake } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            name: 'Create Pitch',
            description: 'Build a compelling profile for your startup. Upload your deck, showcase your team, and define your ask.',
            icon: Lightbulb,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            name: 'Get Verified',
            description: 'Our team reviews your submission. Once verified, you gain access to our network of trusted investors.',
            icon: ShieldCheck,
            color: 'bg-green-100 text-green-600',
        },
        {
            name: 'Connect & Deal',
            description: 'Chat directly with interested investors, schedule meetings, and close your funding round securely.',
            icon: Handshake,
            color: 'bg-purple-100 text-purple-600',
        },
    ];

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">
                        How PitchWise Works
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        From idea to investment in three simple steps. We streamline the process so you can focus on building.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 -z-10" />

                    {steps.map((step, index) => (
                        <div key={step.name} className="relative flex flex-col items-center text-center group">
                            <div className={`flex h-24 w-24 items-center justify-center rounded-2xl ${step.color} mb-6 transition-transform group-hover:scale-110 duration-300 shadow-lg`}>
                                <step.icon className="h-10 w-10" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{step.name}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>

                            {/* Step Number Badge */}
                            <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm border-4 border-background">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
