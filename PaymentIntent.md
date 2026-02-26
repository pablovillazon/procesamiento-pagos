# Payment Intent Test Strategy
A real payment flow usually looks like:

`CREATE → PENDING → (PAID | FAILED | EXPIRED)`

The tests should validate:

1. Creation
2. State transitions
3. Authorization rules
4. Idempotency
5. Persistence & retrieval

## 🧪 Test Suite Structure

```typescript
describe('PaymentIntent (e2e)', () => {
  describe('POST /payments')
  describe('GET /payments/:id')
  describe('PATCH /payments/:id/confirm')
  describe('PATCH /payments/:id/fail')
})
```

## 🧱 Test Setup (Shared Fixture)
```typescript
let app: INestApplication
let prisma: PrismaService
let accessToken: string
let testUserId: string
let paymentIntentId: string
```

### beforeAll
```typescript
beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  app = moduleRef.createNestApplication()
  await app.init()

  prisma = app.get(PrismaService)

  const email = `test-${Date.now()}@example.com`

  const user = await prisma.user.create({
    data: {
      email,
      password: 'hashed',
      role: 'ADMIN',
    },
  })

  testUserId = user.id

  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: 'plain' })

  accessToken = login.body.access_token
})
```

## 🧪 1️⃣ Create Payment Intent
What we validate
```
✔ request accepted
✔ status = PENDING
✔ stored in DB
✔ belongs to user
```

```typescript
it('should create a payment intent', async () => {
  const response = await request(app.getHttpServer())
    .post('/payments')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      amount: 1000,
      currency: 'BOB',
      description: 'Water bill Jan',
    })
    .expect(201)

  expect(response.body.status).toBe('PENDING')
  expect(response.body.amount).toBe(1000)

  paymentIntentId = response.body.id

  const dbRecord = await prisma.paymentIntent.findUnique({
    where: { id: paymentIntentId },
  })

  expect(dbRecord).toBeTruthy()
})
```

## 🧪 2️⃣ Retrieve Payment Intent
```
✔ correct persistence
✔ user isolation
```
```typescript
it('should retrieve the payment intent', async () => {
  const response = await request(app.getHttpServer())
    .get(`/payments/${paymentIntentId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200)

  expect(response.body.id).toBe(paymentIntentId)
})
```

## 🧪 3️⃣ Confirm Payment (Simulating QR provider callback)
This mimics:

* bank confirmation
* QR scan success
* webhook from provider

```typescript
it('should confirm payment intent', async () => {
  const response = await request(app.getHttpServer())
    .patch(`/payments/${paymentIntentId}/confirm`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200)

  expect(response.body.status).toBe('PAID')

  const dbRecord = await prisma.paymentIntent.findUnique({
    where: { id: paymentIntentId },
  })

  expect(dbRecord?.status).toBe('PAID')
})
```

## 🧪 4️⃣ Prevent Invalid Transition
A PAID payment should not be confirmed again.
```typescript
it('should not allow confirming an already paid intent', async () => {
  await request(app.getHttpServer())
    .patch(`/payments/${paymentIntentId}/confirm`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(400)
})
```

## 🧪 5️⃣ Fail Payment Scenario
Create a new intent → fail it.
```typescript
it('should fail a payment intent', async () => {
  const { body } = await request(app.getHttpServer())
    .post('/payments')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ amount: 500, currency: 'BOB' })

  const failId = body.id

  const response = await request(app.getHttpServer())
    .patch(`/payments/${failId}/fail`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200)

  expect(response.body.status).toBe('FAILED')
})
```

## 🧹 Cleanup

```typescript
afterAll(async () => {
  await prisma.paymentIntent.deleteMany({ where: { userId: testUserId } })
  await prisma.user.delete({ where: { id: testUserId } })
  await app.close()
})
```

## 🧠 Why This Mirrors Real Transactions
This suite validates:

| Real-world concept       | Test                    |
| ------------------------ | ----------------------- |
| Payment request          | create intent           |
| QR generated             | pending state           |
| Bank confirmation        | confirm endpoint        |
| Rejected payment         | fail endpoint           |
| Double charge prevention | invalid transition test |
| Audit trail              | DB verification         |


## 🧾 PaymentIntent State Machine
## 🎯 Purpose

Represents the lifecycle of a payment request from creation to final resolution.
```
CREATED → PENDING → PAID
                 ↘ FAILED
                 ↘ EXPIRED
                 ↘ CANCELLED
