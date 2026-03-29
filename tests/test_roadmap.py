import os
import re

import pytest

from conftest import REPO_ROOT


def test_has_single_current_marker(roadmap_text):
    matches = re.findall(r"\(current\)", roadmap_text, re.IGNORECASE)
    assert len(matches) == 1, (
        f"ROADMAP.md should have exactly one '(current)' marker, found {len(matches)}"
    )


def test_current_matches_plugin_version(manifest, roadmap_text):
    version = manifest["version"]
    pattern = re.compile(rf"v?{re.escape(version)}.*\(current\)", re.IGNORECASE)
    assert pattern.search(roadmap_text), (
        f"ROADMAP.md '(current)' marker does not match plugin version {version}"
    )


def test_completed_section_no_unchecked(roadmap_text):
    completed_match = re.search(
        r"##\s+Completed\s*\n(.*?)(?=\n##|\Z)", roadmap_text, re.DOTALL
    )
    if completed_match:
        section = completed_match.group(1)
        unchecked = re.findall(r"- \[ \]", section)
        assert len(unchecked) == 0, (
            f"ROADMAP.md Completed section has {len(unchecked)} unchecked items"
        )


def test_no_duplicate_version_entries(roadmap_text):
    versions = re.findall(r"^##\s+(v\d+\.\d+\.\d+)", roadmap_text, re.MULTILINE)
    seen = set()
    for v in versions:
        assert v not in seen, f"ROADMAP.md has duplicate version entry: {v}"
        seen.add(v)
