"""Deprecated import compatibility for the Graphiti HTTP sidecar.

The executable compatibility wrapper lives in ``epi_gnostic._deprecated``
until cycle-4 deletion. New code must use the Rust NativeLibraryClient in
Body/S/S3/graphiti-runtime instead.
"""

from epi_gnostic._deprecated.graphiti_service import *  # noqa: F401,F403


if __name__ == "__main__":
    main()
