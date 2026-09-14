---
title: A sample post (replace me)
date: 2026-09-14
description: Shows what a post can contain. Delete this file once you've written your first real one.
tags: [meta]
---

Every post is a Markdown file in `src/content/writing/`. The part between the `---` lines at the top sets the title, date, description, and tags. Set `draft: true` to hide a post while you work on it.

## Math

Inline math like $\hat{a}\lvert\alpha\rangle = \alpha\lvert\alpha\rangle$ works, and so do display equations:

$$
\lvert\alpha\rangle = e^{-\lvert\alpha\rvert^2/2} \sum_{n=0}^{\infty} \frac{\alpha^n}{\sqrt{n!}} \lvert n\rangle
$$

## Code

```python
import numpy as np

def mean_photon_number(alpha):
    return np.abs(alpha) ** 2
```

## Images

Put an image next to the post and reference it with a relative path: `![Description](./my-photo.jpg)`.

> Quotes look like this.
