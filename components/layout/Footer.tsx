import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-secondary/30 pt-16 pb-8 border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            {/* Logo Image */}
                            <div className="relative w-20 h-20">
                                <Image
                                    src="/assets/footerlogo.png"
                                    alt="PitchWise Logo"
                                    fill
                                    className="object-contain"
                                    sizes="80px"
                                />
                            </div>
                        </Link>
                        <h3 className="font-bold text-primary mb-4">About Company</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            PitchWise connects ambitious entrepreneurs with verified investors to fuel innovation. Join a thriving ecosystem where ideas turn into reality.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-primary hover:text-accent-blue transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-primary hover:text-accent-blue transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-primary hover:text-accent-blue transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-primary hover:text-accent-blue transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-primary mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Information */}
                    <div>
                        <h3 className="font-bold text-primary mb-6">Information</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <div className="text-sm font-bold text-primary">Phone</div>
                                    <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <div className="text-sm font-bold text-primary">Email</div>
                                    <div className="text-sm text-muted-foreground">pitchwisehub@gmail.com</div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <div className="text-sm font-bold text-primary">Address</div>
                                    <div className="text-sm text-muted-foreground">123 Innovation Dr, Tech City, TC 90210</div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter (Simplified) */}
                    <div>
                        <h3 className="font-bold text-primary mb-6">Newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for the latest updates.</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                            >
                                Go
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} PitchWise, Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
