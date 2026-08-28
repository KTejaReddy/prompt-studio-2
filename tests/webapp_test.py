"""
Webapp test pass for Promptly (http://localhost:56411).

Covers:
  1. Home — Mimeograph design tokens actually applied (bg, fonts, stencil bar)
  2. Find flow — type a job, get a verdict + result cards
  3. Prompt detail — one-click copy puts the full prompt on the clipboard
  4. Generate studio — model catalog + depth selector render
  5. Explore — sort browsing works
  6. Console error capture on every page

Screenshots land in ./shots/ so a human can eyeball the design.
"""

import os
import sys

from playwright.sync_api import sync_playwright

BASE = "http://localhost:56411"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "shots")

failures: list[str] = []
notes: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    mark = "PASS" if ok else "FAIL"
    # Windows consoles may be cp1252 — never let a glyph crash the report.
    safe_name = name.encode("cp1252", errors="replace").decode("cp1252")
    safe = detail.encode("cp1252", errors="replace").decode("cp1252")
    print(f"[{mark}] {safe_name}" + (f" - {safe}" if safe else ""))
    if not ok:
        failures.append(f"{safe_name}: {safe}")


def main() -> int:
    os.makedirs(SHOTS, exist_ok=True)
    console_errors: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            permissions=["clipboard-read", "clipboard-write"],
        )
        page = context.new_page()

        def watch_console(tag: str) -> None:
            page.on(
                "console",
                lambda m, t=tag: console_errors.append(f"{t}: {m.text}")
                if m.type == "error"
                else None,
            )
            page.on(
                "pageerror",
                lambda e, t=tag: console_errors.append(f"{t}: {e}"),
            )

        # ---------- 1. Home ----------
        page.goto(BASE, wait_until="networkidle")
        watch_console("home")
        page.screenshot(path=os.path.join(SHOTS, "1-home.png"), full_page=True)

        body_bg = page.evaluate(
            "getComputedStyle(document.body).backgroundColor"
        )
        check("home: cyan-white background", body_bg == "rgb(247, 253, 254)", body_bg)

        h1_font = page.evaluate(
            "getComputedStyle(document.querySelector('h1')).fontFamily"
        )
        check(
            "home: display face is Bricolage",
            "bricolage" in h1_font.lower(),
            h1_font[:60],
        )

        check(
            "home: hero thesis copy",
            page.get_by_text("Don't reinvent it.").count() > 0,
        )
        check(
            "home: stencil count chip",
            page.get_by_text("prompts").count() > 0,
        )
        check("home: search label", page.locator("text=What do you need?").count() > 0)

        caret = page.evaluate(
            "getComputedStyle(document.getElementById('find-input')).caretColor"
        )
        check(
            "home: caret is brand cyan",
            caret in ("rgb(34, 184, 205)", "#22b8cd"),
            caret,
        )

        # ---------- 2. Find flow ----------
        # The Find button stays disabled until the input has text AND React
        # hydration has attached the onChange handler. Fill, then poll for
        # enablement; retry a few times in case early keystrokes landed
        # before hydration.
        find_btn = page.locator("button:has-text('Find')")
        enabled = False
        for _ in range(10):
            page.fill("#find-input", "review my python code for security issues")
            page.wait_for_timeout(500)
            if find_btn.is_enabled():
                enabled = True
                break
        check("find: button enabled after hydration", enabled)
        page.click("button:has-text('Find')")
        page.wait_for_selector("text=understood as", timeout=30000)
        page.wait_for_load_state("networkidle")
        page.screenshot(path=os.path.join(SHOTS, "2-find.png"), full_page=True)

        cards = page.locator("a[href^='/prompt/']").count()
        check("find: result cards rendered", cards > 0, f"{cards} cards")

        verdict = page.locator("text=understood as").count()
        check("find: intent breakdown shown", verdict > 0)

        # ---------- 3. Prompt detail + one-click copy ----------
        page.goto(f"{BASE}/prompt/gen-coding-000000", wait_until="networkidle")
        watch_console("detail")
        page.screenshot(path=os.path.join(SHOTS, "3-detail.png"), full_page=True)

        check(
            "detail: customizer removed",
            page.get_by_text("Make it yours").count() == 0,
        )
        copy_btn = page.locator("button:has-text('Copy prompt')")
        check("detail: copy button present", copy_btn.count() == 1)

        copy_btn.click()
        page.wait_for_timeout(400)
        clip = page.evaluate("navigator.clipboard.readText()")
        check(
            "detail: one-click copy → clipboard holds full prompt",
            len(clip) > 2000 and "You are a" in clip,
            f"{len(clip)} chars, starts: {clip[:48]!r}",
        )
        check(
            "detail: button confirms",
            page.locator("button:has-text('Copied ✓')").count() == 1,
        )

        # ---------- 4. Generate studio ----------
        page.goto(f"{BASE}/generate", wait_until="networkidle")
        watch_console("generate")
        page.wait_for_timeout(800)  # model catalog fetch
        page.screenshot(path=os.path.join(SHOTS, "4-generate.png"), full_page=True)

        options = page.locator("select[aria-label='AI model'] option").count()
        check("generate: model catalog populated", options >= 3, f"{options} models")

        depth_buttons = page.locator("button:has-text('Expert')").count()
        check("generate: 3 depth levels", depth_buttons == 1 and
              page.locator("button:has-text('Detailed')").count() == 1)

        # Level 3 selected state renders
        page.click("button:has-text('Expert')")
        check(
            "generate: expert level selectable",
            page.locator("button:has-text('Expert')").get_attribute("class").find("ring-lavender") >= 0,
        )

        # ---------- 5. Explore ----------
        page.goto(f"{BASE}/explore?sort=popular", wait_until="networkidle")
        watch_console("explore")
        page.screenshot(path=os.path.join(SHOTS, "5-explore.png"), full_page=True)
        explore_cards = page.locator("a[href^='/prompt/']").count()
        check("explore: popular sort renders cards", explore_cards > 0, f"{explore_cards} cards")

        browser.close()

    # ---------- 6. Console ----------
    real_errors = [
        e for e in console_errors
        if "favicon" not in e.lower() and "net::ERR" not in e
    ]
    check("console: no errors on any page", len(real_errors) == 0,
          "; ".join(real_errors[:3]))

    print()
    if notes:
        print("Notes:")
        for n in notes:
            print(f"  - {n}")
    if failures:
        print(f"RESULT: {len(failures)} failure(s)")
        return 1
    print("RESULT: all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
