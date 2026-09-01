<?php
/**
 * Core prompt registrations.
 *
 * Registers the plugin's own configurable system prompts on the
 * `vip_workflows_register_prompts` action. Defaults here are byte-identical to
 * the text the call sites use today; call sites are migrated to resolve through
 * PromptRegistry::get() in their own units, each adding its
 * registration here.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Registers core configurable prompts.
 */
class CorePrompts {

	/**
	 * Register core prompts.
	 *
	 * @since 0.0.1
	 *
	 * @param PromptRegistry $registry The prompt registry.
	 * @return void
	 */
	public static function register( PromptRegistry $registry ): void {
		// --- Media analysis (MediaProcessor) ---
		// Defaults mirror the apply_filters() defaults in
		// includes/integrations/class-media-processor.php. The legacy filters
		// (vip_workflows_ai_image_prompt / vip_workflows_media_pdf_prompt /
		// vip_workflows_ai_summary_prompt) are applied at the call site around
		// get(), so their names/signatures are unchanged.

		$registry->register(
			'media/image-analysis',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Media: image analysis', 'vip-workflows' ),
				'group'       => __( 'Media', 'vip-workflows' ),
				'description' => __( 'Vision prompt for analyzing uploaded images during research.', 'vip-workflows' ),
				'default'     => "Analyze this image for editorial research. Provide:\n\n" .
					"DESCRIPTION:\n" .
					"A detailed description of what is shown (people, objects, setting, context).\n\n" .
					"KEY DETAILS:\n" .
					"- Any text visible in the image\n" .
					"- Notable elements or data points\n" .
					"- The mood/tone/style\n\n" .
					"EDITORIAL NOTES:\n" .
					"- How this image might be relevant for research\n" .
					"- Any potential concerns (sensitive content, rights issues)\n\n" .
					'Be thorough but concise.',
			)
		);

