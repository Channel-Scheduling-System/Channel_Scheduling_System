import { Service } from "../../../shared/models/entities/service.schema";

export interface ServiceFormModalData {
  service?: Service;
  isEdit?: boolean;
}