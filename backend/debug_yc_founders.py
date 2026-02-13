import asyncio
from playwright.async_api import async_playwright

async def debug_founders():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        page = await context.new_page()
        
        url = "https://www.ycombinator.com/companies/outerport"
        print(f"Opening {url}...")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        print("\n--- Strategy: .prose ---")
        prose_list = await page.locator('.prose').all()
        print(f"Found {len(prose_list)} .prose matches")
        for i, p_el in enumerate(prose_list):
             text = await p_el.inner_text()
             print(f"Prose {i} text snippet: {text[:100]}...")

        print("\n--- Strategy: h3 ---")
        h3_list = await page.locator('h3').all()
        print(f"Found {len(h3_list)} h3 matches")
        for i, h3 in enumerate(h3_list):
             text = await h3.inner_text()
             print(f"h3 {i} text: {text}")

        print("\n--- Strategy: ycdc-card-new ---")
        ycdc = await page.locator('.ycdc-card-new').all()
        print(f"Found {len(ycdc)} ycdc-card-new matches")
        for i, card in enumerate(ycdc):
             text = await card.inner_text()
             print(f"ycdc {i} text snippet: {text[:100]}...")

        print("\n--- Strategy: LinkedIn Links ---")
        links = await page.locator('a[href*="linkedin.com/in/"]').all()
        print(f"Found {len(links)} LinkedIn links")
        for link in links:
             href = await link.get_attribute("href")
             # Find name by looking at nearest parent's text
             parent_text = await link.locator('xpath=..').inner_text()
             print(f"LinkedIn: {href} (Parent text: {parent_text[:30]}...)")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_founders())