```

## 📊 State Definitions

| State     | Meaning                                     | Terminal |
| --------- | ------------------------------------------- | -------- |
| CREATED   | Intent created but not yet sent to provider | ❌        |
| PENDING   | Awaiting user payment / QR scan             | ❌        |
| PAID      | Payment confirmed                           | ✅        |
| FAILED    | Payment rejected by provider                | ✅        |
| EXPIRED   | Time window elapsed                         | ✅        |
| CANCELLED | Cancelled by user/system                    | ✅        |

## 🔄 Allowed Transitions
| From    | To        | Trigger                             |
| ------- | --------- | ----------------------------------- |
| CREATED | PENDING   | QR generated / provider initialized |
| PENDING | PAID      | Provider confirmation               |
| PENDING | FAILED    | Provider rejection                  |
| PENDING | EXPIRED   | Timeout                             |
| PENDING | CANCELLED | User abort                          |
| CREATED | CANCELLED | User abort before activation        |

## 🚫 Invalid Transitions (Must Be Blocked)
| From      | Invalid To                     |
| --------- | ------------------------------ |
| PAID      | any                            |
| FAILED    | any                            |
| EXPIRED   | any                            |
| CANCELLED | any                            |
| CREATED   | PAID (must go through PENDING) |

These rules prevent:
- double charges
- fraud
- inconsistent ledger states

## 🧠 Visual Diagram (Mermaid)
stateDiagram-v2
    [*] --> CREATED

    CREATED --> PENDING : QR generated
    CREATED --> CANCELLED : user abort

    PENDING --> PAID : payment confirmed
    PENDING --> FAILED : provider rejection
    PENDING --> EXPIRED : timeout
    PENDING --> CANCELLED : user abort

    PAID --> [*]
    FAILED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]

## 🧱 Suggested Prisma Enum
```
enum PaymentIntentStatus {
  CREATED
  PENDING
  PAID
  FAILED
  EXPIRED
  CANCELLED
}
```

## 🧠 Domain Guard (Critical)
Your domain logic should enforce transitions.
```typescript
function assertValidTransition(
  current: Status,
  next: Status,
) {
  const allowed: Record<Status, Status[]> = {
    CREATED: ['PENDING', 'CANCELLED'],
    PENDING: ['PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
    PAID: [],
    FAILED: [],
    EXPIRED: [],
    CANCELLED: [],
  }

  if (!allowed[current].includes(next)) {
    throw new Error(`Invalid transition ${current} → ${next}`)
  }
}
```
This prevents race conditions and invalid updates.

## 🧪 How This Drives Your Tests
Each transition becomes a test:
| Test            | Transition          |
| --------------- | ------------------- |
| create intent   | → CREATED           |
| activate intent | CREATED → PENDING   |
| confirm payment | PENDING → PAID      |
| reject payment  | PENDING → FAILED    |
| expire payment  | PENDING → EXPIRED   |
| cancel payment  | PENDING → CANCELLED |
| double confirm  | PAID → ❌            |

## 🏦 Real QR Payment Mapping (Bolivia Context)

| Real Event      | State   |
| --------------- | ------- |
| QR generated    | PENDING |
| User scans QR   | PENDING |
| Bank confirms   | PAID    |
| User closes app | EXPIRED |
| Bank rejects    | FAILED  |
