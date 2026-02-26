import { CreatePaymentIntentUseCase } from '../create-payment-intent.usecase'
import { PaymentIntentRepository } from '../../domain/payment-intent.repository'
import { PaymentProvider } from '../../domain/payment-intent.entity'
import { PaymentStatus } from '../../../payments/domain/payment-intent-status.enum'

describe('CreatePaymentIntentUseCase', () => {
  let useCase: CreatePaymentIntentUseCase
  let repository: jest.Mocked<PaymentIntentRepository>

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByExternalReference: jest.fn(),
    }

    useCase = new CreatePaymentIntentUseCase(repository)
  })

  it('should create a payment intent with status CREATED', async () => {
    const command = {
      billId: 'bill-123',
      provider: PaymentProvider.QR_BNB,
      amount: 120.5,
    }

    const intent = await useCase.execute(command)

    expect(intent).toBeDefined()
    expect(intent.status).toBe(PaymentStatus.CREATED)
    expect(repository.save).toHaveBeenCalledTimes(1)
  })

  it('should set expiration ~10 minutes in the future', async () => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(now)

    const intent = await useCase.execute({
      billId: 'bill-123',
      provider: PaymentProvider.QR_SIMPLE,
      amount: 50,
    })

    const diffMs = intent.expiresAt.getTime() - now
    const diffMinutes = diffMs / (60 * 1000)

    expect(diffMinutes).toBeGreaterThanOrEqual(9.9)
    expect(diffMinutes).toBeLessThanOrEqual(10.1)

    jest.restoreAllMocks()
  })

  it('should persist the payment intent', async () => {
    await useCase.execute({
      billId: 'bill-999',
      provider: PaymentProvider.QR_BCP,
      amount: 200,
    })

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        billId: 'bill-999',
        amount: 200,
      }),
    )
  })

  it('should throw if amount is zero or negative', async () => {
    await expect(
      useCase.execute({
        billId: 'bill-123',
        provider: PaymentProvider.QR_BNB,
        amount: 0,
      }),
    ).rejects.toThrow('Payment amount must be greater than zero')

    await expect(
      useCase.execute({
        billId: 'bill-123',
        provider: PaymentProvider.QR_BNB,
        amount: -10,
      }),
    ).rejects.toThrow('Payment amount must be greater than zero')
  })
})