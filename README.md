# Le Petit Hamster

A playable storybook about a small hamster traveling between tiny planets.

## Reading Order

1. VISION.md
    - Why this project exists.

2. PRODUCT.md
    - What the player actually does.

3. ART_DIRECTION.md
    - Visual identity and atmosphere.

4. WORLD.md
    - Universe and lore.

5. PLANETS.md
    - Planet concepts.

6. CHARACTERS.md
    - Friends and NPCs.

7. REFERENCES.md
    - Inspirations and moodboards.

## Golden Rule

Le Petit Hamster is not about completion.

It is about curiosity, travel, and encounters.

## Deploy

Deployed on Cloudflare Pages. The production branch is `main`.

```sh
pnpm build        # type-check + vite build → dist/
pnpm deploy:cf    # wrangler pages deploy dist --branch main
```

The custom domain is `https://lepetithamster.cuteshrew.com` (CNAME in Cloudflare DNS).
