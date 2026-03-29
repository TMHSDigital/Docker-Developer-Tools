import os
import re

import pytest

from conftest import REPO_ROOT


REQUIRED_KEYS = [
    "name",
    "displayName",
    "version",
    "description",
    "skills",
    "rules",
    "logo",
]


def test_required_keys(manifest):
    for key in REQUIRED_KEYS:
        assert key in manifest, f"Missing required key: {key}"


def test_version_is_semver(manifest):
    assert re.match(
        r"^\d+\.\d+\.\d+$", manifest["version"]
    ), f"Version {manifest['version']} is not valid semver"


def test_skills_path_exists(manifest):
    skills_path = manifest.get("skills", "")
    resolved = os.path.join(REPO_ROOT, skills_path.lstrip("./"))
    assert os.path.isdir(resolved), f"Skills path does not exist: {resolved}"


def test_rules_path_exists(manifest):
    rules_path = manifest.get("rules", "")
    resolved = os.path.join(REPO_ROOT, rules_path.lstrip("./"))
    assert os.path.isdir(resolved), f"Rules path does not exist: {resolved}"


def test_logo_exists(manifest):
    logo_path = manifest.get("logo", "")
    resolved = os.path.join(REPO_ROOT, logo_path)
    assert os.path.isfile(resolved), f"Logo file does not exist: {resolved}"


def test_keywords_non_empty(manifest):
    keywords = manifest.get("keywords", [])
    assert isinstance(keywords, list), "Keywords must be a list"
    assert len(keywords) > 0, "Keywords list must not be empty"
    for kw in keywords:
        assert isinstance(kw, str), f"Keyword must be a string: {kw}"


def test_description_contains_skill_count(manifest, skill_dirs):
    desc = manifest.get("description", "")
    match = re.search(r"(\d+)\s+skills", desc)
    assert match, "Description must mention skill count"
    assert int(match.group(1)) == len(
        skill_dirs
    ), f"Description says {match.group(1)} skills but found {len(skill_dirs)}"


def test_description_contains_rule_count(manifest, rule_files):
    desc = manifest.get("description", "")
    match = re.search(r"(\d+)\s+rules", desc)
    assert match, "Description must mention rule count"
    assert int(match.group(1)) == len(
        rule_files
    ), f"Description says {match.group(1)} rules but found {len(rule_files)}"
