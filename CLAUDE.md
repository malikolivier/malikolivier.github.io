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
- `_sass/`: Sass stylesheets, primarily extending the Minima theme
- `about/`: Static about pages

### Bilingual Support

The site supports English and Japanese content:
- English content uses standard layouts (`default.html`, `post.html`, etc.)
- Japanese content uses `-ja` suffixed layouts and is served from `/ja/` path
- Language configuration in `_config.yml` defines both languages
- Content specifies language in front matter: `language: en` or `language: ja`

### Styling

- Based on the Minima Jekyll theme
- Custom styles in `css/main.scss` override theme defaults
- Additional CSS frameworks: Bootstrap, Font Awesome
- Custom table styles in `_sass/table.scss`

### Special Features

- Disqus comments integration
- Social sharing buttons for Twitter, Facebook, Google+
- Google Analytics tracking
- Custom figure include for images with captions
- Rust documentation hosted in `/rust-doc/` directory
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