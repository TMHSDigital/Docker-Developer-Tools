import os
import re

import pytest

from conftest import REPO_ROOT


def test_readme_has_version_badge(manifest, readme_text):
    version = manifest["version"]
    expected = f"version-{version}"
    assert expected in readme_text, (
        f"README.md missing version badge containing '{expected}'"
    )


def test_changelog_has_current_version(manifest, changelog_text):
    version = manifest["version"]
    assert version in changelog_text, (
        f"CHANGELOG.md does not mention current version {version}"
    )


def test_readme_mentions_all_skills(skill_dirs, readme_text):
    for skill_dir in skill_dirs:
        assert skill_dir in readme_text, (
            f"README.md does not mention skill: {skill_dir}"
        )


def test_readme_mentions_all_rules(rule_files, readme_text):
    for rule_file in rule_files:
        rule_name = rule_file.replace(".mdc", "")
        assert rule_name in readme_text, (
            f"README.md does not mention rule: {rule_name}"
        )


def test_claude_mentions_skill_count(skill_dirs, claude_text):
    match = re.search(r"(\d+)\s+skills", claude_text)
    assert match, "CLAUDE.md must mention skill count"
    assert int(match.group(1)) == len(skill_dirs), (
        f"CLAUDE.md says {match.group(1)} skills but found {len(skill_dirs)}"
    )


def test_claude_mentions_rule_count(rule_files, claude_text):
    match = re.search(r"(\d+)\s+rules", claude_text)
    assert match, "CLAUDE.md must mention rule count"
    assert int(match.group(1)) == len(rule_files), (
        f"CLAUDE.md says {match.group(1)} rules but found {len(rule_files)}"
    )
