import { SetMetadata } from "@nestjs/common";

export const RAW_RESPONSE_KEY = "raw_response";

/**
 * Marks a handler that writes the response itself (e.g. serving an HTML page).
 * The global transform interceptor skips wrapping these responses.
 */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
