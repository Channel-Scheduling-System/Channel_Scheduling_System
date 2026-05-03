import { ResetCodeRepository } from "./reset-code.repository.js";
import { ResetCodeService } from "./reset-code.service.js";

const resetCodeRepo = new ResetCodeRepository();
const resetCodeService = new ResetCodeService(resetCodeRepo);

export { resetCodeService };