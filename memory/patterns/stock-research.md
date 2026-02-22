# Pattern: Stock Research

## When
Knut asks about a stock, sector, or investment thesis.

## Steps
1. Quick price/quote: `yf price <SYMBOL>` or `yf quote <SYMBOL>`
2. Fundamentals: `yf fundamentals <SYMBOL>`
3. Chart with indicators: `cd stock-market-pro && uv run --script scripts/yf.py pro <SYMBOL> 3mo --macd --rsi`
4. Copy chart to workspace and send via Telegram if needed
5. For comparisons: `yf compare SYM1 SYM2 SYM3`
6. News: `python3 scripts/news.py <SYMBOL> --max 8`

## Nordic Suffixes
- Oslo: .OL | Copenhagen: .CO | Stockholm: .ST | Helsinki: .HE

## Gotchas
- Chart saves to /tmp/<SYMBOL>_pro.png — copy to workspace before sending
- Screener: `screener --market nordic --pe-max 15 --roe-min 20 --sort roe`
- Knut's thesis: physical-moat + low PE + AI admin cost cuts = 🚀

## Quality: ⭐⭐⭐⭐ (works well)
