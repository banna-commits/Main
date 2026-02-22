'use client';

import { InvestmentsData, Asset } from '@/types';

function fmtCap(v?: number) {
  if (!v) return 'N/A';
  if (v >= 1e12) return '$' + (v / 1e12).toFixed(1) + 'T';
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
  return '$' + v.toLocaleString();
}

function FmtChg({ v }: { v?: number | null }) {
  if (v === null || v === undefined) return <span className="text-text-dim">N/A</span>;
  return v >= 0 ? <span className="text-green">+{v.toFixed(1)}%</span> : <span className="text-red">{v.toFixed(1)}%</span>;
}

const STATUS_LABELS: Record<string, string> = {
  crossover: '🟢 CROSS', converging: '🟡 CONV', bullish: '🟢 BULL', recovering: '🟠 RECV', bearish: '🔴 BEAR',
};

const STATUS_STYLES: Record<string, string> = {
  crossover: 'bg-[#1f3a1f] text-green',
  converging: 'bg-[#3f3a1a] text-yellow',
  bullish: 'bg-[#1a3f2a] text-green',
  recovering: 'bg-[#2a2a1a] text-orange',
  bearish: 'bg-[#3f1a1a] text-red',
};

const ORDER: Record<string, number> = { crossover: 0, converging: 1, bullish: 2, bearish: 3 };

function AssetTable({ title, assets, showPE }: { title: string; assets: Asset[]; showPE: boolean }) {
  const sorted = [...assets].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const histMax = Math.max(...assets.filter(x => !x.error).map(x => Math.abs(x.histogram || 0)), 0.001);

  return (
    <>
      <div className="text-base font-bold mt-5 mb-3">{title}</div>
      <div className="w-full bg-surface border border-border rounded-[10px] overflow-hidden mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-left border-b border-border bg-bg">Asset</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">Price</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">MACD</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">Signal</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">Hist</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-left border-b border-border bg-bg">Status</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">RSI</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">7d</th>
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">30d</th>
              {showPE && <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">PE</th>}
              <th className="text-[10px] uppercase tracking-wide text-text-dim p-2.5 text-right border-b border-border bg-bg">Cap</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a => {
              if (a.error) {
                return (
                  <tr key={a.symbol} className="hover:bg-[rgba(88,166,255,0.05)]">
                    <td className="text-[13px] p-2.5 border-b border-border">
                      <span className="font-bold text-accent">{a.symbol}</span><br/>
                      <span className="text-text-dim text-[11px]">{a.name}</span>
                    </td>
                    <td colSpan={showPE ? 10 : 9} className="text-text-dim p-2.5 border-b border-border">{a.error}</td>
                  </tr>
                );
              }
              const histAbs = Math.abs(a.histogram);
              const barW = Math.max(2, (histAbs / histMax) * 60);
              const rsiColor = (a.rsi ?? 50) < 30 ? 'text-green' : (a.rsi ?? 50) > 70 ? 'text-red' : 'text-text';
              return (
                <tr key={a.symbol} className="hover:bg-[rgba(88,166,255,0.05)]">
                  <td className="text-[13px] p-2.5 border-b border-border">
                    <span className="font-bold text-accent">{a.symbol.replace('-USD', '')}</span><br/>
                    <span className="text-text-dim text-[11px]">{a.name}</span>
                  </td>
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border">{a.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border">{a.macd.toFixed(3)}</td>
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border">{a.signal.toFixed(3)}</td>
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border">
                    {a.histogram >= 0 ? '+' : ''}{a.histogram.toFixed(3)}{' '}
                    <span className={`inline-block h-1.5 rounded-sm align-middle ml-1 min-w-[2px] max-w-[60px] ${a.histogram >= 0 ? 'bg-green' : 'bg-red'}`} style={{ width: barW }} />
                  </td>
                  <td className="p-2.5 border-b border-border">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] whitespace-nowrap ${STATUS_STYLES[a.status] || ''}`}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </td>
                  <td className={`text-right font-mono text-xs p-2.5 border-b border-border ${rsiColor}`}>{a.rsi ?? 'N/A'}</td>
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border"><FmtChg v={a.change7d} /></td>
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border"><FmtChg v={a.change30d} /></td>
                  {showPE && <td className="text-right font-mono text-xs p-2.5 border-b border-border">{a.pe ? a.pe.toFixed(1) : 'N/A'}</td>}
                  <td className="text-right font-mono text-xs p-2.5 border-b border-border">{fmtCap(a.marketCap)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function InvestmentsTab({ data }: { data: InvestmentsData | null }) {
  if (!data) return null;

  const s = data.sentiment;
  const g = data.globalData;
  const fngClass = !s ? '' : s.current < 10 ? 'text-red' : s.current < 25 ? 'text-orange' : s.current < 50 ? 'text-yellow' : s.current < 75 ? 'text-green' : 'text-accent';
  const fngBg = !s ? '' : s.current < 10 ? 'bg-red' : s.current < 25 ? 'bg-orange' : s.current < 50 ? 'bg-yellow' : s.current < 75 ? 'bg-green' : 'bg-accent';
  const dir = s ? (s.current > s.previous ? '↑' : s.current < s.previous ? '↓' : '→') : '';

  const crypto = data.assets.filter(a => a.category === 'crypto');
  const stocks = data.assets.filter(a => a.category === 'stocks');

  return (
    <div>
      <div className="flex gap-4 mb-5 flex-wrap">
        {s && (
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3.5 flex-1 min-w-[160px]">
            <div className="text-[10px] text-text-dim uppercase tracking-wide mb-1">Fear & Greed</div>
            <div className={`text-2xl font-bold ${fngClass}`}>{s.current} {dir}</div>
            <div className="text-[11px] text-text-dim mt-0.5">{s.label} (prev: {s.previous})</div>
            <div className="w-full h-2 bg-border rounded mt-1.5 overflow-hidden">
              <div className={`h-full rounded transition-all duration-500 ${fngBg}`} style={{ width: `${s.current}%` }} />
            </div>
          </div>
        )}
        {g && (
          <>
            <div className="bg-surface border border-border rounded-[10px] px-4 py-3.5 flex-1 min-w-[160px]">
              <div className="text-[10px] text-text-dim uppercase tracking-wide mb-1">BTC Dominance</div>
              <div className="text-2xl font-bold">{g.btcDominance}%</div>
              <div className="text-[11px] text-text-dim mt-0.5">of total crypto market</div>
            </div>
            <div className="bg-surface border border-border rounded-[10px] px-4 py-3.5 flex-1 min-w-[160px]">
              <div className="text-[10px] text-text-dim uppercase tracking-wide mb-1">Crypto Market Cap</div>
              <div className="text-2xl font-bold">{fmtCap(g.totalMarketCap)}</div>
              <div className="text-[11px] text-text-dim mt-0.5"><FmtChg v={g.marketCapChange24h} /> 24h</div>
            </div>
            <div className="bg-surface border border-border rounded-[10px] px-4 py-3.5 flex-1 min-w-[160px]">
              <div className="text-[10px] text-text-dim uppercase tracking-wide mb-1">24h Volume</div>
              <div className="text-2xl font-bold">{fmtCap(g.totalVolume)}</div>
            </div>
          </>
        )}
      </div>

      {crypto.length > 0 && <AssetTable title="🪙 Crypto" assets={crypto} showPE={false} />}
      {stocks.length > 0 && <AssetTable title="📊 Stocks" assets={stocks} showPE={true} />}

      <div className="text-[11px] text-text-dim mt-2">
        Last updated: {new Date(data.lastUpdated).toLocaleString('no-NO')}
      </div>
    </div>
  );
}
