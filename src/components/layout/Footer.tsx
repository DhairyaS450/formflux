"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname !== "/" || user) {
    return null;
  }

  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold">FormFlux</h3>
            <p className="mt-2 text-gray-400">
              Your Personal AI Fitness Coach
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/about" className="hover:text-gray-300">
                  Meet the Team
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Connect with Us</h3>
            <div className="flex mt-2 space-x-4">
              <a
                href="https://github.com/DhairyaS450/formflux"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <Github />
              </a>
              {/* Add other social links here */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
