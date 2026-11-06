"""
ReturnProof Backend Package.
"""
import sys
from pathlib import Path

# Ensure the repository root is in sys.path so 'backend.app' imports always resolve
_repo_root = str(Path(__file__).resolve().parent.parent.parent)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

__version__ = "1.0.0"
