<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Collectors;
use RemoteDataBlocks\Logging\AbstractLogger;
use RemoteDataBlocks\Logging\Logger;
use function add_filter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class QueryMonitor {
	public static function init(): void {
		add_filter( 'qm/collectors', [ __CLASS__, 'add_collectors' ], 90, 1 );
		add_filter( 'qm/outputter/html', [ __CLASS__, 'add_html_outputters' ], 90, 1 );
		add_filter( 'qm/outputter/raw', [ __CLASS__, 'add_raw_outputters' ], 90, 1 );
		add_filter( 'qm/trace/ignore_class', [ __CLASS__, 'ignore_classes' ], 10, 1 );
	}

	public static function add_collectors( array $collectors ): array {
		$collector_classes = [
			'RemoteDataBlocks\Logging\QueryMonitor\RdbMainCollector',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbBlockBindingCollector',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbLogCollector',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbHttpRequestCollector',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbValidationCollector',
		];

		foreach ( $collector_classes as $class ) {
			if ( class_exists( $class ) ) {
				$instance = new $class();
				$collectors[ $instance->id ] = $instance;
			}
		}

		return $collectors;
	}

	public static function add_html_outputters( array $outputters ): array {
		$outputter_classes = [
			'RemoteDataBlocks\Logging\QueryMonitor\RdbMainOutputHtml',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbBlockBindingOutputHtml',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbHttpRequestOutputHtml',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbLogOutputHtml',
			'RemoteDataBlocks\Logging\QueryMonitor\RdbValidationOutputHtml',
		];

		foreach ( $outputter_classes as $class ) {
			if ( class_exists( $class ) ) {
				/**
				 * @psalm-suppress UndefinedClass
				 */
				$collector = QM_Collectors::get( $class::$collector_id );
				$instance = new $class( $collector );
				$outputters[ $collector->id ] = $instance;
			}
		}

		return $outputters;
	}

	public static function add_raw_outputters( array $outputters ): array {
		$outputter_classes = [
			'RemoteDataBlocks\Logging\QueryMonitor\RdbLogOutputRaw',
		];

		foreach ( $outputter_classes as $class ) {
			if ( class_exists( $class ) ) {
				/**
				 * @psalm-suppress UndefinedClass
				 */
				$collector = QM_Collectors::get( $class::$collector_id );
				$instance = new $class( $collector );
				$outputters[ $collector->id ] = $instance;
			}
		}

		return $outputters;
	}

	public static function ignore_classes( array $classes ): array {
		return array_merge( $classes, [
			AbstractLogger::class => true,
			Logger::class => true,
		] );
	}
}
