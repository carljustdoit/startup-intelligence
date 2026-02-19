from datetime import datetime

# Global buffer for live scrape logs
SCRAPE_LOGS = []

def add_scrape_log(message: str):
    """Adds a log entry with timestamp to the global buffer."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    SCRAPE_LOGS.append(log_entry)
    # Keep last 500 entries to show more history without bloating memory
    if len(SCRAPE_LOGS) > 500:
        SCRAPE_LOGS.pop(0)
    print(log_entry) # Still print to console for server logs