		$registry->register(
			'media/pdf-analysis',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Media: PDF analysis', 'vip-workflows' ),
				'group'       => __( 'Media', 'vip-workflows' ),
				'description' => __( 'Prompt for summarizing and extracting text from uploaded PDFs.', 'vip-workflows' ),
				'default'     => "Analyze this PDF document for editorial research. Provide:\n\n" .
					"SUMMARY:\n" .
					'A concise 2-3 paragraph summary of the document covering the main points, ' .
					"key findings, and conclusions.\n\n" .
					"EXTRACTED TEXT:\n" .
					"The full text content of the document, preserving structure and headings where possible.\n\n" .
					// Parsed by MediaProcessor::parse_pdf_response() to split the summary
					// from the body, so the labels are a contract, not presentation.
					'Write the labels SUMMARY: and EXTRACTED TEXT: exactly as shown, on their own ' .
					"lines, not as markdown headings.\n\n" .
					'Be thorough and accurate.',
			)
		);

		$registry->register(
			'media/text-summary',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Media: transcript / text summary', 'vip-workflows' ),
				'group'       => __( 'Media', 'vip-workflows' ),
				'description' => __( 'Summary prompt for transcripts and extracted text. {content_type} is the kind of content being summarized.', 'vip-workflows' ),
				'variables'   => array( 'content_type' ),
				// The call site appends "\n\nContent:\n{text}" after resolving this template.
				'default'     => 'Summarize this {content_type} in 2-3 concise paragraphs. ' .
					'Focus on the key points, main topics, and important conclusions or insights.',
			)
		);

		// Distinct, shorter image-analysis default used by IdeationController's
		// source analysis (separate from media/image-analysis above). Both flow
		// through the vip_workflows_ai_image_prompt filter at their call sites.
		$registry->register(
			'ideation/image-source-analysis',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Media: image analysis (ideation source)', 'vip-workflows' ),
				'group'       => __( 'Media', 'vip-workflows' ),
				'description' => __( 'Shorter image analysis prompt used when analyzing a pinned ideation source image.', 'vip-workflows' ),
				'default'     => 'Analyze this image for editorial research. Describe what is shown, any text visible, and key details relevant for journalism/editorial use. Be thorough.',
			)
		);

		// --- Ideation assistants ---
		// Defaults are the verbatim heredocs from the assistant classes in
		// includes/ideation/assistants/. Nowdoc keeps {placeholders} literal so
		// The registry substitutes them at get() time.

		$registry->register(
			'ideation/seed-analyst',
			array(
				'label'       => __( 'Ideation: seed analysis', 'vip-workflows' ),
				'group'       => __( 'Ideation', 'vip-workflows' ),
				'description' => __( 'Extracts structured metadata (tags, entities, queries) from a story seed. Variables: {seed}, {brand_context}.', 'vip-workflows' ),
				'variables'   => array( 'seed', 'brand_context' ),
				'default'     => <<<'PROMPT'
Analyze this story idea seed and extract structured metadata.

SEED: "{seed}"{brand_context}

Respond in JSON with exactly this structure:
{
  "tags": ["topic1", "topic2", "topic3"],
  "entities": {
    "people": ["Name1"],
    "organizations": ["Org1"],
    "places": ["Place1"]
  },
  "search_queries": ["query for archive search", "query for web search"],
  "news_angle": "One sentence describing the core news angle",
  "suggested_title": "Auto-generated project title from the seed"
}

Rules:
- Tags: 3-7 topic tags, lowercase, specific (e.g., "uk-energy-policy" not "politics")
- Entities: only extract if clearly referenced in the seed
- Search queries: 2-3 optimized queries for finding related content
- Keep everything concise
PROMPT
			,
			)
		);

		$registry->register(
			'ideation/editorial-mentor',
			array(
				'label'       => __( 'Ideation: editorial mentor', 'vip-workflows' ),
				'group'       => __( 'Ideation', 'vip-workflows' ),
				'description' => __( 'Evaluates ideation progress and suggests next steps. Variables: {seed}, {tags}, {news_angle}, {total_cards}, {pinned_count}, {pinned_breakdown}, {dismissed_count}, {pinned_details}, {assistant_list}.', 'vip-workflows' ),
				'variables'   => array( 'seed', 'tags', 'news_angle', 'total_cards', 'pinned_count', 'pinned_breakdown', 'dismissed_count', 'pinned_details', 'assistant_list' ),
				'default'     => <<<'PROMPT'
You are an editorial mentor guiding a journalist through story ideation. They started with a seed idea and assistants found related sources. The journalist has been curating by pinning sources they find valuable.

STORY SEED: "{seed}"
EXTRACTED TOPICS: {tags}
NEWS ANGLE: {news_angle}
TOTAL SOURCES FOUND: {total_cards}
SOURCES PINNED BY JOURNALIST: {pinned_count} ({pinned_breakdown})
SOURCES DISMISSED: {dismissed_count}

Pinned sources (what the journalist chose to keep):
{pinned_details}

Based on what the journalist has collected so far, evaluate across: clarity of angle, source diversity, newsworthiness, and feasibility. Then respond in JSON:
{
  "guidance": "2-3 short, conversational sentences of specific advice. Reference their actual sources and angle. Suggest what's missing or what to explore next.",
  "readiness": "needs-context|developing|looking-solid|ready-to-pitch",
  "suggestions": [
    { "label": "Short button label describing the action", "assistant": "exact-assistant-id-from-list-below", "query": "the actual search query to run" }
  ]
}

AVAILABLE ASSISTANTS (use the exact "id" value in suggestions):
{assistant_list}

Rules:
- Be specific. Name their sources, topics, or gaps. Never give generic advice.
- If they have no pins yet but sources exist, acknowledge the sources are there and encourage the journalist to start pinning the ones that support their angle. Never say "no information" when TOTAL SOURCES FOUND > 0.
- If they have pins, comment on the mix (e.g., all from one domain, missing a counter-perspective, strong visual material).
- Tone: supportive colleague, not a grader.
- "needs-context": few/no pinned sources, idea is still vague
- "developing": some good material pinned, but clear gaps remain
- "looking-solid": strong diverse sources, clear angle, minor suggestions
- "ready-to-pitch": comprehensive, well-sourced, clear angle, ready to move forward
- "suggestions": 1-3 actionable next steps the journalist can take. Each must use a valid assistant ID from the list above and include a specific, ready-to-execute search query. Make the label concise and action-oriented (e.g., "Find expert reactions", "Search for related images").
PROMPT
			,
			)
		);

		$registry->register(
			'ideation/wp-search-rerank',
			array(
				'label'       => __( 'Ideation: WP search re-ranking', 'vip-workflows' ),
				'group'       => __( 'Ideation', 'vip-workflows' ),
				'description' => __( 'Ranks candidate archive articles by relevance to the seed. Variables: {limit}, {seed}, {candidate_text}.', 'vip-workflows' ),
				'variables'   => array( 'limit', 'seed', 'candidate_text' ),
				'default'     => <<<'PROMPT'
Given this story idea seed, rank the following articles by relevance. Return ONLY a JSON array of article indices (numbers) in order of relevance, most relevant first. Return at most {limit} indices.

SEED: "{seed}"

ARTICLES:
{candidate_text}

Respond with a JSON array of numbers, e.g. [3, 0, 7, 1]
PROMPT
			,
			)
		);

		// --- Research analysis (IdeationAnalyzer) ---
		// Defaults are byte-identical to the builders in
		// includes/ideation/research/class-ideation-analyzer.php. The call sites
		// pass already-truncated content and counts as variables.

		$registry->register(
			'research/source-summary',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Research: source summary', 'vip-workflows' ),
				'group'       => __( 'Research', 'vip-workflows' ),
				'description' => __( 'Summarizes a single research source. Variables: {max_length}, {title}, {content}.', 'vip-workflows' ),
				'variables'   => array( 'max_length', 'title', 'content' ),
				'default'     => 'Summarize the following article in approximately {max_length} words. '
					. 'Focus on the key information, main arguments, and notable findings. '
					. "Write in a neutral, informative tone suitable for editorial research.\n\n"
					. "Title: {title}\n\n"
					. "Content:\n{content}",
			)
		);

		$registry->register(
			'research/project-summary',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Research: project summary', 'vip-workflows' ),
				'group'       => __( 'Research', 'vip-workflows' ),
				'description' => __( 'Synthesizes multiple research sources for a project. Variables: {source_count}, {max_length}, {context}.', 'vip-workflows' ),
				'variables'   => array( 'source_count', 'max_length', 'context' ),
				'default'     => 'You are analyzing {source_count} research sources for an editorial project. '
					. "Synthesize the information and provide:\n\n"
					. '1. A comprehensive summary (approximately {max_length} words) that identifies common themes, '
					. "key findings, and the overall narrative across sources.\n\n"
					. "2. A list of 3-7 key points or takeaways.\n\n"
					. "Format your response as:\n"
					. "SUMMARY:\n[Your summary here]\n\n"
					. "KEY POINTS:\n- [Point 1]\n- [Point 2]\n...\n\n"
					// The two labels are parsed by IdeationAnalyzer::parse_summary_response()
					// to split the prose from the key-point array, so they are a contract
					// rather than presentation. Stated explicitly because this prompt also
					// carries the markdown directive, which otherwise invites the model to
					// render them as `## Summary` and take the key points with it.
					. 'Write the labels SUMMARY: and KEY POINTS: exactly as shown, on their own '
					. "lines, not as markdown headings.\n\n"
					. "Sources:\n{context}",
			)
		);

		// --- Draft generation + video transcript (IdeationController) ---
		// Defaults are byte-identical to the inline prompts in
		// includes/api/class-ideation-controller.php. {image_placement} and
		// {image_instructions} are conditional blocks (empty unless pinned images
		// are present); {transcript} is already trimmed at the call site.

		$registry->register(
			'ideation/draft-system',
			array(
				'label'       => __( 'Draft: system instruction', 'vip-workflows' ),
				'group'       => __( 'Draft', 'vip-workflows' ),
				'description' => __( 'System instruction for editorial draft generation. Variables: {guideline_context}, {word_count}, {image_placement}.', 'vip-workflows' ),
				'variables'   => array( 'guideline_context', 'word_count', 'image_placement' ),
				'default'     => "You are a professional editorial writer.\n\n"
					. "EDITORIAL GUIDELINES:\n{guideline_context}\n\n"
					. 'TASK: Write a complete article draft of approximately {word_count} words based on the provided research. '
					. "Write in the voice and style described in the editorial guidelines above.\n\n"
					. "OUTPUT FORMAT: Return valid JSON with exactly two fields:\n"
					. "- \"title\": A compelling headline for the article\n"
					. '- "body": The article body in clean markdown. Use ## for section headings, '
					. 'plain paragraphs separated by blank lines, > for blockquotes, and - for bullet lists. '
					. 'Do NOT use # (h1) in the body. Do NOT include the title in the body.'
					. '{image_placement}'
					. "\n\nReturn ONLY the JSON object. No wrapping text, no code fences.",
			)
		);

		$registry->register(
			'ideation/draft-user',
			array(
				'label'       => __( 'Draft: user prompt', 'vip-workflows' ),
				'group'       => __( 'Draft', 'vip-workflows' ),
				'description' => __( 'User prompt for editorial draft generation. Variables: {project_name}, {research_context}, {image_instructions}.', 'vip-workflows' ),
				'variables'   => array( 'project_name', 'research_context', 'image_instructions' ),
				'default'     => "Research project: {project_name}\n\n"
					. "Research Context:\n{research_context}{image_instructions}\n\n"
					. 'Write the draft article now.',
			)
		);

		$registry->register(
			'research/video-transcript',
			array(
				'output'      => 'markdown',
				'label'       => __( 'Research: video transcript analysis', 'vip-workflows' ),
				'group'       => __( 'Research', 'vip-workflows' ),
				'description' => __( 'Analyzes a fetched video transcript. Variables: {title}, {transcript}.', 'vip-workflows' ),
				'variables'   => array( 'title', 'transcript' ),
				'default'     => "Analyze this video transcript for editorial research.\n\n"
					. "VIDEO TITLE: \"{title}\"\n\n"
					. "TRANSCRIPT:\n{transcript}\n\n"
					. "Provide a thorough editorial analysis covering:\n"
					. "1. Key topics and arguments presented\n"
					. "2. Notable quotes or statements\n"
					. "3. People, organizations, or events mentioned\n"
					. "4. Relevance for journalism and editorial use\n"
					. "5. A concise summary (2-3 sentences)\n\n"
					. 'Be specific and reference content from the transcript.',
			)
		);
	}
}
