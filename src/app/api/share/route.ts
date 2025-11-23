import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { portfolioData } = body;

    if (!portfolioData) {
      return NextResponse.json(
        { error: 'Missing portfolio data' },
        { status: 400 }
      );
    }

    // Create a stable hash of the content to prevent duplicates
    // We sort keys to ensure consistent ordering for hashing
    const stableStringify = (obj: any, depth = 0): string => {
      if (depth > 10) return ''; // Prevent deep recursion DoS
      if (typeof obj !== 'object' || obj === null) {
        return JSON.stringify(obj);
      }
      return '{' + Object.keys(obj).sort().map(key => {
        return JSON.stringify(key) + ':' + stableStringify(obj[key], depth + 1);
      }).join(',') + '}';
    };

    // Limit payload size implicitly by checking string length
    const contentString = stableStringify(portfolioData);
    if (contentString.length > 1024 * 1024) { // 1MB limit for portfolio data
        return NextResponse.json(
            { error: 'Portfolio data too large' },
            { status: 413 }
        );
    }

    const contentHash = crypto.createHash('sha256').update(contentString).digest('hex');

    // Check if this exact portfolio already exists
    const existingPortfolio = await Portfolio.findOne({ contentHash });
    if (existingPortfolio) {
      return NextResponse.json({ shortId: existingPortfolio.shortId }, { status: 200 });
    }

    // Generate a short ID (6 characters)
    const shortId = nanoid(6);

    const portfolio = new Portfolio({
      shortId,
      contentHash,
      data: portfolioData,
    });

    await portfolio.save();

    return NextResponse.json({ shortId }, { status: 201 });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to save portfolio' },
      { status: 500 }
    );
  }
}
