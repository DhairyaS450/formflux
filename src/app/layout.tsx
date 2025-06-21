// Next.js metadata type for SEO optimization
import type { Metadata } from "next";
// Google Fonts import for Inter font family
import { Inter } from "next/font/google";
// Utility function for conditional CSS classes
import { cn } from "@/lib/utils";
// Layout components
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
// Authentication context provider
import { AuthProvider } from "@/contexts/AuthContext";
// Global styles
import "./globals.css";
import "./App.scss";

// Configure Inter font with Latin subset and CSS variable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // CSS variable for font family
});

// Metadata for SEO and browser tab information
export const metadata: Metadata = {
  title: "FormFlux",
  description: "Your Personal AI Fitness Coach",
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Material Symbols font for icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
        />
      </head>
      
      {/* Body with font configuration and background */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {/* Authentication provider wraps the entire app */}
        <AuthProvider>
          {/* Header component for navigation */}
          <Header />
          
          {/* Main content area - this is where page content renders */}
          {children}
          
          {/* Footer component */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
