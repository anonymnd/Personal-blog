---
title: What is a URL (in plain language)
description: The pieces of a web address—scheme, host, path, and query—and why they matter when you learn how the web works.
pubDate: 2026-04-12
translationKey: what-is-a-url
locale: en
tags:
  - web
  - fundamentals
---

A **URL** (Uniform Resource Locator) is the address you type or click to reach a resource on the internet—usually a web page or an API.

## Example

```
https://example.com/docs/search?q=astro&lang=en
```

## Main parts

| Part       | In the example     | Role                                                                    |
| ---------- | ------------------ | ----------------------------------------------------------------------- |
| **Scheme** | `https://`         | Tells the browser *how* to talk to the server (here, encrypted HTTP).   |
| **Host**   | `example.com`      | Identifies the server (via DNS to an IP address).                       |
| **Path**   | `/docs/search`     | Which document or route on that server you want.                        |
| **Query**  | `?q=astro&lang=en` | Extra parameters, often from forms or filters.                          |

You do not need every RFC detail at first. Recognizing these pieces is enough when you read documentation, debug redirects, or configure hosting.
