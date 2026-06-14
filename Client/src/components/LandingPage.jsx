import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
    FaHeartbeat,
    FaUserInjured,
    FaUserMd,
    FaCalendarAlt,
    FaFileInvoiceDollar,
    FaShieldAlt,
    FaArrowRight,
    FaCheckCircle,
    FaStar,
    FaQuoteLeft,
    FaBars,
    FaTimes,
    FaImage
} from 'react-icons/fa';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user } = useAppContext();

    const features = [
        {
            icon: <FaUserInjured className="text-blue-600 text-2xl" />,
            title: "Patient & EHR Management",
            description: "Securely document patient files, access electronic health records instantly, and track longitudinal histories in a HIPAA-aligned hub."
        },
        {
            icon: <FaUserMd className="text-teal-650 text-2xl" />,
            title: "Rostering & Staff Attendance",
            description: "Automate shift assignments, track clock-ins, and manage department coverage for doctors, nurses, and administrative staff."
        },
        {
            icon: <FaCalendarAlt className="text-indigo-650 text-2xl" />,
            title: "Smart Appointment Scheduler",
            description: "Eliminate booking conflicts with intelligent calendar sync, automated patient notifications, and custom queue management."
        },
        {
            icon: <FaFileInvoiceDollar className="text-emerald-650 text-2xl" />,
            title: "Billing & Claims Processing",
            description: "Track insurance claims, issue transparent itemized bills, and generate direct clinical financial reports in real-time."
        }
    ];

    const workflowSteps = [
        {
            num: "01",
            title: "Staff Login & Authentication",
            description: "Role-based access controls secure access for Admins, Doctors, and Patients."
        },
        {
            num: "02",
            title: "Real-time Operations Control",
            description: "Update medical histories, schedule visits, and manage hospital rosters instantly."
        },
        {
            num: "03",
            title: "Automated Workflows & Billing",
            description: "Clinical documentation automatically triggers billing summaries and insurance claim filings."
        }
    ];

    const testimonials = [
        {
            quote: "MedFlow has significantly optimized our department coordination. Access to patient charts is instantaneous, letting us focus on patient care.",
            author: "Dr. Sarah Jenkins",
            role: "Chief of Cardiology, City General",
            stars: 5
        },
        {
            quote: "The direct billing analytics dashboard and seamless insurance claim processing have reduced our administrative workload by more than 40%.",
            author: "Robert Chen",
            role: "Finance Director, St. Jude Medical",
            stars: 5
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
            {/* Subtle Pastel Background Blurs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />

            {/* HEADER NAVBAR */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/60 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <FaHeartbeat className="text-xl" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Med<span className="text-blue-600 font-medium">Flow</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-blue-600 transition-colors">How It Works</a>
                        <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
                    </nav>

                    {/* Desktop Call to Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/dashboard"
                                    className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                                >
                                    Portal Dashboard
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg border cursor-pointer select-none transition-all duration-200 hover:scale-105 shadow-sm ${user?.role === 'admin'
                                        ? 'bg-purple-100 border-purple-200 text-purple-700'
                                        : user?.role === 'doctor'
                                            ? 'bg-green-100 border-green-200 text-green-700'
                                            : 'bg-blue-100 border-blue-200 text-blue-700'
                                        }`}
                                    title={`Logged in as ${user?.email || 'User'} (${user?.role || 'patient'})`}
                                >
                                    {(user?.role || 'P').charAt(0).toUpperCase()}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-slate-655 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-500 hover:text-slate-800 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4 animate-fadeIn">
                        <nav className="flex flex-col gap-4 text-slate-600 font-medium">
                            <a
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-blue-600 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#workflow"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-blue-600 transition-colors"
                            >
                                How It Works
                            </a>
                            <a
                                href="#testimonials"
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-blue-600 transition-colors"
                            >
                                Testimonials
                            </a>
                        </nav>
                        <hr className="border-slate-100" />
                        <div className="flex flex-col gap-3 pt-2">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full text-center py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2.5"
                                >
                                    <span>Portal Dashboard</span>
                                    <span className={`h-7 w-7 flex items-center justify-center rounded-full font-bold text-xs border ${user?.role === 'admin'
                                        ? 'bg-purple-100 border-purple-200 text-purple-700'
                                        : user?.role === 'doctor'
                                            ? 'bg-green-100 border-green-200 text-green-700'
                                            : 'bg-blue-100 border-blue-200 text-blue-700'
                                        }`}>
                                        {(user?.role || 'P').charAt(0).toUpperCase()}
                                    </span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center py-2.5 text-slate-600 hover:text-blue-600 font-medium"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/10"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* HERO SECTION */}
            <section className="relative pt-12 pb-14 md:pt-20 md:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-center items-center">

                        {/* Left Column: Copy & CTAs */}
                        <div className="lg:col-span-6 space-y-8 text-center ">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600">
                                <FaShieldAlt className="text-sm" />
                                <span>Next-Gen Enterprise Medical Platform</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
                                The Smart Platform for <br />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                                    Unified Healthcare Operations
                                </span>
                            </h1>

                            <p className="text-lg text-slate-600 lg:mx-50 leading-relaxed">
                                Empower your medical staff, optimize patient care, and streamline clinical, billing, and administrative workflows in one secure, intuitive dashboard.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/signup"
                                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                                >
                                    <span>Get Started Instantly</span>
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
                                >
                                    Enter Portal Selection
                                </Link>
                            </div>

                            {/* Badges / Micro proof */}
                            <div className="pt-26 border-t border-slate-200 flex flex-wrap justify-center gap-y-3 gap-x-8 text-xs font-medium text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <FaCheckCircle className="text-emerald-600 text-sm" />
                                    <span>HIPAA Compliance Ready</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FaCheckCircle className="text-emerald-600 text-sm" />
                                    <span>99.99% Operational Uptime</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FaCheckCircle className="text-emerald-600 text-sm" />
                                    <span>Ease of use</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Landing Space / Blank Screenshot Placeholder */}
                        {/* <div className="lg:col-span-6 relative mt-10">
                            <img src="pr.png" alt="pr" />
                        </div> */}

                    </div>
                </div>
            </section>

            {/* CORE FEATURES SECTION */}
            <section id="features" className="py-20 bg-white border-y border-slate-200/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase">System Features</h2>
                        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                            Built to Empower Clinical & Administrative Staff
                        </p>
                        <p className="text-slate-655 max-w-xl mx-auto">
                            Integrated medical solutions configured to work in synchrony, eliminating paper bottlenecks and operational delays.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feat, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-50/40 border border-gray-200 hover:border-blue-200/80 hover:bg-white p-8 rounded-2xl transition-all duration-300 group flex gap-5 shadow-xs hover:shadow-md"
                            >
                                <div className="p-3.5 bg-white rounded-xl border border-slate-150 self-start shadow-xs group-hover:scale-110 transition-transform duration-300">
                                    {feat.icon}
                                </div>
                                <div className="space-y-2.5">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {feat.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {feat.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WORKFLOW / HOW IT WORKS SECTION */}
            <section id="workflow" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase">Seamless Setup</h2>
                        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                            Simple Operational Architecture
                        </p>
                        <p className="text-slate-655 max-w-xl mx-auto">
                            Get your entire hospital system connected, verified, and operational in three simple stages.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {workflowSteps.map((step, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-slate-200/80 rounded-2xl p-8 relative shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl font-extrabold text-blue-500/10 absolute top-6 right-6 select-none font-mono">
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 pt-4">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATISTICS METRICS SECTION */}
            <section className="py-16 bg-slate-100/60 border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-slate-900">150+</div>
                            <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1">Hospitals Connected</div>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-slate-900">2.5M+</div>
                            <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1">Patients Logged</div>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-slate-900">99.99%</div>
                            <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1">Claims Approved</div>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-slate-900">&lt;0.5s</div>
                            <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1">EHR Retrieve Speed</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section id="testimonials" className="py-20 bg-white border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase">Trusted Opinions</h2>
                        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                            Endorsed by Clinical Leaders
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((test, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-50/55 border border-slate-200/80 p-8 rounded-2xl relative flex flex-col justify-between shadow-xs"
                            >
                                <div className="space-y-4">
                                    <div className="flex gap-1">
                                        {[...Array(test.stars)].map((_, i) => (
                                            <FaStar key={i} className="text-amber-400 text-sm" />
                                        ))}
                                    </div>
                                    <FaQuoteLeft className="text-slate-300 text-3xl" />
                                    <p className="text-slate-600 italic text-sm leading-relaxed">
                                        "{test.quote}"
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-200/80 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{test.author}</h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{test.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION (CTA) SECTION */}
            <section className="py-5 relative">
                <div className="bg-linear-to-r rounded-3xl p-10 sm:p-16 text-center space-y-8 relative overflow-hidden">
                    <p className="text-slate-600 max-w-xl mx-auto leading-relaxed">
                        Create a pilot program for your healthcare institution today. Secure credentials, configure your departments, and import patient records instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
                        >
                            Access Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-slate-200 bg-blue-200/50 py-6 drop-shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div></div>
                    <p className="text-xs text-slate-800">
                        &copy; {new Date().getFullYear()} MedFlow Inc. All rights reserved. HIPAA Compliance Certified.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-800">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-white transition-colors">Process</a>
                        <Link to="/dashboard" className="hover:text-white transition-colors">Select Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;