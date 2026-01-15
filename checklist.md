Slice A — Draw State Machine (Backend Only)

Invariants:
- Spread is only 3 or 5
- Cannot select more than spread size
- Cannot reveal before exactly N cards selected
- Cannot complete before all selected cards are revealed
- Once phase = COMPLETE, no further mutation allowed
- Draw expires after expiresAt

Pass/Fail Tests:
- Creating a draw returns a drawId and initial state
- Selecting >N cards fails
- Reveal before select fails
- Completing twice does not regenerate meaning
- Refresh within TTL returns same state
- Refresh after TTL invalidates draw
