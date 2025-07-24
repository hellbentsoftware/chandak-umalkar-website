import React from 'react';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center z-10 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Chandak Umalkar Associates</h1>
          <p className="text-lg md:text-2xl mb-8 font-medium drop-shadow">
            Your Trusted Partner for Tax Consultancy &amp; Financial Solutions
          </p>
          <Button asChild size="lg" className="bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-50">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80 opacity-30 pointer-events-none" />
      </header>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
          <Shield className="h-10 w-10 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Secure &amp; Confidential</h3>
          <p className="text-gray-600">Your data is protected with industry-leading security and privacy standards.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
          <FileText className="h-10 w-10 text-purple-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Easy Document Management</h3>
          <p className="text-gray-600">Upload, track, and manage all your tax documents in one place, anytime.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
          <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Expert Guidance</h3>
          <p className="text-gray-600">Get personalized advice from experienced tax professionals to maximize your returns.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to simplify your taxes?</h2>
        <p className="mb-6 text-lg">Join hundreds of satisfied clients who trust us for their tax and financial needs.</p>
        <Button asChild size="lg" className="bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-50">
          <Link to="/login">Sign Up / Login</Link>
        </Button>
      </section>

    </div>
  );
};

export default Index;
