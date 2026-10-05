# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal blog hosted on GitHub Pages. The site is bilingual (English/Japanese) and includes technical blog posts about software engineering, programming, and language learning.

## Development Commands

This project uses Jekyll with GitHub Pages. Key commands:

```bash
# Install dependencies (requires Ruby and Bundler)
bundle install

# Serve the site locally for development
bundle exec jekyll serve

# Build the site for production
bundle exec jekyll build

# Serve with drafts included
bundle exec jekyll serve --drafts
```

Note: Jekyll and Bundle commands may not be available in all environments. The site is designed to build automatically on GitHub Pages.

## Site Architecture

### Content Structure

- `_posts/`: Published blog posts in Markdown format with YAML front matter
- `_drafts/`: Draft posts not yet published
- `_layouts/`: HTML templates for different page types
  - `default.html`/`default-ja.html`: Base page layout
  - `post.html`/`post-ja.html`: Blog post layout  
  - `page.html`/`page-ja.html`: Static page layout
- `_includes/`: Reusable HTML components (header, footer, etc.)
- `_sass/`: Sass partials imported by `css/main.scss`
- `about/`: Static about pages

### Bilingual Support

The site supports English and Japanese content:
- English content uses standard layouts (`default.html`, `post.html`, etc.)
- Japanese content uses `-ja` suffixed layouts and is served from `/ja/` path
- `head.html`, `header.html` and `footer.html` are shared and take `lang="ja"` from the `-ja` layouts
- Language configuration in `_config.yml` defines both languages
- Content specifies language in front matter: `language: en` or `language: ja`

### Styling

- Custom stylesheet: `css/main.scss` imports `_sass/_base.scss` (color tokens, element styles), `_sass/_layout.scss` (header, footer, home, posts), `_sass/_syntax-highlighting.scss` and `_sass/table.scss`
- Colors are CSS custom properties with a `prefers-color-scheme: dark` override; there is no theme toggle
- `theme: minima` stays configured although nothing from it is used; without it GitHub Pages applies its default Primer theme
- Site icons are inline SVGs from `_includes/icon.html`; Font Awesome is only loaded for icons used inside a few older posts
- GitHub Pages compiles Sass with Ruby Sass 3.7: avoid `rgb(r g b / a)`, `min()`/`max()`, and mixed-unit math inside `clamp()`

### Special Features

- Disqus comments integration
- Social sharing links for X and Facebook
- Custom figure include for images with captions
- `/rust-doc/` only redirects old crate documentation links (`boow`, `fitrs`) to docs.rs
- Interactive projects in `/rotateme/` directory

### Post Format

Blog posts use Jekyll's standard format with YAML front matter:
```yaml
---
layout: post
title: "Post Title"
language: en
keywords: tag1 tag2 tag3
---
```

For Japanese posts, use `layout: post-ja` and `language: ja`.