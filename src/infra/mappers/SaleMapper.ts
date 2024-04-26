import { Mapper } from "@/core/Mapper";
import { Sale, type SaleProps } from "@/core/domain/entities/Sale";

export class SaleMapper extends Mapper<Sale> {
  public static toDomain(raw: any): Sale {
    return new Sale(raw as SaleProps);
  }

  public static toPersistence(entity: Sale): SaleProps {
    const persistenceData = {
      id: entity.id,
      uuid: entity.uuid.toString(),
      customerId: entity.customerId,
      status: entity.status,
      paymentMethod: entity.paymentMethod,
      value: entity.value,
      attempts: entity.attempts,
      gatewayTransactionId: entity.gatewayTransactionId,
      creditCardBrand: entity.creditCardBrand,
      installments: entity.installments,
      installmentsValue: entity.installmentsValue,
      digitableLine: entity.digitableLine,
      barcode: entity.barcode,
      qrcode: entity.qrcode,
      expiration: entity.expiration,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };

    return persistenceData;
  }
}
