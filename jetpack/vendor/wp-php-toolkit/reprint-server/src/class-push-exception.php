<?php

/**
 * Reports a classified push-session failure.
 *
 * PHP reserves Throwable::getCode() for an integer. Push and commit failures use
 * stable, descriptive strings because the endpoint returns the same value in
 * its JSON `reason` field. Keeping that classification in a separate property
 * also prevents an unrelated RuntimeException with a coincidentally equal
 * native code from being presented as a recoverable protocol condition.
 *
 * Only failures which have a deliberate push or commit classification use this
 * exception. An ordinary RuntimeException remains unclassified and follows the
 * endpoint's `invalid_request` handling rather than leaking an accidental code.
 */
final class Site_Export_Push_Exception extends RuntimeException {

    /**
     * Stable machine-readable classification selected by the throwing class.
     *
     * This is distinct from the human-readable exception message. Endpoint
     * code uses it to select an HTTP status and copies it unchanged into the
     * authenticated response's `reason` field.
     *
     * @var string
     */
    private $error_code;

    /**
     * Structured observations which describe the failure.
     *
     * These values are deliberately separate from the message so commit can
     * persist non-recoverable failure details and callers can inspect them
     * without parsing prose. An HTTP endpoint must choose its public fields
     * explicitly; exception context is not a response schema.
     *
     * @var array<string,mixed>
     */
    private $context;

    /**
     * Creates a push or commit failure with separate machine and human context.
     *
     * The machine-readable value comes first so a throw site names its recovery
     * class before giving instance-specific detail. It is retrieved with
     * get_error_code(), never Throwable::getCode().
     *
     * @param string $error_code Stable machine-readable push or commit reason.
     * @param string $message Human-readable statement of the violated condition.
     * @param array<string,mixed> $context Structured observations. Common keys
     *     are operation, path_b64, conflict_path_b64,
     *     expected_docroot_types, observed_docroot_identity, work_device,
     *     docroot_device, work_type, blocking_push_session_id, and
     *     observed_request_body_bytes.
     */
    public function __construct(string $error_code, string $message, array $context = []) {
        parent::__construct($message);
        $this->error_code = $error_code;
        $this->context = $context;
    }

    /**
     * Returns the stable reason used to classify this push or commit failure.
     *
     * @return string Machine-readable error code suitable for a JSON `reason`.
     */
    public function get_error_code(): string {
        return $this->error_code;
    }

    /**
     * Returns structured observations recorded by the throw site.
     *
     * The array contains only values supplied by push or commit throw sites. It
     * may be empty for simple classified failures, but when present it names
     * the exact observed condition that made the request non-recoverable or
     * recoverable.
     *
     * @return array<string,mixed> Structured observations. Common keys are
     *     operation, path_b64, conflict_path_b64, expected_docroot_types,
     *     observed_docroot_identity, work_device, docroot_device, work_type,
     *     blocking_push_session_id, and observed_request_body_bytes.
     */
    public function get_context(): array {
        return $this->context;
    }
}
