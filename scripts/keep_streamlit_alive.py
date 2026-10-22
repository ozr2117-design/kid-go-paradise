import sys
import time
from playwright.sync_api import sync_playwright

TARGET_URLS = [
    "https://weiqi-kids.streamlit.app",
    "https://rqehmildgsfhedt39krz7a.streamlit.app",
    "https://qdii-quota-monitor.streamlit.app",
]

def check_and_wake(page, url):
    print(f"\n==================================================")
    print(f"[*] Inspecting target: {url}")
    try:
        response = page.goto(url, timeout=60000, wait_until="domcontentloaded")
        status = response.status if response else "Unknown"
        print(f"[*] Initial HTTP Status: {status}")
        
        # Give Streamlit frontend 6s to evaluate status and render UI
        time.sleep(6)

        # Look for the wake-up button on the sleep screen
        # Button text typically: "Yes, get this app back up!"
        btn = page.locator("button:has-text('get this app back up')")
        if btn.count() > 0 and btn.first.is_visible():
            print(f"[!] Target is ASLEEP (Zzzz screen detected).")
            print(f"[!] Clicking 'Yes, get this app back up!' button now...")
            btn.first.click()
            # Wait 10s for the wake-up command to register with Streamlit Cloud orchestrator
            time.sleep(10)
            print(f"[SUCCESS] Wake-up button clicked successfully! Container is starting.")
        else:
            title = page.title()
            print(f"[ALIVE] Target is already AWAKE and healthy! (Page Title: '{title}')")
            
    except Exception as e:
        print(f"[ERROR] Failed to probe {url}: {e}")

def main():
    print(f"Starting Streamlit Headless Browser Keep-Alive Job...")
    print(f"Total Targets: {len(TARGET_URLS)}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        for url in TARGET_URLS:
            check_and_wake(page, url)

        browser.close()
    print("\n[ALL DONE] All Streamlit keep-alive probes completed successfully.")

if __name__ == "__main__":
    main()
