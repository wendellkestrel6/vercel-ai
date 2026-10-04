# Integration contract

Applications send JSON over HTTPS to `https://api.argolink.io`. Authentication is a Bearer key in `ARGOLINK_API_KEY`. Keep the base URL configurable, set connect/read timeouts, and classify errors by HTTP status plus the returned error code.

Video requests use the asynchronous submit → poll → content lifecycle. Image requests use the documented generation or edit route and return image data in the documented response shape. Keep model-specific validation in one module and test it without a network key.