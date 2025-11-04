<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\DataBinding;

defined( 'ABSPATH' ) || exit();

class InlineBindings {
	public static function init(): void {
		add_action( 'the_content', [ __CLASS__, 'render_frontend_fields' ] );
	}

	public static function render_frontend_fields( string $content ): string {
		if ( ! str_contains( $content, 'remote-data-blocks-inline-field' ) ) {
			return $content;
		}

		preg_match_all(
			'#' .
			'<remote-data-blocks-inline-field' . // Match start of span tag
			'(?P<inner_tag_before_query>[^>]*)' . // Capture everything prior to query data
			'data-query="(?P<query>[^"]*)"' . // Capture query data
			'(?P<inner_tag_after_query>[^>]*)' . // Capture everything up to the end of the <span> tag
			'>(?P<fallback_value>.*?)</remote-data-blocks-inline-field>' . // Capture the text content of the span tag
			'#',
			$content,
			$matches,
			PREG_SET_ORDER // Group each set of matches together for easier replacement
		);

		foreach ( $matches as $match ) {
			$original_tag = $match[0];
			$query_data = json_decode( html_entity_decode( $match['query'] ), true /* associative */ );
			$fallback_value = $match['fallback_value'] ?? '';

			if ( ! isset( $query_data['remoteData']['blockName'], $query_data['selectedField'] ) ) {
				$status = 'parse-error';
				$value = $fallback_value;
			} else {
				$remote_data = $query_data['remoteData'];
				$query_inputs = $remote_data['queryInputs'] ?? ( $remote_data['queryInput'] ? [ $remote_data['queryInput'] ] : null );
				$source_args = [
					'block' => $remote_data['blockName'],
					'field' => $query_data['selectedField'],
					'queryInputs' => $query_inputs,
					'type' => $query_data['type'] ?? 'field',
				];

				$value = BlockBindings::get_value( $source_args, [ 'name' => '<inline-binding>' ], 'content' );

				if ( is_null( $value ) ) {
					$status = 'query-error';
					$value = $fallback_value;
				} else {
					$status = 'query-success';
				}
			}

			$replacement = sprintf('<span%sdata-remote-data-blocks-inline-field="%s"%s>%s</span>',
				$match['inner_tag_before_query'],
				$status,
				$match['inner_tag_after_query'],
				$value,
			);

			$position = strpos( $content, $original_tag );
			if ( false !== $position ) {
				$content = substr_replace( $content, $replacement, $position, strlen( $original_tag ) );
			}
		}

		return $content;
	}
}
