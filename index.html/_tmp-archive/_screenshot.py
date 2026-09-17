"""Screenshot rapido do portfolio pra conferir o visual."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(r"C:\Users\User\Desktop\portfolio vyctor")
URL = "file:///C:/Users/User/Desktop/portfolio%20vyctor/index.html"


async def shoot(page, name, scroll_to=None, wait_ms=1500):
    if scroll_to is not None:
        await page.evaluate(f"window.scrollTo({{top: {scroll_to}, behavior: 'instant'}})")
        # smooth scroll lerp precisa de ~1.5s pra estabilizar
        await asyncio.sleep(1.6)
    await asyncio.sleep(wait_ms / 1000)
    await page.screenshot(path=str(ROOT / f"_shot-{name}.png"), full_page=False)
    print(f"  -> _shot-{name}.png")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        await page.goto(URL, wait_until="networkidle")

        print("desktop:")
        await shoot(page, "hero", wait_ms=1500)
        await shoot(page, "sobre", scroll_to="window.innerHeight*1.05")
        await shoot(page, "projetos",
                    scroll_to="document.getElementById('projetos').offsetTop - 80")
        await shoot(page, "skills",
                    scroll_to="document.getElementById('habilidades').offsetTop - 80")
        await shoot(page, "trajetoria",
                    scroll_to="document.getElementById('trajetoria').offsetTop - 80")
        await shoot(page, "contato",
                    scroll_to="document.getElementById('contato').offsetTop - 80")

        await ctx.close()
        print("mobile:")
        ctxm = await browser.new_context(viewport={"width": 390, "height": 844},
                                          device_scale_factor=2)
        pagem = await ctxm.new_page()
        await pagem.goto(URL, wait_until="networkidle")
        await shoot(pagem, "mobile-hero", wait_ms=1500)
        await shoot(pagem, "mobile-projetos",
                    scroll_to="document.getElementById('projetos').offsetTop - 80")

        await browser.close()
        print("ok")


asyncio.run(main())