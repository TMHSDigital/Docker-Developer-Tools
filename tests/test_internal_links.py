import os
import re

import pytest

from conftest import REPO_ROOT


def _find_markdown_files():
    """Find all .md and .mdc files in the repo."""
    results = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "dist")]
        for f in files:
            if f.endswith(".md") or f.endswith(".mdc"):
                results.append(os.path.join(root, f))
    return sorted(results)


@pytest.mark.parametrize("filepath", _find_markdown_files())
def test_relative_links_resolve(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    base_dir = os.path.dirname(filepath)
    rel_path = os.path.relpath(filepath, REPO_ROOT)

    links = re.findall(r"\]\((\.\./[^)#]+|\.\/[^)#]+)\)", text)
    for link in links:
        clean_link = link.split("#")[0]
        target = os.path.normpath(os.path.join(base_dir, clean_link))
        assert os.path.exists(target), (
            f"{rel_path} has broken relative link: {link}"
        )
