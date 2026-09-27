# Spec Delta

## ADDED Requirements

### Requirement: Generation previews show Door and Key artwork

The procedural settings-map preview SHALL render each previewed Key with `golden_key.png`. Underworld civilization groups SHALL show locked orientation-specific Door art with a gold-padlock overlay, and Overworld Home groups SHALL show their locked front-Door entrance without mutating preview terrain, active-realm state, or persisted settings.

#### Scenario: Preview locked civilization and Home Doors
- **WHEN** the Underworld or Overworld preview accepts a Door or Home group
- **THEN** its Door and associated Key markers SHALL use the same locked-Door and gold-key presentation as the live world
