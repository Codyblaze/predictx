import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { x1Testnet } from "@/lib/chains";
import { MOCK_ORACLE_ABI } from "@/lib/abis";
import { ORACLE_ADDRESS } from "@/lib/contracts";

export const dynamic = "force-dynamic";

const HIDDEN_FILE = path.join(process.cwd(), "src/data/hidden-markets.json");
const GITHUB_FILE_PATH = "frontend/src/data/hidden-markets.json";

function readHiddenMarkets(): string[] {
  const raw = readFileSync(HIDDEN_FILE, "utf-8");
  return JSON.parse(raw) as string[];
}

function writeHiddenMarkets(markets: string[]) {
  writeFileSync(HIDDEN_FILE, JSON.stringify(markets, null, 2) + "\n", "utf-8");
}

async function verifyResolver(address: string): Promise<boolean> {
  const client = createPublicClient({
    chain: x1Testnet,
    transport: http(),
  });
  return client.readContract({
    address: ORACLE_ADDRESS,
    abi: MOCK_ORACLE_ABI,
    functionName: "resolvers",
    args: [address as `0x${string}`],
  });
}

async function pushToGithub(markets: string[]): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return false;

  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) return false;

  const content = JSON.stringify(markets, null, 2) + "\n";
  const encoded = Buffer.from(content).toString("base64");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${GITHUB_FILE_PATH}`,
    { headers }
  );

  let sha: string | undefined;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const putRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${GITHUB_FILE_PATH}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `chore: archive market ${markets[markets.length - 1]}`,
        content: encoded,
        sha,
      }),
    }
  );

  return putRes.ok;
}

export async function POST(req: NextRequest) {
  try {
    const resolverAddress = req.headers.get("x-resolver-address");
    if (!resolverAddress || !isAddress(resolverAddress)) {
      return NextResponse.json({ error: "Missing x-resolver-address header" }, { status: 401 });
    }

    const isResolver = await verifyResolver(resolverAddress);
    if (!isResolver) {
      return NextResponse.json({ error: "Not a resolver" }, { status: 403 });
    }

    const { market } = await req.json();
    if (!market || !isAddress(market)) {
      return NextResponse.json({ error: "Invalid market address" }, { status: 400 });
    }

    const normalized = market.toLowerCase();
    const hidden = readHiddenMarkets();
    if (hidden.some((a) => a.toLowerCase() === normalized)) {
      return NextResponse.json({ archived: true, alreadyHidden: true });
    }

    const updated = [...hidden, market];
    const pushed = await pushToGithub(updated);

    if (pushed) {
      return NextResponse.json({
        archived: true,
        redeploy: true,
        via: "github",
        market,
      });
    }

    if (process.env.NODE_ENV === "development") {
      writeHiddenMarkets(updated);
      return NextResponse.json({
        archived: true,
        redeploy: true,
        via: "local",
        market,
      });
    }

    return NextResponse.json(
      {
        archived: false,
        market,
        instruction: `Run: node scripts/archive-market.js ${market} then git push`,
      },
      { status: 501 }
    );
  } catch (err) {
    console.error("[archive-market]", err);
    return NextResponse.json({ error: "Archive failed" }, { status: 500 });
  }
}
