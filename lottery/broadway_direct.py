"""Broadway Direct lottery auto-fill module.

Opens each show's lottery page in a real browser, auto-fills your info,
and pauses for you to solve the CAPTCHA and click submit.
"""

import logging
import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException,
)
from webdriver_manager.chrome import ChromeDriverManager

from .config import (
    USER_INFO,
    BROADWAY_DIRECT_SHOWS,
    BROADWAY_DIRECT_BASE,
    BD_FIELDS,
)

logger = logging.getLogger(__name__)

WAIT_TIMEOUT = 15


def _create_driver():
    """Create a visible Chrome browser instance."""
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    try:
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
    except WebDriverException:
        # Fall back to system Chrome/chromedriver
        driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)
    return driver


def _parse_dob(dob_str: str) -> tuple[str, str, str]:
    """Parse DATE_OF_BIRTH from .env (YYYY-MM-DD) into (month, day, year)."""
    parts = dob_str.split("-")
    if len(parts) == 3:
        return parts[1].lstrip("0"), parts[2].lstrip("0"), parts[0]
    return ("", "", "")


def _fill_field(driver, field_id: str, value: str):
    """Fill a text input by its DOM ID."""
    try:
        el = driver.find_element(By.ID, field_id)
        el.clear()
        el.send_keys(value)
    except NoSuchElementException:
        logger.warning("Field %s not found on page", field_id)


def _select_field(driver, field_id: str, value: str):
    """Select a dropdown option by its DOM ID."""
    try:
        el = driver.find_element(By.ID, field_id)
        select = Select(el)
        try:
            select.select_by_value(value)
        except NoSuchElementException:
            select.select_by_visible_text(value)
    except NoSuchElementException:
        logger.warning("Select field %s not found on page", field_id)


def _check_box(driver, field_id: str):
    """Check a checkbox by its DOM ID."""
    try:
        el = driver.find_element(By.ID, field_id)
        if not el.is_selected():
            el.click()
    except NoSuchElementException:
        logger.warning("Checkbox %s not found on page", field_id)


def fill_lottery_form(driver, show_name: str, slug: str) -> bool:
    """Navigate to a show's lottery page and auto-fill the entry form.

    Returns True if the form was filled successfully, False if the lottery
    page couldn't be loaded or the form wasn't found.
    """
    url = f"{BROADWAY_DIRECT_BASE}/{slug}/"
    logger.info("Opening %s lottery: %s", show_name, url)
    driver.get(url)

    # Wait for page to load and look for the entry form or "enter" button
    try:
        # Some pages have a button to reveal the form first
        enter_btns = driver.find_elements(By.CSS_SELECTOR, ".enter-button, .lottery-entry-btn, a.enter-now")
        if enter_btns:
            enter_btns[0].click()
            time.sleep(2)
    except Exception:
        pass

    # Check if lottery is actually open
    try:
        WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.presence_of_element_located((By.ID, BD_FIELDS["first_name"]))
        )
    except TimeoutException:
        # Check for "lottery closed" indicators
        page_text = driver.page_source.lower()
        if "closed" in page_text or "not currently" in page_text or "come back" in page_text:
            logger.info("Lottery for %s is not currently open.", show_name)
            return False
        logger.warning("Could not find entry form for %s (page may have changed).", show_name)
        return False

    # Parse date of birth
    month, day, year = _parse_dob(USER_INFO["date_of_birth"])

    # Fill all fields
    _fill_field(driver, BD_FIELDS["first_name"], USER_INFO["first_name"])
    _fill_field(driver, BD_FIELDS["last_name"], USER_INFO["last_name"])
    _fill_field(driver, BD_FIELDS["email"], USER_INFO["email"])
    _fill_field(driver, BD_FIELDS["zip_code"], USER_INFO["zip_code"])

    # Dropdowns
    _select_field(driver, BD_FIELDS["num_tickets"], str(USER_INFO["num_tickets"]))
    _select_field(driver, BD_FIELDS["dob_month"], month)
    _select_field(driver, BD_FIELDS["dob_day"], day)
    _select_field(driver, BD_FIELDS["dob_year"], year)
    _select_field(driver, BD_FIELDS["country"], "US")

    # Check TOS
    _check_box(driver, BD_FIELDS["agree"])

    logger.info(
        "Form filled for %s. Solve the CAPTCHA and click Submit.",
        show_name,
    )
    return True


def run_all_entries(interactive: bool = True) -> dict:
    """Open each Broadway Direct lottery and auto-fill the forms.

    If interactive=True, keeps the browser open for you to solve CAPTCHAs.
    Returns {show_name: True/False} for whether each form was filled.
    """
    results = {}
    driver = None

    try:
        driver = _create_driver()

        for show_name, slug in BROADWAY_DIRECT_SHOWS.items():
            try:
                filled = fill_lottery_form(driver, show_name, slug)
                results[show_name] = filled

                if filled and interactive:
                    # Wait for user to solve CAPTCHA and submit
                    logger.info(
                        ">>> Waiting for you to solve CAPTCHA for %s. "
                        "Press Enter in the terminal when done...",
                        show_name,
                    )
                    input()
            except Exception as e:
                logger.error("Error processing %s: %s", show_name, e)
                results[show_name] = False

    except WebDriverException as e:
        logger.error(
            "Could not start Chrome browser: %s\n"
            "Make sure Google Chrome is installed on your Mac.",
            e,
        )
    finally:
        if driver and not interactive:
            driver.quit()
        elif driver:
            logger.info("Browser will stay open. Close it when you're done.")

    return results
