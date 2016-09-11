---
layout: post
title:  "Trying out Jekyll"
date:   2016-09-09 11:33:34 +0900
language: en
keywords: programming try jekyll
redirect_from:
    - /try/jekyll/2016/09/09/trying-out-jekyll.html
---

## Making a simple to maintain blog

I wanted to make a simple to maintain blog. Most people would thing of WordPress,
but even though WordPress can be great, I did not want to deal with a database, etc.
Moreover, writing posts on WordPress has always been confusing for me: I was never
satisfied with the visual mode, because something weird would always happen to the layout,
so I was always writing in text mode, usually copy-pasting my code from my favorite
text editor into WordPress.

I wanted to write a post using MarkDown or Jade, or something like that, so that I can
just focus on the content without repeating myself.
Only plain text files, no database, no deployment, no moving parts, no code execution.
HTML would be generated from a bunch of text files easy to edit.
I thought a second about creating my own framework to do that, however it soon
occurred to me that I was a fool. In such a broad community, someone else must have
had the exact same idea before me. And that someone most surely made that idea
a reality.

## Jekyll

That's when I found [Jekyll](https://jekyllrb.com/). Behind its dubious name
(who would trust Dr. Jekyll?), it answered all my need.
The documentation was great, everything is simple to use and I was able to get started
in a flash.

Deployment to [GitHub Pages](https://pages.github.com/) is a bless. Having one's
own website has never been easier and cheaper (it's basically free).

Jekyll's [modularity](https://jekyllrb.com/docs/plugins/), its support for
partials and for storing [data](https://jekyllrb.com/docs/datafiles/) in
human-readable YAML format has finished convinced me that it *was* what I
precisely needed.

All in all, it took me less than an hour to download and install Jekyll,
start from a template and deploy my site with the draft of my first article.
It basically just works.

Jekyll is so hassle-free and blissful that you will get addicted to it.
Beware.
