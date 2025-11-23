import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { BentoGrid } from '@/components/BentoGrid';
import { BackgroundLayer, BACKGROUNDS } from '@/components/BackgroundLayer';
import Link from 'next/link';
import Image from 'next/image';

// Force dynamic rendering since we are fetching from DB based on ID
export const dynamic = 'force-dynamic';

async function getPortfolio(id: string) {
  await dbConnect();
  const portfolio = await Portfolio.findOne({ shortId: id }).lean();
  if (!portfolio) return null;

  // Convert _id to string and remove mongoose specific fields if needed
  const data = JSON.parse(JSON.stringify(portfolio.data));
  return data;
}

export default async function SharedPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const portfolioData = await getPortfolio(id);

  if (!portfolioData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-mono selection:bg-[#32f08c] selection:text-black">
      {/* Background Effect */}
      <BackgroundLayer backgroundComponent={BACKGROUNDS[0]} />

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <div className="container-modern py-12 relative z-10">
        <header className="mb-16 text-center md:text-left relative flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            {/* Decorative Pixel Elements */}
            <div className="absolute -top-8 -left-8 w-4 h-4 border-t-2 border-l-2 border-[#32f08c] opacity-50" />

            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#32f08c] text-2xl">●</span>
              <h1 className="text-2xl font-mono uppercase tracking-widest text-white">System_View: Shared_Portfolio</h1>
            </div>
            <div className="text-zinc-500 text-xs uppercase tracking-widest">
              ID: {id}
            </div>
          </div>

          <Link href="/" className="group flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#32f08c] transition-all">
            <span className="text-zinc-300 group-hover:text-[#32f08c] text-xs uppercase tracking-wider">Create Your Own</span>
            <span className="text-[#32f08c]">→</span>
          </Link>
        </header>

        <BentoGrid data={portfolioData} />

        <footer className="mt-24 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-[#32f08c]">●</span>
              <span>System Status: Read_Only</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/k4ris-su/instant-bento"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity hover:text-[#32f08c]"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Source</span>
              </a>

              <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <span>Powered by</span>
                <Image
                  src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/trae-color.png"
                  alt="Trae Logo"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                  unoptimized
                />
                <span className="font-bold text-zinc-300">Trae</span>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
}
