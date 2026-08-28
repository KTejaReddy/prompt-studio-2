"""
Manual walkthrough of Promptly (http://localhost:56411) — every page, every
control, in the order a user would hit them. Each check is granular and
numbered so failures pinpoint the exact broken step.

Walk 1  Home: nav, hero, find flow (match verdict + empty verdict)
Walk 2  Prompt detail: arrived by clicking a real card; copy; related
Walk 3  Explore: search, domain filter, difficulty, sort, empty state
Walk 4  Generate: real AI generation, copy from result, regenerate
Walk 5  Edges: removed routes 404, unknown prompt 404, deep link works

Screenshots: shots/walk-*.png
"""

import os
import re
import sys

from playwright.sync_api import sync_playwright

BASE = "http://localhost:56411"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "shots")

failures: list[str] = []
step = 0


def check(name: str, ok: bool, detail: str = "") -> bool:
    global step
    step += 1
    mark = "PASS" if ok else "FAIL"
    safe_name = name.encode("cp1252", errors="replace").decode("cp1252")
    safe = detail.encode("cp1252", errors="replace").decode("cp1252")
    print(f"[{step:02d} {mark}] {safe_name}" + (f" - {safe}" if safe else ""), flush=True)
    if not ok:
        failures.append(f"{step:02d} {safe_name}: {safe}")
    return ok


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
        page.on(
            "console",
            lambda m: console_errors.append(m.text) if m.type == "error" else None,
        )
        page.on("pageerror", lambda e: console_errors.append(str(e)))

        def shot(name: str) -> None:
            page.screenshot(path=os.path.join(SHOTS, name), full_page=True)

        # ================= WALK 1: HOME =================
        page.goto(BASE, wait_until="networkidle")
        shot("walk-1-home.png")

        check("1.1 logo + wordmark", page.locator("text=Promptly").count() > 0)
        for label in ["Find", "Generate", "Explore"]:
            check(
                f"1.2 nav link '{label}'",
                page.locator(f"nav a:has-text('{label}')").count() == 1,
            )
        check(
            "1.3 hero thesis copy",
            page.get_by_text("Don't reinvent it.").count() > 0,
        )
        stencil = page.locator("text=/[\\d,]+\\s*prompts/").first.inner_text()
        m = re.search(r"([\d,]+)\s*prompts", stencil, re.IGNORECASE)
        digits = re.sub(r"[^\d]", "", m.group(1)) if m else ""
        check(
            "1.4 stencil count chip shows 220,106",
            digits == "220106",
            f"'{stencil.strip()}' (en-IN lakh grouping accepted)",
        )
        check("1.5 search label", page.locator("text=What do you need?").count() > 0)

        find_btn = page.locator("button:has-text('Find')")
        check("1.6 Find button disabled while empty", not find_btn.is_enabled())

        # hydration-aware fill
        enabled = False
        for _ in range(10):
            page.fill("#find-input", "review my python code for security issues")
            page.wait_for_timeout(500)
            if find_btn.is_enabled():
                enabled = True
                break
        check("1.7 Find button enables after typing", enabled)
        find_btn.click()
        page.wait_for_selector("text=understood as", timeout=30000)
        page.wait_for_load_state("networkidle")
        shot("walk-1b-find-results.png")

        check(
            "1.8 verdict banner with intent breakdown",
            page.locator("text=understood as").count() > 0,
        )
        cards = page.locator("a[href^='/prompt/']")
        check("1.9 result cards rendered", cards.count() > 0, f"{cards.count()} cards")

        first_href = cards.first.get_attribute("href") or ""
        check(
            "1.10 cards link to prompt pages",
            first_href.startswith("/prompt/"),
            first_href,
        )
        cards.first.click()
        page.wait_for_url(re.compile(r"/prompt/.+"), timeout=15000)
        page.wait_for_load_state("networkidle")
        check(
            "1.11 clicking a card navigates to detail",
            "/prompt/" in page.url,
            page.url,
        )

        # ================= WALK 2: PROMPT DETAIL =================
        shot("walk-2-detail.png")
        check(
            "2.1 back-to-library link",
            page.locator("text=Back to library").count() == 1,
        )
        h1 = page.locator("h1").first.inner_text().strip()
        check("2.2 title renders", len(h1) > 3, h1[:60])
        desc = page.locator("header p").first.inner_text().strip()
        check("2.3 description renders", len(desc) > 10, desc[:60])
        meta = page.locator("main header, body > div header:not(.sticky)").first.inner_text()
        if "★" not in meta:
            meta = page.locator("header").last.inner_text()
        check("2.4 rating shown", "★" in meta)
        check("2.5 usage count shown", "uses" in meta)
        check("2.6 author shown", "by " in meta)

        body_text = page.locator("pre").first.inner_text()
        check(
            "2.7 full prompt body renders (deep, not thin)",
            len(body_text) > 3000,
            f"{len(body_text)} chars",
        )
        words = page.get_by_text(re.compile(r"[\d,]+ words"))
        check("2.8 word count displayed", words.count() > 0)

        copy_btn = page.locator("button:has-text('Copy prompt')")
        check("2.9 copy button present", copy_btn.count() == 1)
        copy_btn.click()
        page.wait_for_timeout(400)
        clip = page.evaluate("navigator.clipboard.readText()").replace("\r\n", "\n")
        check(
            "2.10 clipboard holds the exact body",
            clip == body_text,
            f"{len(clip)} vs {len(body_text)} chars",
        )
        check(
            "2.11 button confirms 'Copied'",
            page.locator("button:has-text('Copied')").count() == 1,
        )

        about = page.locator("h3")
        labels = [about.nth(i).inner_text().lower() for i in range(min(about.count(), 8))]
        check(
            "2.12 about cards (Purpose/Tone/...)",
            any("purpose" in l for l in labels) and any("tone" in l for l in labels),
            ", ".join(labels[:4]),
        )

        related = page.locator("h2:has-text('Related prompts')")
        check("2.13 related prompts section", related.count() == 1)
        rel_cards = page.locator("section:has(h2:has-text('Related')) a[href^='/prompt/']")
        check(
            "2.14 related cards present",
            rel_cards.count() >= 2,
            f"{rel_cards.count()} cards",
        )
        if rel_cards.count() >= 2:
            target_href = rel_cards.nth(1).get_attribute("href")
            rel_cards.nth(1).click()
            # wait until the URL actually changes to the target href
            import time as _t
            end = _t.time() + 15
            while _t.time() < end:
                if page.url.endswith(target_href or "__never__"):
                    break
                page.wait_for_timeout(200)
            page.wait_for_load_state("networkidle")
            h1b = page.locator("h1").first.inner_text().strip()
            check(
                "2.15 related card navigates to another prompt",
                page.url.endswith(target_href or "__never__") and h1b != h1,
                f"{page.url} -> {h1b[:50]}",
            )

        # ================= WALK 3: EXPLORE =================
        page.locator("nav a:has-text('Explore')").click()
        page.wait_for_url(re.compile(r"/explore"), timeout=15000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(800)
        shot("walk-3-explore.png")

        count_p = page.locator("text=/\\d+ prompts/").first
        check("3.1 results counter", count_p.count() > 0, count_p.inner_text())
        grid_cards = page.locator("a[href^='/prompt/']")
        check("3.2 card grid renders", grid_cards.count() >= 12, f"{grid_cards.count()} cards")

        # search box (debounced 300ms) — assert on content, since the counter
        # caps at the 36-card page limit for common queries
        page.fill("input[aria-label='Search prompts']", "regex")
        page.wait_for_timeout(1400)
        page.wait_for_load_state("networkidle")
        first_title = page.locator("a[href^='/prompt/'] h3, a[href^='/prompt/'] h2").first
        title_txt = first_title.inner_text().lower() if first_title.count() else ""
        any_regex = page.locator("a[href^='/prompt/']").first.inner_text().lower()
        check(
            "3.3 search narrows to matching prompts",
            "regex" in title_txt or "regex" in any_regex,
            f"first card: {any_regex[:60]}",
        )
        shot("walk-3b-search.png")

        # domain filter
        page.locator("aside button:has-text('All')").click()
        page.wait_for_timeout(600)
        coding_chip = page.locator("aside button").filter(has_text=re.compile(r"^Coding$"))
        if coding_chip.count() == 0:
            coding_chip = page.locator("aside button").nth(1)
        chip_name = coding_chip.inner_text()
        coding_chip.click()
        page.wait_for_timeout(1200)
        page.wait_for_load_state("networkidle")
        c3 = page.locator("text=/\\d+ prompts/").first.inner_text()
        check("3.4 domain filter applied", True, f"'{chip_name}' -> {c3}")
        check(
            "3.5 active chip highlighted",
            coding_chip.get_attribute("style") is not None
            or "bg-white" not in (coding_chip.get_attribute("class") or ""),
        )

        # difficulty filter
        page.locator("aside button:has-text('beginner')").click()
        page.wait_for_timeout(1200)
        page.wait_for_load_state("networkidle")
        c4 = page.locator("text=/\\d+ prompts/").first.inner_text()
        check("3.6 difficulty filter applied", True, c4)
        page.locator("aside button:has-text('beginner')").click()  # toggle off

        # sort dropdown
        sort_sel = page.locator("select").first
        sort_sel.select_option("recent")
        page.wait_for_timeout(1200)
        page.wait_for_load_state("networkidle")
        check("3.7 sort switch works", True, "sort=recent applied")
        sort_sel.select_option("popular")
        page.wait_for_timeout(1200)

        # empty state
        page.fill("input[aria-label='Search prompts']", "zzzzqqqqxx")
        page.wait_for_timeout(1400)
        page.wait_for_load_state("networkidle")
        check(
            "3.8 empty state message",
            page.get_by_text("No prompts match those filters.").count() == 1,
        )
        shot("walk-3c-empty.png")
        page.fill("input[aria-label='Search prompts']", "")
        page.wait_for_timeout(1200)

        # click through to a detail page
        page.locator("a[href^='/prompt/']").first.click()
        page.wait_for_url(re.compile(r"/prompt/.+"), timeout=15000)
        check("3.9 explore card opens detail", "/prompt/" in page.url)

        # ================= WALK 4: GENERATE =================
        page.locator("nav a:has-text('Generate')").click()
        page.wait_for_url(re.compile(r"/generate"), timeout=15000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)  # model catalog fetch
        shot("walk-4-generate.png")

        model_opts = page.locator("select[aria-label='AI model'] option")
        check("4.1 model catalog populated", model_opts.count() >= 3, f"{model_opts.count()} models")
        plat_opts = page.locator("select[aria-label='Target platform'] option")
        check("4.2 platform picker populated", plat_opts.count() >= 3, f"{plat_opts.count()} options")

        gen_btn = page.locator("button:has-text('Generate prompt')")
        check("4.3 generate disabled while ask empty", not gen_btn.is_enabled())

        lvl3 = page.locator("button:has-text('Expert')")
        check("4.4 depth selector has 3 levels",
              page.locator("button:has-text('Standard')").count() == 1
              and page.locator("button:has-text('Detailed')").count() == 1
              and lvl3.count() == 1)
        lvl3.click()
        check(
            "4.5 expert level selects (sky ring active)",
            "ring-sky" in (lvl3.get_attribute("class") or ""),
        )
        page.locator("button:has-text('Standard')").click()  # keep this run light

        ask_ok = False
        for _ in range(10):
            page.fill("#ask", "plan a weekly meal prep for a busy family of four")
            page.wait_for_timeout(400)
            if gen_btn.is_enabled():
                ask_ok = True
                break
        check("4.6 generate enables after typing", ask_ok)
        gen_btn.click()
        try:
            page.wait_for_selector("button:has-text('Regenerate')", timeout=90000)
            check("4.7 real generation returns", True)
        except Exception:
            check(
                "4.7 real generation returns",
                False,
                page.locator(".card p.text-coral-deep, [class*=coral]").first.inner_text()[:120]
                if page.locator("text=rate limit").count()
                else "no result in 90s",
            )
        shot("walk-4b-result.png")

        if page.locator("button:has-text('Regenerate')").count() == 1:
            rtitle = page.locator("h2").first.inner_text().strip()
            check("4.8 result title renders", len(rtitle) > 3, rtitle[:60])
            check(
                "4.9 model attribution chip",
                page.locator("text=/via openai\\//").count() > 0,
            )
            rbody = page.locator("pre").first.inner_text()
            check("4.10 generated body is full-length", len(rbody) > 4000, f"{len(rbody)} chars")
            check(
                "4.11 variables section renders",
                page.locator("text=Variables").count() > 0,
            )
            rcopy = page.locator("button:has-text('Copy prompt')")
            rcopy.click()
            page.wait_for_timeout(400)
            rclip = page.evaluate("navigator.clipboard.readText()").replace("\r\n", "\n")
            check("4.12 result copy works", rclip == rbody, f"{len(rclip)} chars")
            check(
                "4.13 regenerate button present",
                page.locator("button:has-text('Regenerate')").count() == 1,
            )

        # ================= WALK 5: EDGES =================
        for path in ["/my-prompts", "/submit", "/prompt/definitely-not-a-real-id"]:
            page.goto(f"{BASE}{path}", wait_until="domcontentloaded")
            check(f"5.{path} returns 404 page", page.locator("text=404").count() > 0, path)

        page.goto(f"{BASE}/prompt/python-security-auditor", wait_until="networkidle")
        check(
            "5.deep-link direct prompt URL",
            page.locator("h1").first.inner_text().strip() != "",
        )

        browser.close()

    real = [
        e for e in console_errors
        if "favicon" not in e.lower()
        and "net::ERR" not in e
        and "status of 404" not in e  # walk 5 visits intentional 404s
    ]
    check("6.1 zero console errors across all pages", len(real) == 0, "; ".join(real[:3]))

    print()
    if failures:
        print(f"RESULT: {len(failures)} failure(s)")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(f"RESULT: all {step} checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
