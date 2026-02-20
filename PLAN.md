# Weighted Voting System - Implementation Plan

## Overview
Replace the "1 wallet = 1 vote" system with weighted voting where token holders get more voting power. Vote weight is determined server-side at vote time based on the voter's on-chain token holdings.

## Architecture Decisions

### Weight Calculation: Server-side at Vote Time
- Weight is checked and stored when a vote is cast (or changed)
- This prevents gaming (can't retroactively boost old votes by buying tokens later)
- Re-checking happens on vote change (upsert), so if you acquire tokens and re-vote, you get the updated weight
- Single source of truth: the `vote_weight` column in the DB

### Rule Evaluation: Highest Match Wins
- Rules in `tokenlist.json` are evaluated, and the highest matching weight is used (not additive)
- Default weight is 1 (no tokens held)
- Future-proof: easy to add new rules (e.g., specific token = 3x)

### Token Balance Checking: On-chain via RPC
- Use viem public client to call ERC-20 `balanceOf` on the Doma chain (chain ID 97477)
- Check all tokens in the tokenlist for each vote
- Fail-open: if RPC call fails, default to weight 1 (don't block voting)

---

## Changes

### 1. New File: `src/config/tokenlist.json`
Static configuration of tokens and voting rules:
```json
{
  "defaultWeight": 1,
  "rules": [
    {
      "id": "doma-token-holder",
      "description": "Hold any Doma ecosystem token",
      "weight": 2,
      "condition": "any",
      "tokens": [
        { "address": "0x...", "name": "Wrapped Doma", "symbol": "WDOMA", "decimals": 18 }
      ],
      "minBalance": "1"
    }
  ]
}
```
- `condition: "any"` = wallet holds at least `minBalance` of ANY listed token
- Rules are evaluated top to bottom; highest matching weight wins
- `minBalance` is in human-readable units (not wei)

### 2. New File: `src/lib/voting-power.ts`
Utility module to calculate a wallet's voting power:
- `getVotingPower(address: string): Promise<{ weight: number, matchedRule: Rule | null, allRules: Rule[] }>`
- Creates a viem public client for Doma chain
- Iterates through rules, checks `balanceOf` for each token
- Returns the highest matched weight
- Handles RPC errors gracefully (returns default weight 1)

### 3. New API: `src/app/api/voting-power/route.ts`
- `GET /api/voting-power?address=0x...`
- Returns: `{ weight, matchedRule, rules }` so frontend knows current power AND how to get more
- Used by the frontend to display voting power before voting

### 4. Database: `src/lib/db.ts`
- Add `vote_weight INTEGER NOT NULL DEFAULT 1` column to `votes` table
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for safe migration of existing data

### 5. Backend: `src/app/api/votes/route.ts`
- Before inserting/upserting, call `getVotingPower(voterAddress)`
- Store the returned weight in `vote_weight`
- On vote change (upsert), recalculate weight (voter may have acquired tokens since)

### 6. Backend: Vote counting queries (3 files)
Change all vote aggregation from `COUNT`/`SUM(1)` to `SUM(vote_weight)`:

**`src/app/api/domains/listed/route.ts`:**
- `SUM(CASE WHEN v.vote_type = 'moon' THEN v.vote_weight ELSE 0 END)`
- `SUM(CASE WHEN v.vote_type = 'dead' THEN v.vote_weight ELSE 0 END)`
- `SUM(v.vote_weight)` for total

**`src/app/api/domains/[name]/route.ts`:**
- Same weighted sums
- Include `vote_weight` in the individual votes list

**`src/app/api/leaderboard/route.ts`:**
- Same weighted sums for scoring

### 7. Frontend: `src/app/page.tsx` (Home / Vote page)
- Add a `useQuery` for `/api/voting-power` when wallet is connected
- Show voting power indicator above the domain grid:
  - If weight > 1: "Your Voting Power: {weight}x" with a styled badge
  - If weight == 1: "Boost your vote" CTA explaining how to get more power
- Update `VoteCard` to accept/display vote weight context
- Vote counts already come from the API (now weighted), so the bar auto-updates

### 8. Frontend: `src/app/domain/[name]/page.tsx` (Domain detail)
- Same voting power indicator above vote buttons
- In the vote history list, show weight badge next to votes with weight > 1 (e.g., "2x")
- Update the DomainDetail interface to include `voteWeight` on individual votes

### 9. Frontend: Voting Power Info Component
- Small reusable component showing the user's voting power
- Shows current multiplier
- Expandable/tooltip with rules: "Hold any DOMA token → 2x voting power"
- For unqualified users: clear CTA on what to do to boost

---

## Corner Cases Handled

1. **Vote then acquire tokens**: Weight stays at original value. Must re-vote to update weight.
2. **RPC failure during balance check**: Fail-open, use default weight 1, log the error.
3. **Token removed from tokenlist**: Existing votes keep their stored weight. New votes recalculate.
4. **Self-voting**: Still prevented regardless of weight.
5. **Zero balance but has dust**: `minBalance` is checked in human units (1 = 1 full token, not 1 wei).
6. **Multiple qualifying rules**: Highest weight wins (not additive).
7. **Existing votes in DB**: Default weight column value is 1, so all existing votes are unaffected.
8. **Vote weight display**: Only shown when > 1 to avoid clutter.

---

## File Change Summary

| File | Action |
|------|--------|
| `src/config/tokenlist.json` | NEW - Token list and voting rules |
| `src/lib/voting-power.ts` | NEW - Voting power calculation |
| `src/app/api/voting-power/route.ts` | NEW - Voting power API endpoint |
| `src/lib/db.ts` | EDIT - Add vote_weight column migration |
| `src/app/api/votes/route.ts` | EDIT - Calculate and store weight |
| `src/app/api/domains/listed/route.ts` | EDIT - Weighted vote counts |
| `src/app/api/domains/[name]/route.ts` | EDIT - Weighted counts + weight in vote list |
| `src/app/api/leaderboard/route.ts` | EDIT - Weighted scoring |
| `src/app/page.tsx` | EDIT - Voting power UI |
| `src/app/domain/[name]/page.tsx` | EDIT - Voting power UI + weighted vote history |
