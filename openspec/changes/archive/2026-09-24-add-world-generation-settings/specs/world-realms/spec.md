# Spec Delta

## ADDED Requirements

### Requirement: Fixed realm count in World Settings
World Settings SHALL display `Realm Count: 2` as non-interactive information. This value SHALL represent exactly the generated Overground and Underground realms and SHALL not offer a realm-count selection or permit a generated world with a different realm membership.

#### Scenario: Display the fixed generated realm count
- **WHEN** a developer opens the World Generation tab
- **THEN** World Settings displays `Realm Count: 2` without an interactive control

#### Scenario: Size selection retains both named realms
- **WHEN** a developer confirms any supported World Size
- **THEN** the generated world contains exactly Overground and Underground
