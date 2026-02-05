# hello-world
social data

## Tools

### Broadway Lottery Auto-Entry

Automatically checks and enters Broadway ticket lotteries via TodayTix.

```bash
# One-time run
python -m lottery.runner

# Continuous (checks every 30 min)
python -m lottery.runner --loop

# Custom interval
python -m lottery.runner --loop --interval 15
```

### NYC Events Aggregator

Scrapes free/cheap NYC events from The Skint, NYC Parks, Eventbrite, and Oh My Rockness.

```bash
# Show all events under $25
python -m events.runner

# Filter by price and category
python -m events.runner --max-price 10 --categories music comedy

# Save to file
python -m events.runner --save
```

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your personal info
```
