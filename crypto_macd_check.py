import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_macd(data, fast=12, slow=26, signal=9):
    exp1 = data.ewm(span=fast).mean()
    exp2 = data.ewm(span=slow).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal).mean()
    histogram = macd - signal_line
    return macd, signal_line, histogram

def check_crossover(histogram, days=2):
    if len(histogram) < days + 1:
        return False
    recent = histogram.tail(days + 1)
    # Check if any recent histogram value is positive while previous was negative
    for i in range(1, len(recent)):
        if recent.iloc[i] > 0 and recent.iloc[i-1] <= 0:
            return True
    return False

def check_converging(macd, signal_line, days=3):
    if len(macd) < days:
        return False, 0
    
    recent_macd = macd.tail(days)
    recent_signal = signal_line.tail(days)
    
    # Check if trending up for 3+ days
    trending_up = all(recent_macd.iloc[i] >= recent_macd.iloc[i-1] for i in range(1, len(recent_macd)))
    
    # Check if within 10% of signal line
    current_gap = abs(macd.iloc[-1] - signal_line.iloc[-1])
    signal_value = abs(signal_line.iloc[-1])
    gap_pct = (current_gap / signal_value * 100) if signal_value != 0 else 100
    
    within_10pct = gap_pct <= 10
    
    return trending_up and within_10pct, gap_pct

# Check each crypto pair
symbols = ['ZEC-USD', 'BTC-USD', 'NYM-USD', 'ATOM-USD', 'COTI-USD', 'XMR-USD']
alerts = []

for symbol in symbols:
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period='3mo')
        
        if data.empty:
            print(f'{symbol}: No data available')
            continue
            
        close_prices = data['Close']
        current_price = close_prices.iloc[-1]
        
        macd, signal_line, histogram = calculate_macd(close_prices)
        
        # Check for crossover
        is_crossover = check_crossover(histogram)
        
        # Check for converging
        is_converging, gap_pct = check_converging(macd, signal_line)
        
        print(f'{symbol}: Price=${current_price:.4f}')
        print(f'  MACD: {macd.iloc[-1]:.6f}, Signal: {signal_line.iloc[-1]:.6f}, Histogram: {histogram.iloc[-1]:.6f}')
        print(f'  Crossover: {is_crossover}, Converging: {is_converging} (gap: {gap_pct:.1f}%)')
        
        if is_crossover:
            alerts.append(f'🟢 CROSSOVER: {symbol} ${current_price:.4f} — MACD crossed signal')
        elif is_converging:
            alerts.append(f'🟡 CONVERGING: {symbol} ${current_price:.4f} — MACD approaching signal (gap: {gap_pct:.1f}%)')
        
        print()
            
    except Exception as e:
        print(f'Error processing {symbol}: {e}')

print('ALERTS:', alerts)