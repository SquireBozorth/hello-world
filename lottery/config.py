import os
from dotenv import load_dotenv

load_dotenv()

USER_INFO = {
    "first_name": os.getenv("FIRST_NAME", ""),
    "last_name": os.getenv("LAST_NAME", ""),
    "email": os.getenv("EMAIL", ""),
    "phone": os.getenv("PHONE", ""),
    "date_of_birth": os.getenv("DATE_OF_BIRTH", ""),
    "zip_code": os.getenv("ZIP_CODE", ""),
    "num_tickets": int(os.getenv("NUM_TICKETS", "2")),
}

# Shows and their lottery platforms/URLs
# Format: { "show_name": { "platform": "todaytix"|"luckyseat"|"broadway_direct", "show_id": "..." } }
SHOWS = {
    "Hamilton": {"platform": "todaytix", "show_id": "2928"},
    "Wicked": {"platform": "todaytix", "show_id": "2636"},
    "The Lion King": {"platform": "todaytix", "show_id": "2291"},
    "Aladdin": {"platform": "todaytix", "show_id": "2396"},
    "Hadestown": {"platform": "todaytix", "show_id": "14873"},
    "MJ The Musical": {"platform": "todaytix", "show_id": "22120"},
    "The Great Gatsby": {"platform": "todaytix", "show_id": "29498"},
    "Back to the Future": {"platform": "todaytix", "show_id": "25498"},
    "Harry Potter and the Cursed Child": {"platform": "todaytix", "show_id": "6696"},
    "Chicago": {"platform": "todaytix", "show_id": "2232"},
    "SIX": {"platform": "todaytix", "show_id": "18498"},
    "& Juliet": {"platform": "todaytix", "show_id": "24420"},
}

# TodayTix API base
TODAYTIX_API_BASE = "https://api.todaytix.com/api/v2"
TODAYTIX_LOTTERY_ENTRY_URL = TODAYTIX_API_BASE + "/customers/me/lotteries"
