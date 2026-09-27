#!/usr/bin/env bash
# Add new villa photos to the Coco Verde landing page gallery and publish.
#   1. Drop photos into landing-media/pending/ (file names must include the villa number)
#   2. Run: scripts/landing/publish_gallery.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
python3 scripts/landing/add_images.py
firebase deploy --only hosting --project casa-brolin
git add -A && git commit -qm "Landing gallery: add photos" && git push -q
echo "Gallery published and pushed to GitHub."
