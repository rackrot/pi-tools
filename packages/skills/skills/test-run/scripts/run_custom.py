#!/usr/bin/env python3
"""Run a user-supplied test command through the same parse/plan code as run_tests.py.

Exit codes match run_tests.py.
"""

from __future__ import annotations

import sys

from run_tests import main

if __name__ == "__main__":
    sys.exit(main(custom=True))
