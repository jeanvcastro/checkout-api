import { SaleConstants } from "@/core/domain/entities/Sale";
import { type PaymentGateway } from "@/core/services/Payment/PaymentGateway";
import { type PaymentRequest, type PaymentResponse } from "@/core/services/Payment/PaymentStrategy";
import { type AxiosInstance, type AxiosStatic } from "axios";
import dayjs from "dayjs";

export class PagarmeGateway implements PaymentGateway {
  private readonly api: AxiosInstance;

  constructor(apiKey: string, axios: AxiosStatic) {
    this.api = axios.create({
      baseURL: "https://api.pagar.me/core/v5",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${apiKey}:`).toString("base64"),
      },
    });
  }

  private parsePayload(request: PaymentRequest) {
    const documentType = request.customer.document.length === 11 ? "CPF" : "CNPJ";
    const phone = request.customer.phone.replace(/\D/g, "");
    const countryCode = phone.substring(0, 2);
    const areaCode = phone.substring(2, 4);
    const phoneNumber = phone.substring(4);
    const paymentMethod =
      request.paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD
        ? "credit_card"
        : request.paymentMethod === SaleConstants.PaymentMethod.PIX
          ? "pix"
          : "boleto";

    const payload: Record<string, any> = {
      customer: {
        phones: { mobile_phone: { country_code: countryCode, area_code: areaCode, number: phoneNumber } },
        name: request.customer.name,
        type: "individual",
        email: request.customer.email,
        document: request.customer.document,
        document_type: documentType,
      },
      payments: [
        {
          payment_method: paymentMethod,
          amount: request.amount,
        },
      ],
      items: request.products.map((product) => ({
        amount: product.price,
        description: product.name,
        quantity: 1,
        code: product.id,
      })),
    };

    if (request.paymentMethod === SaleConstants.PaymentMethod.CREDIT_CARD) {
      payload.payments[0].credit_card = {
        card: {
          number: request.creditCard?.number,
          holder_name: request.creditCard?.name,
          exp_month: request.creditCard?.expiration.split("/")[0],
          exp_year: request.creditCard?.expiration.split("/")[1],
          cvv: request.creditCard?.cvv,
        },
        operation_type: "auth_and_capture",
        installments: request.installments,
        statement_descriptor: "DEVBRODER",
      };
    }

    if (request.paymentMethod === SaleConstants.PaymentMethod.BANK_SLIP) {
      payload.payments[0].boleto = { due_at: request.expiration?.toISOString() };
    }

    if (request.paymentMethod === SaleConstants.PaymentMethod.PIX) {
      payload.payments[0].Pix = {
        expires_in: request.expiration ? Math.floor(request.expiration.getTime() / 1000) : 3600,
      };
    }

    return payload;
  }

  private parseResponse(response: Record<string, any>): PaymentResponse {
    const status =
      response.status === "paid"
        ? SaleConstants.Status.APPROVED
        : response.status === "pending"
          ? SaleConstants.Status.PENDING
          : SaleConstants.Status.REFUSED;

    const paymentMethod = response.charges[0]?.payment_method ?? null;

    let expiration = null;

    if (paymentMethod === "boleto") {
      const respondeDueDate = response.charges[0]?.last_transaction?.due_at;
      expiration = typeof respondeDueDate === "string" ? dayjs(respondeDueDate).toDate() : null;
    }

    if (paymentMethod === "pix") {
      const respondeDueDate = response.charges[0]?.last_transaction?.expires_at;
      expiration = typeof respondeDueDate === "string" ? dayjs(respondeDueDate).toDate() : null;
    }

    const responseBrand = response.charges[0]?.last_transaction?.card?.brand ?? null;
    const creditCardBrand = typeof responseBrand === "string" ? responseBrand.toLowerCase() : null;

    const digitableLine = response.charges[0]?.last_transaction?.line ?? null;
    const barcode = response.charges[0]?.last_transaction?.barcode ?? null;
    const qrcode = response.charges[0]?.last_transaction?.qr_code_url ?? null;

    return {
      status,
      gatewayTransactionId: response.id,
      creditCardBrand,
      digitableLine,
      barcode,
      qrcode,
      expiration,
    };
  }

  async processPayment(request: PaymentRequest) {
    const payload = this.parsePayload(request);
    const { data } = await this.api.post("/orders", payload);
    return this.parseResponse(data as Record<string, any>);
  }
}
