'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormState({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    return (
        <main className="min-h-screen bg-gray-50/50 font-sans selection:bg-[#0B2C4A] selection:text-white">
            <Header />

            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
            </div>

            <section className="relative z-10 py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Text */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-[#0B2C4A] mb-4 font-heading"
                        >
                            Get in Touch
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-gray-600"
                        >
                            Have a project in mind or just want to verify a pitch? We'd love to hear from you.
                        </motion.p>
                    </div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
                    >
                        {/* Left Side: Contact Info (Dark) */}
                        <div className="lg:w-2/5 bg-[#0B2C4A] text-white p-10 lg:p-12 relative overflow-hidden flex flex-col justify-between">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                                <p className="text-blue-100 mb-10 leading-relaxed">
                                    Fill out the form and our team will get back to you within 24 hours.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                            <Phone className="w-5 h-5 text-blue-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-200 mb-1">Call Us</p>
                                            <p className="font-medium">+92 (300) 123-4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                            <Mail className="w-5 h-5 text-purple-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-200 mb-1">Email Us</p>
                                            <p className="font-medium">pitchwisehub@gmail.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                            <MapPin className="w-5 h-5 text-green-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-200 mb-1">Visit Us</p>
                                            <p className="font-medium">
                                                123 Innovation Drive,<br />
                                                Islamabad, Pakistan
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-12">
                                <p className="text-sm text-blue-200 mb-4">Connect with us</p>
                                <div className="flex gap-4">
                                    {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:-translate-y-1">
                                            <Icon className="w-4 h-4 text-white" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Form (Light) */}
                        <div className="lg:w-3/5 p-10 lg:p-12 bg-white relative">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600">
                                        <Send className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#0B2C4A] mb-3">Message Sent!</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm">
                                        Thank you for reaching out. We appreciate your interest and will respond shortly.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                                    >
                                        Send another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center">
                                    <h3 className="text-2xl font-bold text-[#0B2C4A] mb-8">Send a Message</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#0B2C4A] transition-colors">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formState.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-gray-800 placeholder-transparent focus:border-[#0B2C4A] focus:outline-none transition-colors"
                                                placeholder="Name"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#0B2C4A] transition-colors">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formState.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-gray-800 placeholder-transparent focus:border-[#0B2C4A] focus:outline-none transition-colors"
                                                placeholder="Email"
                                            />
                                        </div>
                                    </div>

                                    <div className="group mb-6">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#0B2C4A] transition-colors">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formState.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-gray-800 placeholder-transparent focus:border-[#0B2C4A] focus:outline-none transition-colors"
                                            placeholder="Subject"
                                        />
                                    </div>

                                    <div className="group mb-10">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[#0B2C4A] transition-colors">Message</label>
                                        <textarea
                                            name="message"
                                            rows={4}
                                            value={formState.message}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-gray-200 bg-transparent py-2 text-gray-800 placeholder-transparent focus:border-[#0B2C4A] focus:outline-none transition-colors resize-none"
                                            placeholder="Message"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-10 py-4 bg-[#0B2C4A] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#09223a] transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
