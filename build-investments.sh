#!/bin/bash
# Updates investments.json for Mission Control
uv run --with yfinance --with requests --python 3.11 -- python3 << 'PYEOF'
import yfinance as yf
import json, requests
from datetime import datetime

watchlist = {
    "crypto": {
        "ZEC-USD": "Zcash", "BTC-USD": "Bitcoin", "NYM-USD": "Nym",
        "ATOM-USD": "Cosmos", "COTI-USD": "COTI", "XMR-USD": "Monero"
    },
    "stocks": {
        "NOVO-B.CO": "Novo Nordisk", "SAMPO.HE": "Sampo", "BETS-B.ST": "Betsson",
        "HILB-B.ST": "Hilbert Group", "OKEA.OL": "OKEA", "EVO.ST": "Evolution",
        "IDEX.OL": "IDEX Biometrics", "URNM": "URNM ETF", "VEND.OL": "Vend",
        "WKL.AS": "Wolters Kluwer", "WISE.L": "Wise"
    }
}

results = []
for category, symbols in watchlist.items():
    for sym, name in symbols.items():
        try:
            t = yf.Ticker(sym)
            info = t.info
            df = t.history(period="3mo")
            if df.empty or len(df) < 26:
                results.append({"symbol": sym, "name": name, "category": category, "error": "insufficient data"})
                continue
            ema12 = df['Close'].ewm(span=12).mean()
            ema26 = df['Close'].ewm(span=26).mean()
            macd = ema12 - ema26
            signal = macd.ewm(span=9).mean()
            hist = macd - signal
            delta = df['Close'].diff()
            gain = delta.where(delta > 0, 0).rolling(14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            price = df['Close'].iloc[-1]
            chg_7d = ((price / df['Close'].iloc[-6]) - 1) * 100 if len(df) > 6 else None
            chg_30d = ((price / df['Close'].iloc[-22]) - 1) * 100 if len(df) > 22 else None
            prev_hist = hist.iloc[-2]
            curr_hist = hist.iloc[-1]
            crossover = prev_hist < 0 and curr_hist > 0
            convergence = (abs(macd.iloc[-1] - signal.iloc[-1]) < abs(signal.iloc[-1]) * 0.1 and macd.iloc[-1] > macd.iloc[-3]) if signal.iloc[-1] != 0 else False
            macd_positive = macd.iloc[-1] > 0
            if crossover:
                status = "crossover"
            elif convergence:
                status = "converging"
            elif curr_hist > 0 and macd_positive:
                status = "bullish"
            elif curr_hist > 0 and not macd_positive:
                status = "recovering"  # histogram positive but MACD still below zero
            else:
                status = "bearish"
            results.append({
                "symbol": sym, "name": name, "category": category, "price": round(price, 2),
                "currency": info.get("currency", "USD"), "pe": info.get("trailingPE"),
                "marketCap": info.get("marketCap"), "macd": round(macd.iloc[-1], 4),
                "signal": round(signal.iloc[-1], 4), "histogram": round(hist.iloc[-1], 4),
                "rsi": round(rsi.iloc[-1], 1) if rsi.iloc[-1] == rsi.iloc[-1] else None,
                "change7d": round(chg_7d, 1) if chg_7d else None,
                "change30d": round(chg_30d, 1) if chg_30d else None,
                "status": status, "high52w": info.get("fiftyTwoWeekHigh"), "low52w": info.get("fiftyTwoWeekLow"),
            })
        except Exception as e:
            results.append({"symbol": sym, "name": name, "category": category, "error": str(e)})

try:
    fng = requests.get("https://api.alternative.me/fng/?limit=2", timeout=10).json()["data"]
    sentiment = {"current": int(fng[0]["value"]), "previous": int(fng[1]["value"]), "label": fng[0]["value_classification"]}
except: sentiment = None

try:
    cg = requests.get("https://api.coingecko.com/api/v3/global", timeout=10).json()["data"]
    globalData = {"btcDominance": round(cg["market_cap_percentage"]["btc"], 1), "totalMarketCap": cg["total_market_cap"]["usd"], "totalVolume": cg["total_volume"]["usd"], "marketCapChange24h": round(cg["market_cap_change_percentage_24h_usd"], 2)}
except: globalData = None

with open("/Users/knut/.openclaw/workspace/investments.json", "w") as f:
    json.dump({"lastUpdated": datetime.now().isoformat(), "sentiment": sentiment, "globalData": globalData, "assets": results}, f, indent=2, ensure_ascii=False)
print(f"Updated {len(results)} assets")
PYEOF
