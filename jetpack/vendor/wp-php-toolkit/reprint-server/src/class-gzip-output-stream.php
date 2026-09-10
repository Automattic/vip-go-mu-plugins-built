<?php

// Declared here rather than in export.php so it can live in this package's
// namespace. export.php is a global-namespace file of endpoint functions that
// callers reach by unqualified name.

namespace WordPress\Reprint\Server;

/**
 * Incremental response writer.
 *
 * PHP 7.0 and newer can gzip each bounded write without buffering the whole
 * response. PHP 5.6 lacks the incremental zlib API, so it sends the same
 * multipart stream without a Content-Encoding header.
 *
 * PHP-side gzip also gives outbound WAF rules that do not decode
 * Content-Encoding the encoded byte stream; server-level compression can run
 * after those rules inspect the body.
 */
class GzipOutputStream
{
    private $deflate_ctx;
    /** @var bool */
    private $enabled = true;

    public function __construct(bool $enabled = true)
    {
        $this->enabled = $enabled
            && function_exists('deflate_init')
            && function_exists('deflate_add');
        if ($this->enabled) {
            $this->deflate_ctx = deflate_init(ZLIB_ENCODING_GZIP, ["level" => 6]);
            if ($this->deflate_ctx === false) {
                throw new \RuntimeException(
                    "deflate_init() failed — zlib may be misconfigured"
                );
            }
            if (!headers_sent()) {
                @header("Content-Encoding: gzip");
            }
        }
    }

    /**
     * Writes data without forcing a sync point.
     *
     * Uses ZLIB_NO_FLUSH so the compressor can build back-references across
     * multiple write() calls, producing significantly better compression
     * ratios than ZLIB_SYNC_FLUSH on every call.  Data still flows out
     * whenever zlib's internal buffer fills — the decompressor on the other
     * end will decompress incrementally.
     *
     * Call sync() after each complete multipart part to guarantee the client
     * can decompress everything emitted so far.
     */
    public function write(string $data): void
    {
        if (!$this->enabled) {
            echo $data;
            return;
        }
        $compressed = deflate_add(
            $this->deflate_ctx,
            $data,
            ZLIB_NO_FLUSH
        );
        if ($compressed === false) {
            throw new \RuntimeException("deflate_add() failed during gzip write");
        }
        if ($compressed !== "") {
            echo $compressed;
        }
    }

    /**
     * Forces a sync flush so the client can decompress all data written so far.
     */
    public function sync(): void
    {
        if (!$this->enabled) {
            flush();
            return;
        }
        $compressed = deflate_add(
            $this->deflate_ctx,
            "",
            ZLIB_SYNC_FLUSH
        );
        if ($compressed === false) {
            throw new \RuntimeException("deflate_add() failed during gzip sync");
        }
        if ($compressed !== "") {
            echo $compressed;
        }
        flush();
    }

    /**
     * Finalizes the gzip stream with ZLIB_FINISH.
     */
    public function finish(): void
    {
        if (!$this->enabled) {
            flush();
            return;
        }
        $final = deflate_add($this->deflate_ctx, "", ZLIB_FINISH);
        if ($final === false) {
            throw new \RuntimeException("deflate_add() failed during gzip finish");
        }
        if ($final !== "") {
            echo $final;
        }
        flush();
    }
}
