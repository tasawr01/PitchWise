import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-background font-sans">
            <Header />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                    <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using PitchWise, you accept and agree to be bound by the terms and provision of this agreement.
                            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable
                            to such services. Any participation in this service will constitute acceptance of this agreement.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">2. Description of Service</h2>
                        <p>
                            PitchWise provides a platform for entrepreneurs to connect with investors. We do not guarantee funding or specific results.
                            We act as a facilitator for connections and are not a party to any agreements entered into between entrepreneurs and investors.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">3. User Conduct</h2>
                        <p>
                            You agree to use the website only for lawful purposes. You are prohibited from posting on or transmitting through the website
                            any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit,
                            profane, hateful, racially, ethnically, or otherwise objectionable of any kind.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">4. Intellectual Property</h2>
                        <p>
                            The Site and its original content, features and functionality are owned by PitchWise and are protected by international
                            copyright, trademark, patent, trade secret and other intellectual property or proprietary rights laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">5. Termination</h2>
                        <p>
                            We may terminate your access to the Site, without cause or notice, which may result in the forfeiture and destruction of
                            all information associated with you. All provisions of this Agreement that by their nature should survive termination
                            shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and
                            limitations of liability.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">6. Changes to This Agreement</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms of Service by posting the updated terms
                            on the Site. Your continued use of the Site after any such changes constitutes your acceptance of the new Terms of Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-primary mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about this Agreement, please contact us at:
                        </p>
                        <div className="mt-4">
                            <p><strong>Email:</strong> hello@pitchwise.com</p>
                            <p><strong>Address:</strong> 123 Innovation Dr, Tech City, TC 90210</p>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
