# Bridge layer

This layer owns the narrow communication contract between React and Babylon
Lite. Start new bridge work from `Template.js`. Translate explicit commands and
confirmed snapshots; do not expose mutable game internals or place UI rendering
or gameplay systems here.
