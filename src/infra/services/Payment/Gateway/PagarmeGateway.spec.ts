import { SaleConstants } from "@/core/domain/entities/Sale";
import { type PaymentRequest } from "@/core/services/Payment/PaymentStrategy";
import { type AxiosStatic } from "axios";
import { describe, expect, it, vi } from "vitest";
import { PagarmeGateway } from "./PagarmeGateway";

describe("PagarmeGateway", () => {
  it("should process a credit card payment successfully", async () => {
    const mockResponse = {
      data: {
        id: "123",
        status: "paid",
        charges: [
          {
            last_transaction: {
              payment_method: "credit_card",
              card: {
                brand: "visa",
              },
            },
          },
        ],
      },
    };

    const axios = vi.mocked<Partial<AxiosStatic>>({
      create: vi.fn().mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
      }),
    }) as AxiosStatic;

    const sut = new PagarmeGateway("any_api_key", axios);

    const paymentRequest: PaymentRequest = {
      customer: { name: "John Doe", document: "12345678901", email: "john@example.com", phone: "5511987654321" },
      products: [{ id: "1", name: "Product 1", price: 100 }],
      paymentMethod: SaleConstants.PaymentMethod.CREDIT_CARD,
      amount: 100,
      creditCard: { number: "4111111111111111", name: "John Doe", expiration: "12/24", cvv: "123" },
    };

    const response = await sut.processPayment(paymentRequest);

    expect(response.status).toBe("APPROVED");
    expect(response.creditCardBrand).toBe("visa");
  });

  it("should process a bank slip payment successfully", async () => {
    const mockResponse = {
      data: {
        id: "124",
        status: "pending",
        charges: [
          {
            payment_method: "boleto",
            last_transaction: {
              due_at: "2024-01-01T00:00:00Z",
            },
          },
        ],
      },
    };

    const axios = vi.mocked<Partial<AxiosStatic>>({
      create: vi.fn().mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
      }),
    }) as AxiosStatic;

    const sut = new PagarmeGateway("any_api_key", axios);

    const paymentRequest: PaymentRequest = {
      customer: { name: "Jane Doe", document: "12345678901", email: "jane@example.com", phone: "5511987654321" },
      products: [{ id: "2", name: "Product 2", price: 200 }],
      paymentMethod: SaleConstants.PaymentMethod.BANK_SLIP,
      amount: 200,
    };

    const response = await sut.processPayment(paymentRequest);

    expect(response.status).toBe("PENDING");
    expect(response.expiration).toEqual(new Date("2024-01-01"));
  });

  it("should process a PIX payment successfully", async () => {
    const mockResponse = {
      data: {
        id: "125",
        status: "pending",
        charges: [
          {
            payment_method: "pix",
            last_transaction: {
              expires_at: "2024-01-01T01:00:00Z",
            },
          },
        ],
      },
    };

    const axios = vi.mocked<Partial<AxiosStatic>>({
      create: vi.fn().mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse),
      }),
    }) as AxiosStatic;

    const sut = new PagarmeGateway("any_api_key", axios);

    const paymentRequest: PaymentRequest = {
      customer: { name: "Jim Doe", document: "12345678901", email: "jim@example.com", phone: "5511987654321" },
      products: [{ id: "3", name: "Product 3", price: 300 }],
      paymentMethod: SaleConstants.PaymentMethod.PIX,
      amount: 300,
    };

    const response = await sut.processPayment(paymentRequest);

    expect(response.status).toBe("PENDING");
    expect(response.expiration).toEqual(new Date("2024-01-01T01:00:00Z"));
  });
});
