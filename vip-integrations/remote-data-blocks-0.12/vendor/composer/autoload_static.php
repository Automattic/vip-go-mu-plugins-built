<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitd18f0393069a3820d9b0f04447b0236c
{
    public static $files = array (
        '7b11c4dc42b3b3023073cb14e519683c' => __DIR__ . '/..' . '/ralouphie/getallheaders/src/getallheaders.php',
        '6e3fae29631ef280660b3cdad06f25a8' => __DIR__ . '/..' . '/symfony/deprecation-contracts/function.php',
        '37a3dc5111fe8f707ab4c132ef1dbc62' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/functions_include.php',
        '95364f89c89964d20229324a908bf4b4' => __DIR__ . '/../..' . '/functions.php',
        '615e22ffdbe2d85ca710fffa4a44d7d9' => __DIR__ . '/../..' . '/inc/Integrations/constants.php',
    );

    public static $prefixLengthsPsr4 = array (
        'U' => 
        array (
            'Utilities\\' => 10,
        ),
        'S' => 
        array (
            'Symfony\\Component\\VarExporter\\' => 30,
        ),
        'R' => 
        array (
            'RemoteDataBlocks\\' => 17,
        ),
        'P' => 
        array (
            'Psr\\Log\\' => 8,
            'Psr\\Http\\Message\\' => 17,
            'Psr\\Http\\Client\\' => 16,
        ),
        'K' => 
        array (
            'Kevinrob\\GuzzleCache\\' => 21,
        ),
        'J' => 
        array (
            'JsonPath\\' => 9,
        ),
        'G' => 
        array (
            'GuzzleHttp\\Psr7\\' => 16,
            'GuzzleHttp\\Promise\\' => 19,
            'GuzzleHttp\\' => 11,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Utilities\\' => 
        array (
            0 => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/Utilities',
        ),
        'Symfony\\Component\\VarExporter\\' => 
        array (
            0 => __DIR__ . '/..' . '/symfony/var-exporter',
        ),
        'RemoteDataBlocks\\' => 
        array (
            0 => __DIR__ . '/../..' . '/inc',
        ),
        'Psr\\Log\\' => 
        array (
            0 => __DIR__ . '/..' . '/psr/log/src',
        ),
        'Psr\\Http\\Message\\' => 
        array (
            0 => __DIR__ . '/..' . '/psr/http-factory/src',
            1 => __DIR__ . '/..' . '/psr/http-message/src',
        ),
        'Psr\\Http\\Client\\' => 
        array (
            0 => __DIR__ . '/..' . '/psr/http-client/src',
        ),
        'Kevinrob\\GuzzleCache\\' => 
        array (
            0 => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src',
        ),
        'JsonPath\\' => 
        array (
            0 => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath',
        ),
        'GuzzleHttp\\Psr7\\' => 
        array (
            0 => __DIR__ . '/..' . '/guzzlehttp/psr7/src',
        ),
        'GuzzleHttp\\Promise\\' => 
        array (
            0 => __DIR__ . '/..' . '/guzzlehttp/promises/src',
        ),
        'GuzzleHttp\\' => 
        array (
            0 => __DIR__ . '/..' . '/guzzlehttp/guzzle/src',
        ),
    );

    public static $prefixesPsr0 = array (
        'P' => 
        array (
            'Parsedown' => 
            array (
                0 => __DIR__ . '/..' . '/erusev/parsedown',
            ),
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
        'GuzzleHttp\\BodySummarizer' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/BodySummarizer.php',
        'GuzzleHttp\\BodySummarizerInterface' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/BodySummarizerInterface.php',
        'GuzzleHttp\\Client' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Client.php',
        'GuzzleHttp\\ClientInterface' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/ClientInterface.php',
        'GuzzleHttp\\ClientTrait' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/ClientTrait.php',
        'GuzzleHttp\\Cookie\\CookieJar' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Cookie/CookieJar.php',
        'GuzzleHttp\\Cookie\\CookieJarInterface' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Cookie/CookieJarInterface.php',
        'GuzzleHttp\\Cookie\\FileCookieJar' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Cookie/FileCookieJar.php',
        'GuzzleHttp\\Cookie\\SessionCookieJar' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Cookie/SessionCookieJar.php',
        'GuzzleHttp\\Cookie\\SetCookie' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Cookie/SetCookie.php',
        'GuzzleHttp\\Exception\\BadResponseException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/BadResponseException.php',
        'GuzzleHttp\\Exception\\ClientException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/ClientException.php',
        'GuzzleHttp\\Exception\\ConnectException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/ConnectException.php',
        'GuzzleHttp\\Exception\\GuzzleException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/GuzzleException.php',
        'GuzzleHttp\\Exception\\InvalidArgumentException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/InvalidArgumentException.php',
        'GuzzleHttp\\Exception\\RequestException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/RequestException.php',
        'GuzzleHttp\\Exception\\ServerException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/ServerException.php',
        'GuzzleHttp\\Exception\\TooManyRedirectsException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/TooManyRedirectsException.php',
        'GuzzleHttp\\Exception\\TransferException' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Exception/TransferException.php',
        'GuzzleHttp\\HandlerStack' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/HandlerStack.php',
        'GuzzleHttp\\Handler\\CurlFactory' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/CurlFactory.php',
        'GuzzleHttp\\Handler\\CurlFactoryInterface' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/CurlFactoryInterface.php',
        'GuzzleHttp\\Handler\\CurlHandler' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/CurlHandler.php',
        'GuzzleHttp\\Handler\\CurlMultiHandler' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/CurlMultiHandler.php',
        'GuzzleHttp\\Handler\\EasyHandle' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/EasyHandle.php',
        'GuzzleHttp\\Handler\\HeaderProcessor' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/HeaderProcessor.php',
        'GuzzleHttp\\Handler\\MockHandler' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/MockHandler.php',
        'GuzzleHttp\\Handler\\Proxy' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/Proxy.php',
        'GuzzleHttp\\Handler\\StreamHandler' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Handler/StreamHandler.php',
        'GuzzleHttp\\MessageFormatter' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/MessageFormatter.php',
        'GuzzleHttp\\MessageFormatterInterface' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/MessageFormatterInterface.php',
        'GuzzleHttp\\Middleware' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Middleware.php',
        'GuzzleHttp\\Pool' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Pool.php',
        'GuzzleHttp\\PrepareBodyMiddleware' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/PrepareBodyMiddleware.php',
        'GuzzleHttp\\Promise\\AggregateException' => __DIR__ . '/..' . '/guzzlehttp/promises/src/AggregateException.php',
        'GuzzleHttp\\Promise\\CancellationException' => __DIR__ . '/..' . '/guzzlehttp/promises/src/CancellationException.php',
        'GuzzleHttp\\Promise\\Coroutine' => __DIR__ . '/..' . '/guzzlehttp/promises/src/Coroutine.php',
        'GuzzleHttp\\Promise\\Create' => __DIR__ . '/..' . '/guzzlehttp/promises/src/Create.php',
        'GuzzleHttp\\Promise\\Each' => __DIR__ . '/..' . '/guzzlehttp/promises/src/Each.php',
        'GuzzleHttp\\Promise\\EachPromise' => __DIR__ . '/..' . '/guzzlehttp/promises/src/EachPromise.php',
        'GuzzleHttp\\Promise\\FulfilledPromise' => __DIR__ . '/..' . '/guzzlehttp/promises/src/FulfilledPromise.php',
        'GuzzleHttp\\Promise\\Is' => __DIR__ . '/..' . '/guzzlehttp/promises/src/Is.php',
        'GuzzleHttp\\Promise\\Promise' => __DIR__ . '/..' . '/guzzlehttp/promises/src/Promise.php',
        'GuzzleHttp\\Promise\\PromiseInterface' => __DIR__ . '/..' . '/guzzlehttp/promises/src/PromiseInterface.php',
        'GuzzleHttp\\Promise\\PromisorInterface' => __DIR__ . '/..' . '/guzzlehttp/promises/src/PromisorInterface.php',
        'GuzzleHttp\\Promise\\RejectedPromise' => __DIR__ . '/..' . '/guzzlehttp/promises/src/RejectedPromise.php',
        'GuzzleHttp\\Promise\\RejectionException' => __DIR__ . '/..' . '/guzzlehttp/promises/src/RejectionException.php',
        'GuzzleHttp\\Promise\\TaskQueue' => __DIR__ . '/..' . '/guzzlehttp/promises/src/TaskQueue.php',
        'GuzzleHttp\\Promise\\TaskQueueInterface' => __DIR__ . '/..' . '/guzzlehttp/promises/src/TaskQueueInterface.php',
        'GuzzleHttp\\Promise\\Utils' => __DIR__ . '/..' . '/guzzlehttp/promises/src/Utils.php',
        'GuzzleHttp\\Psr7\\AppendStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/AppendStream.php',
        'GuzzleHttp\\Psr7\\BufferStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/BufferStream.php',
        'GuzzleHttp\\Psr7\\CachingStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/CachingStream.php',
        'GuzzleHttp\\Psr7\\DroppingStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/DroppingStream.php',
        'GuzzleHttp\\Psr7\\Exception\\MalformedUriException' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Exception/MalformedUriException.php',
        'GuzzleHttp\\Psr7\\FnStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/FnStream.php',
        'GuzzleHttp\\Psr7\\Header' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Header.php',
        'GuzzleHttp\\Psr7\\HttpFactory' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/HttpFactory.php',
        'GuzzleHttp\\Psr7\\InflateStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/InflateStream.php',
        'GuzzleHttp\\Psr7\\LazyOpenStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/LazyOpenStream.php',
        'GuzzleHttp\\Psr7\\LimitStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/LimitStream.php',
        'GuzzleHttp\\Psr7\\Message' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Message.php',
        'GuzzleHttp\\Psr7\\MessageTrait' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/MessageTrait.php',
        'GuzzleHttp\\Psr7\\MimeType' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/MimeType.php',
        'GuzzleHttp\\Psr7\\MultipartStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/MultipartStream.php',
        'GuzzleHttp\\Psr7\\NoSeekStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/NoSeekStream.php',
        'GuzzleHttp\\Psr7\\PumpStream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/PumpStream.php',
        'GuzzleHttp\\Psr7\\Query' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Query.php',
        'GuzzleHttp\\Psr7\\Request' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Request.php',
        'GuzzleHttp\\Psr7\\Response' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Response.php',
        'GuzzleHttp\\Psr7\\Rfc7230' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Rfc7230.php',
        'GuzzleHttp\\Psr7\\ServerRequest' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/ServerRequest.php',
        'GuzzleHttp\\Psr7\\Stream' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Stream.php',
        'GuzzleHttp\\Psr7\\StreamDecoratorTrait' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/StreamDecoratorTrait.php',
        'GuzzleHttp\\Psr7\\StreamWrapper' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/StreamWrapper.php',
        'GuzzleHttp\\Psr7\\UploadedFile' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/UploadedFile.php',
        'GuzzleHttp\\Psr7\\Uri' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Uri.php',
        'GuzzleHttp\\Psr7\\UriComparator' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/UriComparator.php',
        'GuzzleHttp\\Psr7\\UriNormalizer' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/UriNormalizer.php',
        'GuzzleHttp\\Psr7\\UriResolver' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/UriResolver.php',
        'GuzzleHttp\\Psr7\\Utils' => __DIR__ . '/..' . '/guzzlehttp/psr7/src/Utils.php',
        'GuzzleHttp\\RedirectMiddleware' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/RedirectMiddleware.php',
        'GuzzleHttp\\RequestOptions' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/RequestOptions.php',
        'GuzzleHttp\\RetryMiddleware' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/RetryMiddleware.php',
        'GuzzleHttp\\TransferStats' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/TransferStats.php',
        'GuzzleHttp\\Utils' => __DIR__ . '/..' . '/guzzlehttp/guzzle/src/Utils.php',
        'JsonPath\\Expression\\ArrayInterval' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/ArrayInterval.php',
        'JsonPath\\Expression\\BooleanExpression' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/BooleanExpression.php',
        'JsonPath\\Expression\\ChildNameList' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/ChildNameList.php',
        'JsonPath\\Expression\\Comparison' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/Comparison.php',
        'JsonPath\\Expression\\InArray' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/InArray.php',
        'JsonPath\\Expression\\IndexList' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/IndexList.php',
        'JsonPath\\Expression\\Value' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Expression/Value.php',
        'JsonPath\\InvalidJsonException' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/InvalidJsonException.php',
        'JsonPath\\InvalidJsonPathException' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/InvalidJsonPathException.php',
        'JsonPath\\JsonObject' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/JsonObject.php',
        'JsonPath\\JsonPath' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/JsonPath.php',
        'JsonPath\\Language\\ChildSelector' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Language/ChildSelector.php',
        'JsonPath\\Language\\Regex' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Language/Regex.php',
        'JsonPath\\Language\\Token' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Language/Token.php',
        'JsonPath\\Operation\\GetChild' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Operation/GetChild.php',
        'JsonPath\\Operation\\GetRecursive' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Operation/GetRecursive.php',
        'JsonPath\\Operation\\SelectChildren' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/JsonPath/Operation/SelectChildren.php',
        'Kevinrob\\GuzzleCache\\BodyStore' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/BodyStore.php',
        'Kevinrob\\GuzzleCache\\CacheEntry' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/CacheEntry.php',
        'Kevinrob\\GuzzleCache\\CacheMiddleware' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/CacheMiddleware.php',
        'Kevinrob\\GuzzleCache\\KeyValueHttpHeader' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/KeyValueHttpHeader.php',
        'Kevinrob\\GuzzleCache\\Storage\\CacheStorageInterface' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/CacheStorageInterface.php',
        'Kevinrob\\GuzzleCache\\Storage\\CompressedDoctrineCacheStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/CompressedDoctrineCacheStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\DoctrineCacheStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/DoctrineCacheStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\FlysystemStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/FlysystemStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\LaravelCacheStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/LaravelCacheStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\Psr16CacheStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/Psr16CacheStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\Psr6CacheStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/Psr6CacheStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\VolatileRuntimeStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/VolatileRuntimeStorage.php',
        'Kevinrob\\GuzzleCache\\Storage\\WordPressObjectCacheStorage' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Storage/WordPressObjectCacheStorage.php',
        'Kevinrob\\GuzzleCache\\Strategy\\CacheStrategyInterface' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/CacheStrategyInterface.php',
        'Kevinrob\\GuzzleCache\\Strategy\\Delegate\\DelegatingCacheStrategy' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/Delegate/DelegatingCacheStrategy.php',
        'Kevinrob\\GuzzleCache\\Strategy\\Delegate\\RequestMatcherInterface' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/Delegate/RequestMatcherInterface.php',
        'Kevinrob\\GuzzleCache\\Strategy\\GreedyCacheStrategy' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/GreedyCacheStrategy.php',
        'Kevinrob\\GuzzleCache\\Strategy\\NullCacheStrategy' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/NullCacheStrategy.php',
        'Kevinrob\\GuzzleCache\\Strategy\\PrivateCacheStrategy' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/PrivateCacheStrategy.php',
        'Kevinrob\\GuzzleCache\\Strategy\\PublicCacheStrategy' => __DIR__ . '/..' . '/kevinrob/guzzle-cache-middleware/src/Strategy/PublicCacheStrategy.php',
        'Parsedown' => __DIR__ . '/..' . '/erusev/parsedown/Parsedown.php',
        'Psr\\Http\\Client\\ClientExceptionInterface' => __DIR__ . '/..' . '/psr/http-client/src/ClientExceptionInterface.php',
        'Psr\\Http\\Client\\ClientInterface' => __DIR__ . '/..' . '/psr/http-client/src/ClientInterface.php',
        'Psr\\Http\\Client\\NetworkExceptionInterface' => __DIR__ . '/..' . '/psr/http-client/src/NetworkExceptionInterface.php',
        'Psr\\Http\\Client\\RequestExceptionInterface' => __DIR__ . '/..' . '/psr/http-client/src/RequestExceptionInterface.php',
        'Psr\\Http\\Message\\MessageInterface' => __DIR__ . '/..' . '/psr/http-message/src/MessageInterface.php',
        'Psr\\Http\\Message\\RequestFactoryInterface' => __DIR__ . '/..' . '/psr/http-factory/src/RequestFactoryInterface.php',
        'Psr\\Http\\Message\\RequestInterface' => __DIR__ . '/..' . '/psr/http-message/src/RequestInterface.php',
        'Psr\\Http\\Message\\ResponseFactoryInterface' => __DIR__ . '/..' . '/psr/http-factory/src/ResponseFactoryInterface.php',
        'Psr\\Http\\Message\\ResponseInterface' => __DIR__ . '/..' . '/psr/http-message/src/ResponseInterface.php',
        'Psr\\Http\\Message\\ServerRequestFactoryInterface' => __DIR__ . '/..' . '/psr/http-factory/src/ServerRequestFactoryInterface.php',
        'Psr\\Http\\Message\\ServerRequestInterface' => __DIR__ . '/..' . '/psr/http-message/src/ServerRequestInterface.php',
        'Psr\\Http\\Message\\StreamFactoryInterface' => __DIR__ . '/..' . '/psr/http-factory/src/StreamFactoryInterface.php',
        'Psr\\Http\\Message\\StreamInterface' => __DIR__ . '/..' . '/psr/http-message/src/StreamInterface.php',
        'Psr\\Http\\Message\\UploadedFileFactoryInterface' => __DIR__ . '/..' . '/psr/http-factory/src/UploadedFileFactoryInterface.php',
        'Psr\\Http\\Message\\UploadedFileInterface' => __DIR__ . '/..' . '/psr/http-message/src/UploadedFileInterface.php',
        'Psr\\Http\\Message\\UriFactoryInterface' => __DIR__ . '/..' . '/psr/http-factory/src/UriFactoryInterface.php',
        'Psr\\Http\\Message\\UriInterface' => __DIR__ . '/..' . '/psr/http-message/src/UriInterface.php',
        'Psr\\Log\\AbstractLogger' => __DIR__ . '/..' . '/psr/log/src/AbstractLogger.php',
        'Psr\\Log\\InvalidArgumentException' => __DIR__ . '/..' . '/psr/log/src/InvalidArgumentException.php',
        'Psr\\Log\\LogLevel' => __DIR__ . '/..' . '/psr/log/src/LogLevel.php',
        'Psr\\Log\\LoggerAwareInterface' => __DIR__ . '/..' . '/psr/log/src/LoggerAwareInterface.php',
        'Psr\\Log\\LoggerAwareTrait' => __DIR__ . '/..' . '/psr/log/src/LoggerAwareTrait.php',
        'Psr\\Log\\LoggerInterface' => __DIR__ . '/..' . '/psr/log/src/LoggerInterface.php',
        'Psr\\Log\\LoggerTrait' => __DIR__ . '/..' . '/psr/log/src/LoggerTrait.php',
        'Psr\\Log\\NullLogger' => __DIR__ . '/..' . '/psr/log/src/NullLogger.php',
        'RemoteDataBlocks\\Config\\ArraySerializable' => __DIR__ . '/../..' . '/inc/Config/ArraySerializable.php',
        'RemoteDataBlocks\\Config\\ArraySerializableInterface' => __DIR__ . '/../..' . '/inc/Config/ArraySerializableInterface.php',
        'RemoteDataBlocks\\Config\\BlockAttribute\\RemoteDataBlockAttribute' => __DIR__ . '/../..' . '/inc/Config/BlockAttribute/RemoteDataBlockAttribute.php',
        'RemoteDataBlocks\\Config\\DataSource\\DataSourceInterface' => __DIR__ . '/../..' . '/inc/Config/DataSource/DataSourceInterface.php',
        'RemoteDataBlocks\\Config\\DataSource\\HttpDataSource' => __DIR__ . '/../..' . '/inc/Config/DataSource/HttpDataSource.php',
        'RemoteDataBlocks\\Config\\DataSource\\HttpDataSourceInterface' => __DIR__ . '/../..' . '/inc/Config/DataSource/HttpDataSourceInterface.php',
        'RemoteDataBlocks\\Config\\QueryRunner\\QueryResponseParser' => __DIR__ . '/../..' . '/inc/Config/QueryRunner/QueryResponseParser.php',
        'RemoteDataBlocks\\Config\\QueryRunner\\QueryRunner' => __DIR__ . '/../..' . '/inc/Config/QueryRunner/QueryRunner.php',
        'RemoteDataBlocks\\Config\\QueryRunner\\QueryRunnerInterface' => __DIR__ . '/../..' . '/inc/Config/QueryRunner/QueryRunnerInterface.php',
        'RemoteDataBlocks\\Config\\Query\\GraphqlMutation' => __DIR__ . '/../..' . '/inc/Config/Query/GraphqlMutation.php',
        'RemoteDataBlocks\\Config\\Query\\GraphqlQuery' => __DIR__ . '/../..' . '/inc/Config/Query/GraphqlQuery.php',
        'RemoteDataBlocks\\Config\\Query\\HttpQuery' => __DIR__ . '/../..' . '/inc/Config/Query/HttpQuery.php',
        'RemoteDataBlocks\\Config\\Query\\HttpQueryInterface' => __DIR__ . '/../..' . '/inc/Config/Query/HttpQueryInterface.php',
        'RemoteDataBlocks\\Config\\Query\\QueryInterface' => __DIR__ . '/../..' . '/inc/Config/Query/QueryInterface.php',
        'RemoteDataBlocks\\Editor\\AdminNotices\\AdminNotices' => __DIR__ . '/../..' . '/inc/Editor/AdminNotices/AdminNotices.php',
        'RemoteDataBlocks\\Editor\\Assets\\Assets' => __DIR__ . '/../..' . '/inc/Editor/Assets/Assets.php',
        'RemoteDataBlocks\\Editor\\BlockManagement\\BlockRegistration' => __DIR__ . '/../..' . '/inc/Editor/BlockManagement/BlockRegistration.php',
        'RemoteDataBlocks\\Editor\\BlockManagement\\ConfigRegistry' => __DIR__ . '/../..' . '/inc/Editor/BlockManagement/ConfigRegistry.php',
        'RemoteDataBlocks\\Editor\\BlockManagement\\ConfigStore' => __DIR__ . '/../..' . '/inc/Editor/BlockManagement/ConfigStore.php',
        'RemoteDataBlocks\\Editor\\BlockPatterns\\BlockPatterns' => __DIR__ . '/../..' . '/inc/Editor/BlockPatterns/BlockPatterns.php',
        'RemoteDataBlocks\\Editor\\DataBinding\\BlockBindings' => __DIR__ . '/../..' . '/inc/Editor/DataBinding/BlockBindings.php',
        'RemoteDataBlocks\\Editor\\DataBinding\\FieldShortcode' => __DIR__ . '/../..' . '/inc/Editor/DataBinding/FieldShortcode.php',
        'RemoteDataBlocks\\Editor\\DataBinding\\Pagination' => __DIR__ . '/../..' . '/inc/Editor/DataBinding/Pagination.php',
        'RemoteDataBlocks\\Editor\\PatternEditor\\PatternEditor' => __DIR__ . '/../..' . '/inc/Editor/PatternEditor/PatternEditor.php',
        'RemoteDataBlocks\\ExampleApi\\Data\\ExampleApiData' => __DIR__ . '/../..' . '/inc/ExampleApi/Data/ExampleApiData.php',
        'RemoteDataBlocks\\ExampleApi\\ExampleApi' => __DIR__ . '/../..' . '/inc/ExampleApi/ExampleApi.php',
        'RemoteDataBlocks\\ExampleApi\\Queries\\ExampleApiQueryRunner' => __DIR__ . '/../..' . '/inc/ExampleApi/Queries/ExampleApiQueryRunner.php',
        'RemoteDataBlocks\\Formatting\\FieldFormatter' => __DIR__ . '/../..' . '/inc/Formatting/FieldFormatter.php',
        'RemoteDataBlocks\\Formatting\\StringFormatter' => __DIR__ . '/../..' . '/inc/Formatting/StringFormatter.php',
        'RemoteDataBlocks\\HttpClient\\HttpClient' => __DIR__ . '/../..' . '/inc/HttpClient/HttpClient.php',
        'RemoteDataBlocks\\HttpClient\\RdbCacheMiddleware' => __DIR__ . '/../..' . '/inc/HttpClient/RdbCacheMiddleware.php',
        'RemoteDataBlocks\\HttpClient\\RdbCacheStrategy' => __DIR__ . '/../..' . '/inc/HttpClient/RdbCacheStrategy.php',
        'RemoteDataBlocks\\HttpClient\\WPRemoteRequestHandler' => __DIR__ . '/../..' . '/inc/HttpClient/WPRemoteRequestHandler.php',
        'RemoteDataBlocks\\Integrations\\Airtable\\AirtableDataSource' => __DIR__ . '/../..' . '/inc/Integrations/Airtable/AirtableDataSource.php',
        'RemoteDataBlocks\\Integrations\\Airtable\\AirtableIntegration' => __DIR__ . '/../..' . '/inc/Integrations/Airtable/AirtableIntegration.php',
        'RemoteDataBlocks\\Integrations\\GitHub\\GitHubDataSource' => __DIR__ . '/../..' . '/inc/Integrations/GitHub/GitHubDataSource.php',
        'RemoteDataBlocks\\Integrations\\Google\\Auth\\GoogleAuth' => __DIR__ . '/../..' . '/inc/Integrations/Google/Auth/GoogleAuth.php',
        'RemoteDataBlocks\\Integrations\\Google\\Auth\\GoogleServiceAccountKey' => __DIR__ . '/../..' . '/inc/Integrations/Google/Auth/GoogleServiceAccountKey.php',
        'RemoteDataBlocks\\Integrations\\Google\\Sheets\\GoogleSheetsDataSource' => __DIR__ . '/../..' . '/inc/Integrations/Google/Sheets/GoogleSheetsDataSource.php',
        'RemoteDataBlocks\\Integrations\\Google\\Sheets\\GoogleSheetsIntegration' => __DIR__ . '/../..' . '/inc/Integrations/Google/Sheets/GoogleSheetsIntegration.php',
        'RemoteDataBlocks\\Integrations\\Shopify\\ShopifyDataSource' => __DIR__ . '/../..' . '/inc/Integrations/Shopify/ShopifyDataSource.php',
        'RemoteDataBlocks\\Integrations\\Shopify\\ShopifyIntegration' => __DIR__ . '/../..' . '/inc/Integrations/Shopify/ShopifyIntegration.php',
        'RemoteDataBlocks\\Integrations\\VipBlockDataApi\\VipBlockDataApi' => __DIR__ . '/../..' . '/inc/Integrations/VipBlockDataApi/VipBlockDataApi.php',
        'RemoteDataBlocks\\Logging\\Logger' => __DIR__ . '/../..' . '/inc/Logging/Logger.php',
        'RemoteDataBlocks\\Logging\\LoggerManager' => __DIR__ . '/../..' . '/inc/Logging/LoggerManager.php',
        'RemoteDataBlocks\\PluginSettings\\PluginSettings' => __DIR__ . '/../..' . '/inc/PluginSettings/PluginSettings.php',
        'RemoteDataBlocks\\REST\\AuthController' => __DIR__ . '/../..' . '/inc/REST/AuthController.php',
        'RemoteDataBlocks\\REST\\DataSourceController' => __DIR__ . '/../..' . '/inc/REST/DataSourceController.php',
        'RemoteDataBlocks\\REST\\RemoteDataController' => __DIR__ . '/../..' . '/inc/REST/RemoteDataController.php',
        'RemoteDataBlocks\\Sanitization\\Sanitizer' => __DIR__ . '/../..' . '/inc/Sanitization/Sanitizer.php',
        'RemoteDataBlocks\\Sanitization\\SanitizerInterface' => __DIR__ . '/../..' . '/inc/Sanitization/SanitizerInterface.php',
        'RemoteDataBlocks\\Snippet\\Snippet' => __DIR__ . '/../..' . '/inc/Snippet/Snippet.php',
        'RemoteDataBlocks\\Store\\DataSource\\ConstantConfigStore' => __DIR__ . '/../..' . '/inc/Store/DataSource/ConstantConfigStore.php',
        'RemoteDataBlocks\\Store\\DataSource\\DataSourceConfigManager' => __DIR__ . '/../..' . '/inc/Store/DataSource/DataSourceConfigManager.php',
        'RemoteDataBlocks\\Telemetry\\DataSourceTelemetry' => __DIR__ . '/../..' . '/inc/Telemetry/DataSourceTelemetry.php',
        'RemoteDataBlocks\\Telemetry\\Telemetry' => __DIR__ . '/../..' . '/inc/Telemetry/Telemetry.php',
        'RemoteDataBlocks\\Validation\\ConfigSchemas' => __DIR__ . '/../..' . '/inc/Validation/ConfigSchemas.php',
        'RemoteDataBlocks\\Validation\\Types' => __DIR__ . '/../..' . '/inc/Validation/Types.php',
        'RemoteDataBlocks\\Validation\\Validator' => __DIR__ . '/../..' . '/inc/Validation/Validator.php',
        'RemoteDataBlocks\\Validation\\ValidatorInterface' => __DIR__ . '/../..' . '/inc/Validation/ValidatorInterface.php',
        'RemoteDataBlocks\\WpdbStorage\\DataEncryption' => __DIR__ . '/../..' . '/inc/WpdbStorage/DataEncryption.php',
        'RemoteDataBlocks\\WpdbStorage\\DataSourceCrud' => __DIR__ . '/../..' . '/inc/WpdbStorage/DataSourceCrud.php',
        'Symfony\\Component\\VarExporter\\Exception\\ClassNotFoundException' => __DIR__ . '/..' . '/symfony/var-exporter/Exception/ClassNotFoundException.php',
        'Symfony\\Component\\VarExporter\\Exception\\ExceptionInterface' => __DIR__ . '/..' . '/symfony/var-exporter/Exception/ExceptionInterface.php',
        'Symfony\\Component\\VarExporter\\Exception\\LogicException' => __DIR__ . '/..' . '/symfony/var-exporter/Exception/LogicException.php',
        'Symfony\\Component\\VarExporter\\Exception\\NotInstantiableTypeException' => __DIR__ . '/..' . '/symfony/var-exporter/Exception/NotInstantiableTypeException.php',
        'Symfony\\Component\\VarExporter\\Hydrator' => __DIR__ . '/..' . '/symfony/var-exporter/Hydrator.php',
        'Symfony\\Component\\VarExporter\\Instantiator' => __DIR__ . '/..' . '/symfony/var-exporter/Instantiator.php',
        'Symfony\\Component\\VarExporter\\Internal\\Exporter' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/Exporter.php',
        'Symfony\\Component\\VarExporter\\Internal\\Hydrator' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/Hydrator.php',
        'Symfony\\Component\\VarExporter\\Internal\\LazyObjectRegistry' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/LazyObjectRegistry.php',
        'Symfony\\Component\\VarExporter\\Internal\\LazyObjectState' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/LazyObjectState.php',
        'Symfony\\Component\\VarExporter\\Internal\\LazyObjectTrait' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/LazyObjectTrait.php',
        'Symfony\\Component\\VarExporter\\Internal\\Reference' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/Reference.php',
        'Symfony\\Component\\VarExporter\\Internal\\Registry' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/Registry.php',
        'Symfony\\Component\\VarExporter\\Internal\\Values' => __DIR__ . '/..' . '/symfony/var-exporter/Internal/Values.php',
        'Symfony\\Component\\VarExporter\\LazyGhostTrait' => __DIR__ . '/..' . '/symfony/var-exporter/LazyGhostTrait.php',
        'Symfony\\Component\\VarExporter\\LazyObjectInterface' => __DIR__ . '/..' . '/symfony/var-exporter/LazyObjectInterface.php',
        'Symfony\\Component\\VarExporter\\LazyProxyTrait' => __DIR__ . '/..' . '/symfony/var-exporter/LazyProxyTrait.php',
        'Symfony\\Component\\VarExporter\\ProxyHelper' => __DIR__ . '/..' . '/symfony/var-exporter/ProxyHelper.php',
        'Symfony\\Component\\VarExporter\\VarExporter' => __DIR__ . '/..' . '/symfony/var-exporter/VarExporter.php',
        'Utilities\\ArraySlice' => __DIR__ . '/..' . '/galbar/jsonpath/src/Galbar/Utilities/ArraySlice.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitd18f0393069a3820d9b0f04447b0236c::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitd18f0393069a3820d9b0f04447b0236c::$prefixDirsPsr4;
            $loader->prefixesPsr0 = ComposerStaticInitd18f0393069a3820d9b0f04447b0236c::$prefixesPsr0;
            $loader->classMap = ComposerStaticInitd18f0393069a3820d9b0f04447b0236c::$classMap;

        }, null, ClassLoader::class);
    }
}
