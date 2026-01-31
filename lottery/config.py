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

# Broadway Direct lottery shows
# URL pattern: https://lottery.broadwaydirect.com/show/{slug}/
BROADWAY_DIRECT_SHOWS = {
    "Aladdin": "aladdin",
    "Death Becomes Her": "death-becomes-her",
    "MJ The Musical": "mj-ny",
    "SIX": "six-ny",
    "Stranger Things": "st-nyc",
}

BROADWAY_DIRECT_BASE = "https://lottery.broadwaydirect.com/show"

# Broadway Direct form field DOM IDs
BD_FIELDS = {
    "first_name": "dlslot_name_first",
    "last_name": "dlslot_name_last",
    "num_tickets": "dlslot_ticket_qty",
    "email": "dlslot_email",
    "dob_month": "dlslot_dob_month",
    "dob_day": "dlslot_dob_day",
    "dob_year": "dlslot_dob_year",
    "zip_code": "dlslot_zip",
    "country": "dlslot_country",
    "agree": "dlslot_agree",
}
