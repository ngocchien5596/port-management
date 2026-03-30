# Timezone Shifting Pattern (ICT/UTC+7)

## Problem
PostgreSQL and Prisma store `DateTime` fields in UTC. However, for administrative and operational ease in Vietnam (ICT/UTC+7), the user expects to see the "numerical time" in their local timezone without the browser or server performing automatic adjustments that might lead to confusing offsets (e.g., seeing 03:00 instead of 10:00).

## Solution
We implement a **Prisma Global Extension** that manually shifts all Date objects:
1. **Writing (shiftDate)**: Add 7 hours before saving. This stores the "Local Digits" into the DB field despite the DB labeling it as UTC.
2. **Reading (unshiftDate)**: Subtract 7 hours after reading. This returns the "Local Digits" to the application.

## Implementation Details

### File: `apps/api/src/lib/prisma.ts`

```typescript
const shiftDate = (date: Date) => new Date(date.getTime() + 7 * 60 * 60 * 1000);
const unshiftDate = (date: Date) => new Date(date.getTime() - 7 * 60 * 60 * 1000);

const prisma = new PrismaClient().$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                // 1. Transform Arguments (Shift +7h)
                const newArgs = transformDates(args, shiftDate);
                
                // 2. Auto-inject Timestamps
                if (['create', 'update', 'upsert'].includes(operation)) {
                    // Logic to add current time (already shifted) to createdAt/updatedAt
                }

                const result = await query(newArgs);

                // 3. Transform Result (Unshift -7h)
                return transformDates(result, unshiftDate);
            }
        }
    }
});
```

## Critical Models to Maintain
When adding new models to `schema.prisma`, ensure they are added to the timestamp injection list in `prisma.ts`:
- **Core**: `Employee`, `Account`, `SystemConfig`
- **Domain**: `Vessel`, `Voyage`, `Berth`, `Crane`, `Product`, `Incident`, `VoyageEvent`, `VoyageProgress`, `Weather`, `Shift`, `Alert`

## Why not use standard UTC?
In many industrial and legacy environments in Vietnam, reports and logs are expected to match the wall clock exactly. This "Fake Local in UTC" approach avoids common pitfalls with container timezones, database server timezones, and heterogeneous client environments.
