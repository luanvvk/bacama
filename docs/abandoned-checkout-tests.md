# Abandoned checkout test plan

Non-COD orders are created as `pending` (`createOrder`). Stock is only decremented when the order moves to `paid` (`markOrderPaid`), so a `pending` order holds no stock. `GET /api/cron/expire-pending-orders` (daily, bearer `CRON_SECRET`) sets `pending` orders older than 24 h (`PENDING_ORDER_TTL_MS`) to `failed`.

Test names below are Jest tests; `manual` means checked by hand against a deployment.

## Abandoned checkout

| Given                                          | When                        | Expected order status   | Expected stock | What the customer sees                | Test                                                                    |
| ---------------------------------------------- | --------------------------- | ----------------------- | -------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| Pending order created 25 h ago, never paid     | The sweep runs              | `failed`                | Unchanged      | Order tracking shows the failed state | `expire-pending-orders.test.ts` › fails only pending orders older than… |
| Pending order created 1 h ago                  | The sweep runs              | `pending`               | Unchanged      | Pay screen keeps polling              | `expire-pending-orders.test.ts` › honours a custom ttl                  |
| COD (`awaiting_cod`), `paid` or later statuses | The sweep runs              | Unchanged               | Unchanged      | Unchanged                             | `expire-pending-orders.test.ts` › never writes anything but status…     |
| The sweep already ran                          | The sweep runs again        | `failed` stays `failed` | Unchanged      | Unchanged                             | `expire-pending-orders.test.ts` › returns 0 on a second run             |
| Missing, wrong or unset `CRON_SECRET`          | The cron route is requested | Unchanged               | Unchanged      | Nothing (401)                         | `route.test.ts` › returns 401 … (three cases)                           |

## Webhook delay

| Given                                         | When                          | Expected order status                        | Expected stock                             | What the customer sees                             | Test                                                                 |
| --------------------------------------------- | ----------------------------- | -------------------------------------------- | ------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------- |
| Pending order, payment taken, webhook delayed | Webhook arrives within 24 h   | `paid`                                       | Decremented once per product line          | Pay screen poll flips to success                   | `mark-order-paid.test.ts` › decrements each product line once…       |
| Webhook delivered twice                       | Second delivery arrives       | `paid`                                       | Not decremented again                      | Unchanged                                          | `mark-order-paid.test.ts` › does not decrement on replay             |
| Order already `failed` by the sweep           | A `paid` webhook arrives late | `failed` (conditional update matches 0 rows) | Unchanged                                  | Order still shows failed; payment is not reflected | `manual` (see Open decisions)                                        |
| Payment taken but stock now short             | `paid` webhook arrives        | `paid`                                       | Short line not decremented, warning logged | Order shows paid                                   | `mark-order-paid.test.ts` › keeps the order paid when stock is short |

## Card expiry and failed payment

| Given                                | When                       | Expected order status                              | Expected stock | What the customer sees       | Test                                  |
| ------------------------------------ | -------------------------- | -------------------------------------------------- | -------------- | ---------------------------- | ------------------------------------- |
| Pending order, card declined/expired | `failed` webhook arrives   | `failed`                                           | Unchanged      | Order shows the failed state | `manual` (service: `markOrderFailed`) |
| Order already `paid`                 | A `failed` webhook arrives | `paid` (conditional update only matches `pending`) | Unchanged      | Order stays paid             | `manual`                              |
| Webhook for an unknown provider ref  | Any webhook arrives        | No order changes (404 from the route)              | Unchanged      | Nothing                      | `manual`                              |

## Open decisions

- **Late webhook after expiry.** A `paid` webhook for an order the sweep already marked `failed` currently leaves it `failed` and answers `{ received: true, alreadyProcessed: true }`. Nothing is logged, so the customer was charged with no order and no record flags it for a manual refund. Decide whether to log/alert such cases, or to revive the order to `paid` when stock allows.
- **TTL.** 24 h suits Vercel Hobby's daily cron. Tighten it, and the schedule, after the Pro upgrade.
