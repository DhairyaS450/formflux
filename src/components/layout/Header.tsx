'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (pathname === '/about') {
    return (
      <header className="w-full px-8 py-4 flex justify-start items-center bg-black border-b border-gray-700">
        <button
          onClick={() => router.back()}
          className="text-white hover:text-gray-300"
        >
          &larr; Back
        </button>
      </header>
    );
  }

  if (user) {
    return null;
  }

  return (
    <header className="w-full px-8 py-4 flex justify-start items-center bg-black">
      <div className="logo-container">
        <Link href="/">
          <Image src="/logo.png" alt="FormFlux Logo" width={150} height={50} />
        </Link>
      </div>
    </header>
  );
}
