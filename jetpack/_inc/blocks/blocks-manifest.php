<?php
/**
 * Generated block metadata manifest.
 * @generated This file is generated. Do not modify it manually.
 */

return array (
  'ai-assistant' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/ai-assistant',
    'title' => 'AI Assistant',
    'description' => 'Elevate your content creation with our AI-powered Gutenberg Block, offering seamless customization and generation. Bear in mind that, as an evolving tool, occasional imprecision may occur.',
    'keywords' => 
    array (
      0 => 'AI',
      1 => 'GPT',
      2 => 'AL',
      3 => 'Magic',
      4 => 'help',
      5 => 'assistant',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'text',
    'icon' => '<svg viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M9.33301 5.33325L10.4644 8.20188L13.333 9.33325L10.4644 10.4646L9.33301 13.3333L8.20164 10.4646L5.33301 9.33325L8.20164 8.20188L9.33301 5.33325Z\'/><path d=\'M21.3333 5.33333L22.8418 9.15817L26.6667 10.6667L22.8418 12.1752L21.3333 16L19.8248 12.1752L16 10.6667L19.8248 9.15817L21.3333 5.33333Z\'/><path d=\'M14.6667 13.3333L16.5523 18.1144L21.3333 20L16.5523 21.8856L14.6667 26.6667L12.781 21.8856L8 20L12.781 18.1144L14.6667 13.3333Z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'multiple' => true,
      'reusable' => false,
    ),
    'attributes' => 
    array (
      'content' => 
      array (
        'type' => 'string',
      ),
      'originalContent' => 
      array (
        'type' => 'string',
      ),
      'promptType' => 
      array (
        'type' => 'string',
      ),
      'originalMessages' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'messages' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'userPrompt' => 
      array (
        'type' => 'string',
        'default' => '',
      ),
      'requestingState' => 
      array (
        'type' => 'string',
        'default' => 'init',
      ),
      'preTransformAction' => 
      array (
        'type' => 'string',
        'default' => NULL,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'content' => 'With **Jetpack AI Assistant**, you can provide a prompt, and it will generate high-quality blog posts, informative pages, well-organized lists, and thorough tables that meet your specific requirements.

To start using the **Jetpack AI Assistant**, type `/AI` in the block editor.',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'ai-chat' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/ai-chat',
    'title' => 'Jetpack AI Search',
    'description' => 'Provide a summarized answer to questions, trained on the sites content. Powered by AI.',
    'keywords' => 
    array (
      0 => 'AI',
      1 => 'GPT',
      2 => 'Chat',
      3 => 'Search',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'text',
    'icon' => '<svg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'><path fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M6.96774 8C6.96774 9.1402 6.04343 10.0645 4.90323 10.0645C3.76303 10.0645 2.83871 9.1402 2.83871 8C2.83871 6.8598 3.76303 5.93548 4.90323 5.93548C6.04343 5.93548 6.96774 6.8598 6.96774 8ZM5.41935 8C5.41935 8.28505 5.18828 8.51613 4.90323 8.51613C4.61818 8.51613 4.3871 8.28505 4.3871 8C4.3871 7.71495 4.61818 7.48387 4.90323 7.48387C5.18828 7.48387 5.41935 7.71495 5.41935 8Z\'/><path fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M11.0968 10.0645C12.237 10.0645 13.1613 9.1402 13.1613 8C13.1613 6.8598 12.237 5.93548 11.0968 5.93548C9.95657 5.93548 9.03226 6.8598 9.03226 8C9.03226 9.1402 9.95657 10.0645 11.0968 10.0645ZM11.0968 8.51613C11.3818 8.51613 11.6129 8.28505 11.6129 8C11.6129 7.71495 11.3818 7.48387 11.0968 7.48387C10.8117 7.48387 10.5806 7.71495 10.5806 8C10.5806 8.28505 10.8117 8.51613 11.0968 8.51613Z\'/><path d=\'M5.93548 11.3548C5.50791 11.3548 5.16129 11.7015 5.16129 12.129C5.16129 12.5566 5.50791 12.9032 5.93548 12.9032H10.0645C10.4921 12.9032 10.8387 12.5566 10.8387 12.129C10.8387 11.7015 10.4921 11.3548 10.0645 11.3548H5.93548Z\'/><path fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M8.77419 0.774194C8.77419 0.346618 8.42758 0 8 0C7.57242 0 7.22581 0.346618 7.22581 0.774194V3.09677H4.90323C2.19525 3.09677 0 5.29202 0 8V11.0968C0 13.8048 2.19525 16 4.90323 16H11.0968C13.8048 16 16 13.8048 16 11.0968V8C16 5.29202 13.8048 3.09677 11.0968 3.09677H8.77419V0.774194ZM1.54839 8C1.54839 6.14717 3.0504 4.64516 4.90323 4.64516H11.0968C12.9496 4.64516 14.4516 6.14717 14.4516 8V11.0968C14.4516 12.9496 12.9496 14.4516 11.0968 14.4516H4.90323C3.0504 14.4516 1.54839 12.9496 1.54839 11.0968V8Z\'/></svg>',
    'supports' => 
    array (
      'align' => true,
      'alignWide' => true,
      'customClassName' => true,
      'className' => true,
      'html' => false,
      'multiple' => false,
      'reusable' => false,
    ),
    'attributes' => 
    array (
      'askButtonLabel' => 
      array (
        'type' => 'string',
      ),
      'placeholder' => 
      array (
        'type' => 'string',
      ),
      'showCopy' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showFeedback' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showSources' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'blog-stats' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/blog-stats',
    'title' => 'Blog Stats',
    'description' => 'Show a stats counter for your blog.',
    'keywords' => 
    array (
      0 => 'views',
      1 => 'hits',
      2 => 'analytics',
      3 => 'counter',
      4 => 'visitors',
    ),
    'version' => '1.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg xmlns=\'http://www.w3.org/2000/svg\' height=\'24\' viewBox=\'0 -960 960 960\' width=\'24\'><path d=\'M160-200h160v-320H160v320Zm240 0h160v-560H400v560Zm240 0h160v-240H640v240ZM80-120v-480h240v-240h320v320h240v400H80Z\'/></svg>',
    'supports' => 
    array (
      'align' => true,
      'alignWide' => true,
      'html' => false,
      'multiple' => true,
      'reusable' => true,
      'color' => 
      array (
        'gradients' => true,
      ),
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      'typography' => 
      array (
        '__experimentalFontFamily' => true,
        'fontSize' => true,
      ),
    ),
    'attributes' => 
    array (
      'label' => 
      array (
        'type' => 'string',
      ),
      'statsData' => 
      array (
        'type' => 'string',
        'default' => 'views',
      ),
      'statsOption' => 
      array (
        'type' => 'string',
        'default' => 'site',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'blogging-prompt' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/blogging-prompt',
    'title' => 'Writing Prompt',
    'description' => 'Answer a new and inspiring writing prompt each day.',
    'keywords' => 
    array (
      0 => 'writing',
      1 => 'blogging',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'text',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M14.3438 19.3438H9.65625C9.57031 19.3438 9.5 19.4141 9.5 19.5V20.125C9.5 20.4707 9.7793 20.75 10.125 20.75H13.875C14.2207 20.75 14.5 20.4707 14.5 20.125V19.5C14.5 19.4141 14.4297 19.3438 14.3438 19.3438ZM12 3.25C8.46289 3.25 5.59375 6.11914 5.59375 9.65625C5.59375 12.0273 6.88281 14.0977 8.79688 15.2051V17.4688C8.79688 17.8145 9.07617 18.0938 9.42188 18.0938H14.5781C14.9238 18.0938 15.2031 17.8145 15.2031 17.4688V15.2051C17.1172 14.0977 18.4062 12.0273 18.4062 9.65625C18.4062 6.11914 15.5371 3.25 12 3.25ZM14.498 13.9883L13.7969 14.3945V16.6875H10.2031V14.3945L9.50195 13.9883C7.96484 13.0996 7 11.4629 7 9.65625C7 6.89453 9.23828 4.65625 12 4.65625C14.7617 4.65625 17 6.89453 17 9.65625C17 11.4629 16.0352 13.0996 14.498 13.9883Z\' stroke-width=\'0.1\'/></svg>',
    'supports' => 
    array (
      'align' => false,
      'alignWide' => false,
      'anchor' => false,
      'className' => true,
      'color' => 
      array (
        'background' => true,
        'gradients' => true,
        'link' => true,
        'text' => true,
      ),
      'customClassName' => true,
      'html' => false,
      'inserter' => true,
      'multiple' => false,
      'reusable' => true,
      'spacing' => 
      array (
        'margin' => 
        array (
          0 => 'top',
          1 => 'bottom',
        ),
        'padding' => true,
        'blockGap' => false,
      ),
    ),
    'attributes' => 
    array (
      'answersLink' => 
      array (
        'type' => 'string',
        'source' => 'attribute',
        'attribute' => 'href',
        'selector' => '.jetpack-blogging-prompt__answers-link',
      ),
      'answersLinkText' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => '.jetpack-blogging-prompt__answers-link',
      ),
      'gravatars' => 
      array (
        'type' => 'array',
        'source' => 'query',
        'selector' => '.jetpack-blogging-prompt__answers-gravatar',
        'query' => 
        array (
          'url' => 
          array (
            'type' => 'string',
            'source' => 'attribute',
            'attribute' => 'src',
          ),
        ),
        'default' => 
        array (
        ),
      ),
      'promptLabel' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => '.jetpack-blogging-prompt__label',
      ),
      'promptText' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => '.jetpack-blogging-prompt__text',
      ),
      'promptFetched' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'promptId' => 
      array (
        'type' => 'number',
      ),
      'showResponses' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showLabel' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'tagsAdded' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'isBloganuary' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
    ),
    'styles' => 
    array (
      0 => 
      array (
        'name' => 'block',
        'label' => 'Block',
        'isDefault' => true,
      ),
      1 => 
      array (
        'name' => 'quote',
        'label' => 'Quote',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'blogroll' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/blogroll',
    'title' => 'Blogroll',
    'description' => 'Share the sites you follow with your users.',
    'keywords' => 
    array (
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M4.08691 16.2412H20.0869V14.7412H4.08691V16.2412Z\'></path><path d=\'M4.08691 20.2412H13.0869V18.7412H4.08691V20.2412Z\'></path><path fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M4.08691 8.17871C4.08691 6.00409 5.84979 4.24121 8.02441 4.24121C10.199 4.24121 11.9619 6.00409 11.9619 8.17871C11.9619 10.3533 10.199 12.1162 8.02441 12.1162C5.84979 12.1162 4.08691 10.3533 4.08691 8.17871ZM5.10729 6.71621C5.51231 5.90991 6.2418 5.29471 7.12439 5.04194C6.91534 5.28455 6.73551 5.57108 6.58869 5.88606C6.46938 6.14205 6.36999 6.42056 6.29338 6.71621H5.10729ZM4.85759 7.39121C4.79508 7.64341 4.76191 7.90719 4.76191 8.17871C4.76191 8.45024 4.79508 8.71401 4.85759 8.96621H6.16284C6.12938 8.71126 6.11192 8.44782 6.11192 8.1787C6.11192 7.90956 6.12938 7.64614 6.16284 7.39121H4.85759ZM6.84439 7.39121C6.80693 7.64285 6.78692 7.90651 6.78692 8.1787C6.78692 8.45091 6.80694 8.71459 6.84439 8.96621H9.20444C9.2419 8.71458 9.26192 8.45091 9.26192 8.17873C9.26192 7.90653 9.2419 7.64285 9.20444 7.39121H6.84439ZM9.88599 7.39121C9.91945 7.64615 9.93692 7.90958 9.93692 8.17873C9.93692 8.44786 9.91945 8.71128 9.88599 8.96621H11.1912C11.2537 8.71401 11.2869 8.45024 11.2869 8.17871C11.2869 7.90719 11.2537 7.64341 11.1912 7.39121H9.88599ZM10.9415 6.71621H9.75544C9.67883 6.42057 9.57945 6.14207 9.46014 5.88609C9.31332 5.5711 9.13347 5.28455 8.92441 5.04193C9.80702 5.29469 10.5365 5.9099 10.9415 6.71621ZM9.05465 6.71621H6.99417C7.05245 6.52254 7.12177 6.34014 7.2005 6.17123C7.42342 5.69296 7.71302 5.34019 8.02439 5.13337C8.33578 5.34019 8.6254 5.69297 8.84833 6.17126C8.92706 6.34016 8.99637 6.52255 9.05465 6.71621ZM5.10729 9.64121H6.29339C6.37419 9.95305 6.48034 10.2458 6.6085 10.5132C6.75142 10.8114 6.92452 11.0835 7.12445 11.3155C6.24183 11.0627 5.51232 10.4475 5.10729 9.64121ZM9.05466 9.64121H6.99418C7.05655 9.84847 7.13156 10.0428 7.21721 10.2215C7.43825 10.6827 7.72115 11.0226 8.02446 11.224C8.33582 11.0172 8.62541 10.6645 8.84833 10.1862C8.92706 10.0173 8.99638 9.83488 9.05466 9.64121ZM9.46014 10.4714C9.57945 10.2154 9.67884 9.93686 9.75545 9.64121H10.9415C10.5365 10.4475 9.80703 11.0627 8.92444 11.3155C9.13349 11.0729 9.31332 10.7863 9.46014 10.4714Z\'></path></svg>',
    'supports' => 
    array (
      'align' => false,
      'alignWide' => true,
      'anchor' => false,
      'customClassName' => true,
      'className' => true,
      'html' => false,
      'multiple' => true,
      'reusable' => true,
      'color' => 
      array (
        'link' => true,
        'gradients' => true,
      ),
      'spacing' => 
      array (
        'padding' => true,
        'margin' => true,
      ),
      'typography' => 
      array (
        'fontSize' => true,
        'lineHeight' => true,
      ),
    ),
    'attributes' => 
    array (
      'show_avatar' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'show_description' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'open_links_new_window' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'ignore_user_blogs' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'load_placeholders' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
    ),
    'providesContext' => 
    array (
      'showAvatar' => 'show_avatar',
      'showDescription' => 'show_description',
      'openLinksNewWindow' => 'open_links_new_window',
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'business-hours' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/business-hours',
    'title' => 'Business Hours',
    'description' => 'Display opening hours for your business.',
    'keywords' => 
    array (
      0 => 'opening hours',
      1 => 'closing time',
      2 => 'schedule',
      3 => 'working day',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z\'/></svg>',
    'supports' => 
    array (
      'html' => true,
      'color' => 
      array (
        'gradients' => true,
      ),
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      'typography' => 
      array (
        'fontSize' => true,
        'lineHeight' => true,
      ),
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
    ),
    'attributes' => 
    array (
      'days' => 
      array (
        'type' => 'array',
        'default' => 
        array (
          0 => 
          array (
            'name' => 'Sun',
            'hours' => 
            array (
            ),
          ),
          1 => 
          array (
            'name' => 'Mon',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          2 => 
          array (
            'name' => 'Tue',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          3 => 
          array (
            'name' => 'Wed',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          4 => 
          array (
            'name' => 'Thu',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          5 => 
          array (
            'name' => 'Fri',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          6 => 
          array (
            'name' => 'Sat',
            'hours' => 
            array (
            ),
          ),
        ),
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'days' => 
        array (
          0 => 
          array (
            'name' => 'Sun',
            'hours' => 
            array (
            ),
          ),
          1 => 
          array (
            'name' => 'Mon',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          2 => 
          array (
            'name' => 'Tue',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          3 => 
          array (
            'name' => 'Wed',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          4 => 
          array (
            'name' => 'Thu',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          5 => 
          array (
            'name' => 'Fri',
            'hours' => 
            array (
              0 => 
              array (
                'opening' => '09:00',
                'closing' => '17:00',
              ),
            ),
          ),
          6 => 
          array (
            'name' => 'Sat',
            'hours' => 
            array (
            ),
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'calendly' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/calendly',
    'title' => 'Calendly',
    'description' => 'Embed a calendar for customers to schedule appointments.',
    'keywords' => 
    array (
      0 => 'calendar',
      1 => 'schedule',
      2 => 'appointments',
      3 => 'events',
      4 => 'dates',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 23 24\' width=\'23\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M19,1h-2.3v0c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1v0H8.6v0c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1v0H4C1.8,1,0,2.8,0,5 v15c0,2.2,1.8,4,4,4h15c2.2,0,4-1.8,4-4V5C23,2.8,21.2,1,19,1z M21,20c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V5c0-1.1,0.9-2,2-2h2.6 v0.8c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1V3h6.1v0.8c0,0.6,0.4,1,1,1c0.6,0,1-0.4,1-1V3H19c1.1,0,2,0.9,2,2V20z M13.9,14.8l1.4,1.4 c-0.9,0.9-2.1,1.3-3.5,1.3c-2.4,0-4.5-2.1-4.5-4.7s2.1-4.7,4.5-4.7c1.4,0,2.5,0.4,3.4,1.1L14,10.9c-0.5-0.4-1.2-0.6-2.1-0.6 c-1.2,0-2.5,1.1-2.5,2.7c0,1.6,1.3,2.7,2.5,2.7C12.7,15.5,13.4,15.3,13.9,14.8z\'/></svg>',
    'supports' => 
    array (
      'align' => true,
      'alignWide' => false,
      'html' => false,
    ),
    'attributes' => 
    array (
      'backgroundColor' => 
      array (
        'type' => 'string',
        'default' => 'ffffff',
      ),
      'hideEventTypeDetails' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'primaryColor' => 
      array (
        'type' => 'string',
        'default' => '00A2FF',
      ),
      'textColor' => 
      array (
        'type' => 'string',
        'default' => '4D5055',
      ),
      'style' => 
      array (
        'type' => 'string',
        'default' => 'inline',
        'enum' => 
        array (
          0 => 'inline',
          1 => 'link',
        ),
      ),
      'url' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'hideEventTypeDetails' => false,
        'style' => 'inline',
        'url' => 'https://calendly.com/wpcom/jetpack-block-example',
      ),
      'innerBlocks' => 
      array (
        0 => 
        array (
          'name' => 'jetpack/button',
          'attributes' => 
          array (
            'element' => 'a',
            'text' => 'Schedule time with me',
            'uniqueId' => 'calendly-widget-id',
            'url' => 'https://calendly.com/wpcom/jetpack-block-example',
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'contact-info' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/contact-info',
    'title' => 'Contact Info',
    'description' => 'Add an email address, phone number, and physical address with improved markup for better SEO results.',
    'keywords' => 
    array (
      0 => 'email',
      1 => 'phone',
      2 => 'address',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M19 5v14H5V5h14m0-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 10H6v-1.53c0-2.5 3.97-3.58 6-3.58s6 1.08 6 3.58V18zm-9.69-2h7.38c-.69-.56-2.38-1.12-3.69-1.12s-3.01.56-3.69 1.12z\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'html' => false,
      'color' => 
      array (
        'link' => true,
        'gradients' => true,
      ),
      'spacing' => 
      array (
        'padding' => true,
        'margin' => true,
      ),
      'typography' => 
      array (
        'fontSize' => true,
        'lineHeight' => true,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
      ),
      'innerBlocks' => 
      array (
        0 => 
        array (
          'name' => 'jetpack/email',
          'attributes' => 
          array (
            'email' => 'hello@yourjetpack.blog',
          ),
        ),
        1 => 
        array (
          'name' => 'jetpack/phone',
          'attributes' => 
          array (
            'phone' => '123-456-7890',
          ),
        ),
        2 => 
        array (
          'name' => 'jetpack/address',
          'attributes' => 
          array (
            'address' => '987 Photon Drive',
            'city' => 'Speedyville',
            'region' => 'CA',
            'postal' => '12345',
            'country' => 'USA',
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'cookie-consent' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/cookie-consent',
    'title' => 'Cookie Consent',
    'description' => 'Display a customizable cookie consent banner. To display this block on all pages of your site, please add it inside a Template Part that is present on all your templates, like a Header or a Footer.',
    'keywords' => 
    array (
      0 => 'cookie',
      1 => 'consent',
      2 => 'privacy',
      3 => 'GDPR',
      4 => 'EU',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m20.27,11.03c-.02-.31-.05-.62-.11-.92h-3.88v-2.91h-2.87v-3.79c-.32-.06-.64-.1-.97-.12-.15,0-.29,0-.44,0C7.42,3.28,3.71,7,3.71,11.57s3.71,8.3,8.29,8.3,8.29-3.72,8.29-8.3c0-.18,0-.36-.02-.54Zm-8.23,7.79c-4,0-7.24-3.25-7.24-7.25s3.24-7.24,7.24-7.24c.14,0,.27,0,.4.02v3.81h2.9v2.87h3.91c.02.18.03.36.03.54,0,4-3.24,7.25-7.24,7.25Z\'/><path d=\'M 8, 8 a 1,1 0 1,1 2,0 a 1,1 0 1,1 -2,0\'/><path d=\'M 12, 11.5 a 1,1 0 1,1 2,0 a 1,1 0 1,1 -2,0\'/><path d=\'M 13, 16 a 1,1 0 1,1 2,0 a 1,1 0 1,1 -2,0\'/><path d=\'M 8, 14 a 1,1 0 1,1 2,0 a 1,1 0 1,1 -2,0\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'left',
        1 => 'right',
        2 => 'wide',
        3 => 'full',
      ),
      'alignWide' => true,
      'anchor' => false,
      'color' => 
      array (
        'gradients' => true,
        'link' => true,
      ),
      'spacing' => 
      array (
        'padding' => true,
      ),
      'customClassName' => true,
      'className' => true,
      'html' => false,
      'lock' => false,
      'multiple' => false,
      'reusable' => false,
    ),
    'attributes' => 
    array (
      'text' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => 'p',
      ),
      'style' => 
      array (
        'type' => 'object',
        'default' => 
        array (
          'color' => 
          array (
            'text' => 'var(--wp--preset--color--contrast)',
            'background' => 'var(--wp--preset--color--tertiary)',
            'link' => 'var(--wp--preset--color--contrast)',
          ),
          'spacing' => 
          array (
            'padding' => 
            array (
              'top' => '1em',
              'right' => '1em',
              'bottom' => '1em',
              'left' => '1em',
            ),
          ),
        ),
      ),
      'align' => 
      array (
        'type' => 'string',
        'default' => 'wide',
      ),
      'consentExpiryDays' => 
      array (
        'type' => 'integer',
        'default' => 365,
      ),
      'showOverlay' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'donations' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/donations',
    'title' => 'Donations Form',
    'description' => 'Collect one-time, monthly, or annually recurring donations.',
    'keywords' => 
    array (
      0 => 'charity',
      1 => 'contribution',
      2 => 'credit card',
      3 => 'debit card',
      4 => 'donate',
      5 => 'earn',
      6 => 'monetize',
      7 => 'ecommerce',
      8 => 'fundraising',
      9 => 'fundraiser',
      10 => 'gofundme',
      11 => 'money',
      12 => 'nonprofit',
      13 => 'non-profit',
      14 => 'paid',
      15 => 'patreon',
      16 => 'pay',
      17 => 'payments',
      18 => 'recurring',
      19 => 'stripe',
      20 => 'sponsor',
      21 => 'square',
      22 => 'tipping',
      23 => 'venmo',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M16.5 4.5c2.206 0 4 1.794 4 4 0 4.67-5.543 8.94-8.5 11.023C9.043 17.44 3.5 13.17 3.5 8.5c0-2.206 1.794-4 4-4 1.298 0 2.522.638 3.273 1.706L12 7.953l1.227-1.746c.75-1.07 1.975-1.707 3.273-1.707m0-1.5c-1.862 0-3.505.928-4.5 2.344C11.005 3.928 9.362 3 7.5 3 4.462 3 2 5.462 2 8.5c0 5.72 6.5 10.438 10 12.85 3.5-2.412 10-7.13 10-12.85C22 5.462 19.538 3 16.5 3z\' /></svg>',
    'supports' => 
    array (
      'html' => false,
    ),
    'attributes' => 
    array (
      'currency' => 
      array (
        'type' => 'string',
        'default' => '',
      ),
      'oneTimeDonation' => 
      array (
        'type' => 'object',
        'default' => 
        array (
          'show' => true,
          'planId' => NULL,
          'amounts' => 
          array (
            0 => 5,
            1 => 15,
            2 => 100,
          ),
        ),
      ),
      'monthlyDonation' => 
      array (
        'type' => 'object',
        'default' => 
        array (
          'show' => true,
          'planId' => NULL,
          'amounts' => 
          array (
            0 => 5,
            1 => 15,
            2 => 100,
          ),
        ),
      ),
      'annualDonation' => 
      array (
        'type' => 'object',
        'default' => 
        array (
          'show' => true,
          'planId' => NULL,
          'amounts' => 
          array (
            0 => 5,
            1 => 15,
            2 => 100,
          ),
        ),
      ),
      'showCustomAmount' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'chooseAmountText' => 
      array (
        'type' => 'string',
      ),
      'customAmountText' => 
      array (
        'type' => 'string',
      ),
      'fallbackLinkUrl' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'eventbrite' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/eventbrite',
    'title' => 'Eventbrite Checkout',
    'description' => 'Embed Eventbrite event details and ticket checkout.',
    'keywords' => 
    array (
      0 => 'events',
      1 => 'tickets',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M18.041,3.931L5.959,3C4.325,3,3,4.325,3,5.959v12.083C3,19.675,4.325,21,5.959,21l12.083-0.931C19.699,19.983,21,18.744,21,17.11V6.89C21,5.256,19.741,4.027,18.041,3.931zM16.933,8.17c-0.082,0.215-0.192,0.432-0.378,0.551c-0.188,0.122-0.489,0.132-0.799,0.132c-1.521,0-3.062-0.048-4.607-0.048c-0.152,0.708-0.304,1.416-0.451,2.128c0.932-0.004,1.873,0.005,2.81,0.005c0.726,0,1.462-0.069,1.586,0.525c0.04,0.189-0.001,0.426-0.052,0.615c-0.105,0.38-0.258,0.676-0.625,0.783c-0.185,0.054-0.408,0.058-0.646,0.058c-1.145,0-2.345,0.017-3.493,0.02c-0.169,0.772-0.328,1.553-0.489,2.333c1.57-0.005,3.067-0.041,4.633-0.058c0.627-0.007,1.085,0.194,1.009,0.85c-0.031,0.262-0.098,0.497-0.211,0.725c-0.102,0.208-0.248,0.376-0.488,0.452c-0.237,0.075-0.541,0.064-0.862,0.078c-0.304,0.014-0.614,0.008-0.924,0.016c-0.309,0.009-0.619,0.022-0.919,0.022c-1.253,0-2.429,0.08-3.683,0.073c-0.603-0.004-1.014-0.249-1.124-0.757c-0.059-0.273-0.018-0.58,0.036-0.841c0.541-2.592,1.083-5.176,1.629-7.763c0.056-0.265,0.114-0.511,0.225-0.714C9.279,7.051,9.534,6.834,9.9,6.735c0.368-0.099,0.883-0.047,1.344-0.047c0.305,0,0.612,0.008,0.914,0.016c0.925,0.026,1.817,0.03,2.747,0.053c0.304,0.007,0.615,0.016,0.915,0.016c0.621,0,1.17,0.073,1.245,0.614C17.104,7.675,17.014,7.954,16.933,8.17z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'align' => true,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
      ),
      'eventId' => 
      array (
        'type' => 'number',
      ),
      'style' => 
      array (
        'type' => 'string',
        'default' => 'inline',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'url' => 'https://www.eventbrite.com/e/test-event-tickets-123456789',
        'eventId' => 123456789,
        'style' => 'modal',
      ),
      'innerBlocks' => 
      array (
        0 => 
        array (
          'name' => 'jetpack/button',
          'attributes' => 
          array (
            'element' => 'a',
            'text' => 'Register',
            'uniqueId' => 'eventbrite-widget-id',
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'gif' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/gif',
    'title' => 'GIF',
    'description' => 'Search for and insert an animated image.',
    'keywords' => 
    array (
      0 => 'animated',
      1 => 'giphy',
      2 => 'image',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path fill=\'none\' d=\'M0 0h24v24H0V0z\'/><path d=\'M18 13v7H4V6h5.02c.05-.71.22-1.38.48-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5l-2-2zm-1.5 5h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zm2.8-9.11c.44-.7.7-1.51.7-2.39C20 4.01 17.99 2 15.5 2S11 4.01 11 6.5s2.01 4.5 4.49 4.5c.88 0 1.7-.26 2.39-.7L21 13.42 22.42 12 19.3 8.89zM15.5 9C14.12 9 13 7.88 13 6.5S14.12 4 15.5 4 18 5.12 18 6.5 16.88 9 15.5 9z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'align' => true,
    ),
    'attributes' => 
    array (
      'align' => 
      array (
        'type' => 'string',
        'default' => 'center',
      ),
      'caption' => 
      array (
        'type' => 'string',
      ),
      'giphyUrl' => 
      array (
        'type' => 'string',
      ),
      'searchText' => 
      array (
        'type' => 'string',
      ),
      'paddingTop' => 
      array (
        'type' => 'string',
        'default' => '56.2%',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'align' => 'center',
        'giphyUrl' => 'https://giphy.com/embed/fxKWgoOG9hzPPkE1oc',
        'paddingTop' => '100%',
        'searchText' => 'WordPress',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'goodreads' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/goodreads',
    'title' => 'Goodreads',
    'description' => 'Features books from the shelves of your Goodreads account.',
    'keywords' => 
    array (
      0 => 'book',
      1 => 'read',
      2 => 'author',
    ),
    'version' => '1.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\' aria-hidden=\'true\' focusable=\'false\'><path d=\'M19.525 15.977V.49h-2.059v2.906h-.064c-.211-.455-.481-.891-.842-1.307-.36-.412-.767-.777-1.232-1.094-.466-.314-.962-.561-1.519-.736C13.256.09 12.669 0 12.038 0c-1.21 0-2.3.225-3.246.67-.947.447-1.743 1.057-2.385 1.83-.642.773-1.133 1.676-1.47 2.711-.336 1.037-.506 2.129-.506 3.283 0 1.199.141 2.326.425 3.382.286 1.057.737 1.976 1.368 2.762.631.78 1.412 1.397 2.375 1.833.961.436 2.119.661 3.471.661 1.248 0 2.33-.315 3.262-.946s1.638-1.473 2.119-2.525h.061v2.284c0 2.044-.421 3.607-1.264 4.705-.84 1.081-2.224 1.638-4.146 1.638-.572 0-1.128-.061-1.669-.181-.542-.12-1.036-.315-1.487-.57-.437-.271-.827-.601-1.143-1.038-.316-.435-.526-.961-.632-1.593H5.064c.067.887.315 1.654.737 2.3.424.646.961 1.172 1.602 1.593.641.406 1.367.706 2.172.902.811.194 1.639.3 2.494.3 1.383 0 2.541-.195 3.486-.555.947-.376 1.714-.902 2.301-1.608.601-.708 1.021-1.549 1.293-2.556.27-1.007.42-2.134.42-3.367l-.044.062zm-7.484-.557c-.955 0-1.784-.189-2.479-.571-.697-.38-1.277-.882-1.732-1.503-.467-.621-.797-1.332-1.022-2.139s-.332-1.633-.332-2.484c0-.871.105-1.725.301-2.563.21-.84.54-1.587.992-2.24.451-.652 1.037-1.182 1.728-1.584s1.533-.605 2.51-.605 1.803.209 2.495.621c.676.415 1.247.959 1.683 1.634.436.677.751 1.429.947 2.255.195.826.285 1.656.285 2.482 0 .852-.12 1.678-.345 2.484-.226.807-.572 1.518-1.038 2.139-.465.621-1.021 1.123-1.698 1.503-.676.382-1.458.571-2.359.571h.064z\'></path></svg>',
    'supports' => 
    array (
      'html' => false,
      'align' => true,
    ),
    'attributes' => 
    array (
      'bookNumber' => 
      array (
        'type' => 'string',
        'default' => '5',
      ),
      'class' => 
      array (
        'type' => 'string',
      ),
      'customTitle' => 
      array (
        'type' => 'string',
      ),
      'goodreadsId' => 
      array (
        'type' => 'number',
      ),
      'id' => 
      array (
        'type' => 'string',
      ),
      'link' => 
      array (
        'type' => 'string',
      ),
      'orderOption' => 
      array (
        'type' => 'string',
        'default' => 'd',
      ),
      'shelfOption' => 
      array (
        'type' => 'string',
        'default' => 'read',
      ),
      'showAuthor' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showCover' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showRating' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showReview' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'showTags' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'showTitle' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'sortOption' => 
      array (
        'type' => 'string',
        'default' => 'date_added',
      ),
      'style' => 
      array (
        'type' => 'string',
        'default' => 'default',
      ),
      'userInput' => 
      array (
        'type' => 'string',
      ),
      'widgetId' => 
      array (
        'type' => 'number',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'goodreadsId' => 1176283,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'google-calendar' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/google-calendar',
    'title' => 'Google Calendar',
    'description' => 'Embed a Google Calendar.',
    'keywords' => 
    array (
      0 => 'events',
      1 => 'dates',
      2 => 'schedule',
      3 => 'appointments',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 23\' width=\'24\' height=\'23\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M19.5,23h-15c-2.2,0-4-1.8-4-4V4c0-2.2,1.8-4,4-4h15c2.2,0,4,1.8,4,4v15C23.5,21.2,21.7,23,19.5,23z M4.5,2 c-1.1,0-2,0.9-2,2v15c0,1.1,0.9,2,2,2h15c1.1,0,2-0.9,2-2V4c0-1.1-0.9-2-2-2H4.5z M6.9,3.9L6.9,3.9c0.5,0,0.9,0.4,0.9,0.9V5 c0,0.5-0.4,0.9-0.9,0.9l0,0C6.5,5.9,6.1,5.5,6.1,5V4.7C6.1,4.3,6.5,3.9,6.9,3.9z M17,3.9L17,3.9c0.5,0,0.9,0.4,0.9,0.9V5 c0,0.5-0.4,0.9-0.9,0.9l0,0c-0.5,0-0.9-0.4-0.9-0.9V4.7C16.2,4.3,16.5,3.9,17,3.9z M8.8,17.6c1.8,0,3.2-1,3.2-2.4 c0-1.1-0.7-1.8-1.8-1.9v-0.1c0.9-0.2,1.5-0.9,1.5-1.8c0-1.3-1.2-2.2-2.9-2.2c-1.8,0-2.9,1-3,2.5h1.6c0-0.7,0.6-1.1,1.4-1.1 c0.8,0,1.3,0.4,1.3,1.1c0,0.7-0.5,1.1-1.3,1.1h-1v1.3h1c0.9,0,1.5,0.4,1.5,1.1c0,0.7-0.6,1.2-1.4,1.2c-0.9,0-1.4-0.4-1.5-1.1H5.7 C5.8,16.6,7,17.6,8.8,17.6z M17.6,17.4V9.3h-1.7l-2.1,1.4v1.6l2-1.4h0.1v6.4H17.6z\'/></svg>',
    'supports' => 
    array (
      'align' => true,
      'alignWide' => true,
      'html' => false,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
      ),
      'height' => 
      array (
        'type' => 'integer',
        'default' => 600,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'url' => 'https://calendar.google.com/calendar/embed?src=jb4bu80jirp0u11a6niie21pp4%40group.calendar.google.com&ctz=America/New_York',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'google-docs-embed' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/google-docs-embed',
    'title' => 'Google Docs (Beta)',
    'description' => 'Embed a Google Document.',
    'keywords' => 
    array (
      0 => 'document',
      1 => 'gsuite',
      2 => 'doc',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 64 88\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M58,88H6c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h36l22,22v60C64,85.3,61.3,88,58,88z\' /><path fill=\'#FDFFFF\' d=\'M42,0l22,22H42V0z\' /><path fill=\'#FDFFFF\' d=\'M50,39H14v-5h36V39z M50,46H14v5h36V46z M40,58H14v5h26V58z\' /></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'left',
        1 => 'right',
        2 => 'center',
        3 => 'wide',
        4 => 'full',
      ),
      'anchor' => true,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
        'default' => '',
      ),
      'aspectRatio' => 
      array (
        'type' => 'string',
      ),
      'variation' => 
      array (
        'type' => 'string',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'image-compare' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/image-compare',
    'title' => 'Image Compare',
    'description' => 'Compare two images with a slider. Works best with images of the same size.',
    'keywords' => 
    array (
      0 => 'juxtapose',
      1 => 'photos',
      2 => 'pictures',
      3 => 'side by side',
      4 => 'slider',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'media',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M21 4h-6v1.5h6c.3 0 .5.2.5.5v.4l-3.6 3.5L15 8.1v1.8l2.6 1.7c.1.1.3.1.4.1.2 0 .4-.1.5-.2l3-2.9V18c0 .3-.2.5-.5.5h-6V20h6c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM1 6v12c0 1.1.9 2 2 2h10.5V4H3c-1.1 0-2 .9-2 2zm11 12.5H3c-.3 0-.5-.2-.5-.5v-1.4L5 14.7l1.5-1.1.1-.1 3 1.9c.1.1.3.1.4.1.2 0 .4-.1.5-.2L12 14v4.5zm0-6.6l-2.1 2L7 12c-.1-.1-.3-.1-.4-.1h-.1c-.1 0-.3.1-.4.1l-1.1.9-2.5 1.8V6c0-.3.2-.5.5-.5h9v6.4z\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
    ),
    'attributes' => 
    array (
      'imageBefore' => 
      array (
        'type' => 'object',
        'default' => 
        array (
        ),
      ),
      'imageAfter' => 
      array (
        'type' => 'object',
        'default' => 
        array (
        ),
      ),
      'caption' => 
      array (
        'type' => 'string',
      ),
      'orientation' => 
      array (
        'type' => 'string',
        'default' => 'horizontal',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'instagram-gallery' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/instagram-gallery',
    'title' => 'Latest Instagram Posts',
    'description' => 'Display an automatically updating list of the latest posts from your Instagram feed.',
    'keywords' => 
    array (
      0 => 'images',
      1 => 'photos',
      2 => 'pictures',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M12 4.622c2.403 0 2.688.01 3.637.052.877.04 1.354.187 1.67.31.42.163.72.358 1.036.673.315.315.51.615.673 1.035.123.317.27.794.31 1.67.043.95.052 1.235.052 3.638s-.01 2.688-.052 3.637c-.04.877-.187 1.354-.31 1.67-.163.42-.358.72-.673 1.036-.315.315-.615.51-1.035.673-.317.123-.794.27-1.67.31-.95.043-1.234.052-3.638.052s-2.688-.01-3.637-.052c-.877-.04-1.354-.187-1.67-.31-.42-.163-.72-.358-1.036-.673-.315-.315-.51-.615-.673-1.035-.123-.317-.27-.794-.31-1.67-.043-.95-.052-1.235-.052-3.638s.01-2.688.052-3.637c.04-.877.187-1.354.31-1.67.163-.42.358-.72.673-1.036.315-.315.615-.51 1.035-.673.317-.123.794-.27 1.67-.31.95-.043 1.235-.052 3.638-.052M12 3c-2.444 0-2.75.01-3.71.054s-1.613.196-2.185.418c-.592.23-1.094.538-1.594 1.04-.5.5-.807 1-1.037 1.593-.223.572-.375 1.226-.42 2.184C3.01 9.25 3 9.555 3 12s.01 2.75.054 3.71.196 1.613.418 2.186c.23.592.538 1.094 1.038 1.594s1.002.808 1.594 1.038c.572.222 1.227.375 2.185.418.96.044 1.266.054 3.71.054s2.75-.01 3.71-.054 1.613-.196 2.186-.418c.592-.23 1.094-.538 1.594-1.038s.808-1.002 1.038-1.594c.222-.572.375-1.227.418-2.185.044-.96.054-1.266.054-3.71s-.01-2.75-.054-3.71-.196-1.613-.418-2.186c-.23-.592-.538-1.094-1.038-1.594s-1.002-.808-1.594-1.038c-.572-.222-1.227-.375-2.185-.418C14.75 3.01 14.445 3 12 3zm0 4.378c-2.552 0-4.622 2.07-4.622 4.622s2.07 4.622 4.622 4.622 4.622-2.07 4.622-4.622S14.552 7.378 12 7.378zM12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm4.804-8.884c-.596 0-1.08.484-1.08 1.08s.484 1.08 1.08 1.08c.596 0 1.08-.484 1.08-1.08s-.483-1.08-1.08-1.08z\'></path></svg>',
    'supports' => 
    array (
      'align' => true,
      'html' => false,
    ),
    'attributes' => 
    array (
      'accessToken' => 
      array (
        'type' => 'string',
      ),
      'instagramUser' => 
      array (
        'type' => 'string',
      ),
      'columns' => 
      array (
        'type' => 'number',
        'default' => 3,
        'min' => 1,
        'max' => 6,
      ),
      'count' => 
      array (
        'type' => 'number',
        'default' => 9,
        'min' => 1,
        'max' => 30,
      ),
      'spacing' => 
      array (
        'type' => 'number',
        'default' => 10,
        'min' => 0,
        'max' => 50,
      ),
      'isStackedOnMobile' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'like' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/like',
    'title' => 'Like',
    'description' => 'Give your readers the ability to show appreciation for your posts.',
    'keywords' => 
    array (
      0 => 'like',
      1 => 'likes',
      2 => 'thumbs up',
      3 => 'button',
      4 => 'heart',
    ),
    'version' => '1.0.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path fill-rule=\'evenodd\' d=\'M9.706 8.646a.25.25 0 01-.188.137l-4.626.672a.25.25 0 00-.139.427l3.348 3.262a.25.25 0 01.072.222l-.79 4.607a.25.25 0 00.362.264l4.138-2.176a.25.25 0 01.233 0l4.137 2.175a.25.25 0 00.363-.263l-.79-4.607a.25.25 0 01.072-.222l3.347-3.262a.25.25 0 00-.139-.427l-4.626-.672a.25.25 0 01-.188-.137l-2.069-4.192a.25.25 0 00-.448 0L9.706 8.646zM12 7.39l-.948 1.921a1.75 1.75 0 01-1.317.957l-2.12.308 1.534 1.495c.412.402.6.982.503 1.55l-.362 2.11 1.896-.997a1.75 1.75 0 011.629 0l1.895.997-.362-2.11a1.75 1.75 0 01.504-1.55l1.533-1.495-2.12-.308a1.75 1.75 0 01-1.317-.957L12 7.39z\' clip-rule=\'evenodd\'></path></svg>',
    'usesContext' => 
    array (
      0 => 'postId',
    ),
    'attributes' => 
    array (
      'showReblogButton' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'showAvatars' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'mailchimp' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/mailchimp',
    'title' => 'Mailchimp',
    'description' => 'Allow readers to join a Mailchimp audience.',
    'keywords' => 
    array (
      0 => 'email',
      1 => 'subscription',
      2 => 'newsletter',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m16.88,11.25c.17-.02.34-.02.49,0,.09-.2.1-.55.02-.93-.12-.57-.28-.91-.61-.86-.33.05-.34.46-.22,1.03.07.32.19.59.32.76\'/><path d=\'m14.03,11.7c.24.1.38.17.44.11.04-.04.03-.11-.03-.2-.12-.19-.36-.38-.61-.49-.52-.22-1.14-.15-1.62.19-.16.12-.31.28-.29.37,0,.03.03.06.09.06.13.01.59-.22,1.11-.25.37-.02.68.09.92.2\'/><path d=\'m13.56,11.97c-.31.05-.48.15-.59.25-.09.08-.15.17-.15.23,0,.03.01.05.02.06.01.01.03.02.05.02.07,0,.23-.06.23-.06.43-.15.71-.13.99-.1.16.02.23.03.26-.03.01-.02.02-.05,0-.1-.07-.12-.38-.32-.81-.26\'/><path d=\'m15.92,12.97c.21.1.44.06.52-.09s-.03-.36-.24-.46c-.21-.1-.44-.06-.52.09-.08.15.03.36.24.46\'/><path d=\'m17.26,11.79c-.17,0-.31.18-.32.42s.13.42.3.43.31-.18.32-.42c0-.23-.13-.42-.3-.43\'/><path d=\'m5.83,16c-.04-.05-.11-.04-.18-.02-.05.01-.1.02-.16.02-.13,0-.23-.06-.29-.15-.08-.12-.07-.3.01-.5l.04-.09c.14-.31.36-.82.11-1.31-.19-.37-.51-.6-.89-.64-.36-.05-.74.09-.98.35-.38.42-.44.98-.36,1.18.03.07.07.09.1.1.06,0,.16-.04.22-.2l.02-.05c.03-.08.08-.24.16-.37.1-.15.25-.26.43-.29.18-.04.37,0,.52.1.26.17.37.5.25.8-.06.16-.15.46-.13.72.04.51.35.71.63.73.27.01.46-.14.51-.25.03-.07,0-.11-.01-.12\'/><path d=\'m8.42,6.69c.89-1.03,1.98-1.92,2.96-2.42.03-.02.07.02.05.05-.08.14-.23.44-.28.67,0,.04.03.06.06.04.61-.42,1.67-.86,2.6-.92.04,0,.06.05.03.07-.14.11-.3.26-.41.41-.02.03,0,.06.03.06.65,0,1.57.23,2.17.57.04.02.01.1-.03.09-.91-.21-2.4-.37-3.94.01-1.38.34-2.43.86-3.2,1.41-.04.03-.09-.02-.05-.06h0Zm4.43,9.95h0s0,0,0,0h0Zm3.67.43s.04-.04.04-.07c0-.04-.04-.06-.07-.06,0,0-1.9.28-3.69-.38.2-.63.71-.41,1.5-.34,1.41.08,2.68-.12,3.62-.39.81-.23,1.88-.69,2.71-1.35.28.61.38,1.29.38,1.29,0,0,.22-.04.4.07.17.11.3.32.21.89-.17,1.05-.62,1.91-1.38,2.7-.46.49-1.02.92-1.65,1.24-.34.18-.7.33-1.08.46-2.84.93-5.75-.09-6.69-2.28-.07-.16-.14-.34-.19-.52-.4-1.44-.06-3.17,1-4.27h0c.07-.07.13-.15.13-.25,0-.09-.05-.18-.1-.24-.37-.54-1.66-1.45-1.4-3.23.19-1.27,1.3-2.17,2.34-2.12l.26.02c.45.03.84.08,1.21.1.62.03,1.18-.06,1.84-.61.22-.19.4-.35.7-.4.03,0,.11-.03.27-.03.16,0,.31.05.45.14.53.35.6,1.21.63,1.83.02.36.06,1.22.07,1.47.03.57.18.65.48.75.17.06.33.1.56.16.7.2,1.12.4,1.38.65.16.16.23.33.25.49.08.6-.47,1.35-1.93,2.03-1.59.74-3.53.93-4.87.78l-.47-.05c-1.07-.14-1.68,1.24-1.04,2.18.41.61,1.54,1.01,2.67,1.01,2.58,0,4.57-1.1,5.31-2.06l.06-.08c.04-.05,0-.08-.04-.05-.6.41-3.28,2.05-6.15,1.56,0,0-.35-.06-.67-.18-.25-.1-.78-.34-.85-.88,2.31.72,3.77.04,3.77.04h0ZM3.8,11.57c-.8.16-1.51.61-1.95,1.24-.26-.22-.74-.63-.83-.8-.69-1.31.76-3.87,1.77-5.32C5.3,3.13,9.21.43,11.02.92c.29.08,1.27,1.21,1.27,1.21,0,0-1.81,1.01-3.49,2.41-2.26,1.74-3.97,4.28-5,7.03h0Zm1.35,6.03c-.12.02-.25.03-.37.03-1.21-.03-2.52-1.12-2.65-2.42-.14-1.43.59-2.53,1.88-2.79.15-.03.34-.05.54-.04.72.04,1.79.6,2.04,2.17.22,1.4-.13,2.82-1.44,3.04h0Zm16.4-2.53s-.08-.28-.17-.58c-.09-.3-.19-.51-.19-.51.37-.56.38-1.06.33-1.34-.05-.35-.2-.65-.49-.96-.29-.31-.89-.62-1.74-.86l-.44-.12s-.02-1.04-.04-1.48c-.01-.32-.04-.82-.2-1.31-.18-.66-.5-1.24-.9-1.61,1.1-1.14,1.79-2.4,1.79-3.48,0-2.08-2.56-2.71-5.7-1.4l-.67.28s-1.2-1.18-1.22-1.2C8.33-2.63-2.89,9.84.7,12.86l.78.66c-.2.53-.28,1.13-.22,1.78.08.83.51,1.63,1.21,2.25.66.59,1.53.96,2.37.96,1.4,3.21,4.58,5.19,8.32,5.3,4.01.12,7.37-1.76,8.78-5.14.09-.24.48-1.31.48-2.25s-.54-1.34-.88-1.34\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'color' => 
      array (
        'gradients' => true,
      ),
      'spacing' => 
      array (
        'padding' => true,
        'margin' => true,
      ),
    ),
    'attributes' => 
    array (
      'emailPlaceholder' => 
      array (
        'type' => 'string',
      ),
      'consentText' => 
      array (
        'type' => 'string',
      ),
      'interests' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'processingLabel' => 
      array (
        'type' => 'string',
      ),
      'signupFieldTag' => 
      array (
        'type' => 'string',
      ),
      'signupFieldValue' => 
      array (
        'type' => 'string',
      ),
      'successLabel' => 
      array (
        'type' => 'string',
      ),
      'errorLabel' => 
      array (
        'type' => 'string',
      ),
      'preview' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'preview' => true,
      ),
      'innerBlocks' => 
      array (
        0 => 
        array (
          'name' => 'jetpack/button',
          'attributes' => 
          array (
            'element' => 'button',
            'text' => 'Join my Mailchimp audience',
            'uniqueId' => 'mailchimp-widget-id',
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'map' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/map',
    'title' => 'Map',
    'description' => 'Add an interactive map showing one or more locations.',
    'keywords' => 
    array (
      0 => 'maps',
      1 => 'location',
      2 => 'navigation',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path fill=\'none\' d=\'M0 0h24v24H0V0z\' /><path d=\'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM10 5.47l4 1.4v11.66l-4-1.4V5.47zm-5 .99l3-1.01v11.7l-3 1.16V6.46zm14 11.08l-3 1.01V6.86l3-1.16v11.84z\' /></svg>',
    'supports' => 
    array (
      'defaultStylePicker' => false,
      'html' => false,
    ),
    'attributes' => 
    array (
      'align' => 
      array (
        'type' => 'string',
      ),
      'points' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'address' => 
      array (
        'type' => 'string',
        'default' => '',
      ),
      'mapDetails' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'zoom' => 
      array (
        'type' => 'integer',
        'default' => 13,
      ),
      'mapCenter' => 
      array (
        'type' => 'object',
        'default' => 
        array (
          'longitude' => -122.41941550000001,
          'latitude' => 37.7749295,
        ),
      ),
      'markerColor' => 
      array (
        'type' => 'string',
        'default' => 'red',
      ),
      'scrollToZoom' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'mapHeight' => 
      array (
        'type' => 'integer',
      ),
      'showFullscreenButton' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
    ),
    'example' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'markdown' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/markdown',
    'title' => 'Markdown',
    'description' => 'Add headings, lists, or links to plain text with ease.',
    'keywords' => 
    array (
      0 => 'formatting',
      1 => 'syntax',
      2 => 'markup',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'text',
    'icon' => '<svg viewBox=\'0 0 208 128\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><rect width=\'198\' height=\'118\' x=\'5\' y=\'5\' ry=\'10\' stroke=\'currentColor\' strokeWidth=\'10\' fill=\'none\' /><path d=\'M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z\' />',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'html' => false,
      'spacing' => 
      array (
        'padding' => true,
        'margin' => true,
        '__experimentalDefaultControls' => 
        array (
          'padding' => true,
          'margin' => true,
        ),
      ),
    ),
    'attributes' => 
    array (
      'source' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'source' => '## ## Try Markdown

Markdown is a text formatting syntax that is converted into HTML. You can _emphasize_ text or **make it strong** with just a few characters.',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'nextdoor' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/nextdoor',
    'title' => 'Nextdoor',
    'description' => 'Embed a Nextdoor post for your neighbors on your blog.',
    'keywords' => 
    array (
      0 => 'neighbor',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg height=\'24\' width=\'24\' viewBox=\'0 0 130 130\' xmlns=\'http://www.w3.org/2000/svg\'><g><path d=\'M64.25 3.531c-31.144.337-57.596 24.22-60.469 55.907-3.064 33.799 21.857 63.685 55.657 66.75 33.799 3.064 63.685-21.857 66.75-55.657 3.064-33.8-21.857-63.686-55.657-66.75a62.075 62.075 0 00-6.281-.25zm3.938 34.907C82.468 38.438 93.5 48.58 93.5 61.5v27c0 .685-.565 1.25-1.25 1.25H80.906a1.267 1.267 0 01-1.25-1.25V63.375c0-5.58-4.309-11.938-11.469-11.938-7.47 0-11.468 6.358-11.468 11.938V88.5c0 .685-.565 1.25-1.25 1.25H44.125c-.68 0-1.219-.57-1.219-1.25V64.156c0-.74-.529-1.364-1.25-1.531-13.13-2.93-15.115-10.285-15.375-21.125-.005-.332.142-.67.375-.906.233-.237.543-.375.875-.375l11.688.062c.66.01 1.187.529 1.218 1.188.13 4.44.438 9.406 4.438 9.406.83 0 1.443-1.179 1.813-1.719 4.41-6.48 12.28-10.718 21.5-10.718z\'/></g></svg>',
    'supports' => 
    array (
      'align' => true,
      'alignWide' => true,
      'html' => false,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'opentable' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/opentable',
    'title' => 'OpenTable',
    'description' => 'Book a reservation with OpenTable.',
    'keywords' => 
    array (
      0 => 'booking',
      1 => 'reservation',
      2 => 'restaurant',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 22 16\' width=\'22\' height=\'16\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m1.997 5.982c-.39457-.00039-.7804.11622-1.108699.33511-.328295.21888-.584312.5302-.735674.89459-.15136174.36439-.1912714.76548-.1146819 1.15254.0765899.38707.2662379.74274.5449639 1.02202.278726.27929.634011.46965 1.020921.54702.38692.07732.78809.03826 1.15278-.11238.36469-.15063.67652-.40602.89606-.73387.21954-.32786.33693-.71345.33733-1.10803v-.002c.001-1.1-.89-1.994-1.992-1.995zm12.006 3.988c-.3946.0004-.7805-.11625-1.1088-.33517-.3283-.21893-.5843-.53031-.7357-.89476-.1513-.36444-.1912-.76558-.1145-1.15268s.2664-.74276.5453-1.022c.2788-.27925.6342-.46953 1.0211-.54679.387-.07725.7882-.038 1.1529.11278.3647.15079.6764.40634.8959.73432.2194.32799.3366.71369.3368 1.1083v.003c.0003.52814-.2092 1.03477-.5824 1.4085s-.8795.58397-1.4076.5845zm0-9.96999843c-1.5777-.0009886-3.1203.46588743-4.43262 1.34158843-1.31236.8757-2.33558 2.1209-2.94025 3.57813-.60467 1.45722-.76365 3.06103-.45683 4.60861.30683 1.54757 1.06567 2.96947 2.18058 4.08577 1.1149 1.1163 2.53582 1.8769 4.08302 2.1856 1.5472.3088 3.1512.1518 4.6091-.451 1.458-.6028 2.7045-1.6245 3.5819-2.9358.8773-1.3112 1.3461-2.8532 1.3471-4.4309v-.005c.0008-2.11466-.8384-4.14304-2.3331-5.63899-1.4946-1.495952-3.5222-2.3369478-5.6369-2.33800843z\' /></svg>',
    'supports' => 
    array (
      'align' => true,
      'html' => false,
    ),
    'attributes' => 
    array (
      'rid' => 
      array (
        'default' => 
        array (
        ),
        'type' => 'array',
      ),
      'style' => 
      array (
        'default' => 'standard',
        'type' => 'string',
        'enum' => 
        array (
          0 => 'button',
          1 => 'standard',
          2 => 'wide',
          3 => 'tall',
        ),
      ),
      'iframe' => 
      array (
        'default' => true,
        'type' => 'boolean',
      ),
      'domain' => 
      array (
        'default' => 'com',
        'type' => 'string',
      ),
      'lang' => 
      array (
        'default' => 'en-US',
        'type' => 'string',
        'enum' => 
        array (
          0 => 'en-US',
          1 => 'fr-CA',
          2 => 'de-DE',
          3 => 'es-MX',
          4 => 'ja-JP',
          5 => 'nl-NL',
          6 => 'it-IT',
        ),
      ),
      'newtab' => 
      array (
        'default' => false,
        'type' => 'boolean',
      ),
      'negativeMargin' => 
      array (
        'default' => false,
        'type' => 'boolean',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'rid' => 
        array (
          0 => '1',
        ),
        'style' => 'standard',
        'iframe' => true,
        'domain' => 'com',
        'lang' => 'en-US',
        'newtab' => false,
        'negativeMargin' => false,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'payment-buttons' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/payment-buttons',
    'title' => 'Payment Buttons',
    'description' => 'Sell products and subscriptions.',
    'keywords' => 
    array (
      0 => 'buy',
      1 => 'contribution',
      2 => 'commerce',
      3 => 'credit card',
      4 => 'debit card',
      5 => 'donate',
      6 => 'Donations',
      7 => 'earn',
      8 => 'monetize',
      9 => 'ecommerce',
      10 => 'gofundme',
      11 => 'memberships',
      12 => 'money',
      13 => 'paid',
      14 => 'patreon',
      15 => 'pay',
      16 => 'payments',
      17 => 'products',
      18 => 'purchase',
      19 => 'recurring',
      20 => 'sell',
      21 => 'shop',
      22 => 'stripe',
      23 => 'subscribe',
      24 => 'subscriptions',
      25 => 'sponsor',
      26 => 'square',
      27 => 'toast',
      28 => 'venmo',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M20 4H4c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zm0 2v2H4V6h16zM4 18v-6h16v6H4zm2-4h7v2H6v-2zm9 0h3v2h-3v-2z\'/></svg>',
    'supports' => 
    array (
      '__experimentalExposeControlsToChildren' => true,
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'spacing' => 
      array (
        'blockGap' => true,
        'margin' => 
        array (
          0 => 'vertical',
        ),
        '__experimentalDefaultControls' => 
        array (
          'blockGap' => true,
        ),
      ),
      'layout' => 
      array (
        'allowSwitching' => false,
        'allowInheriting' => false,
        'default' => 
        array (
          'type' => 'flex',
        ),
      ),
      'typography' => 
      array (
        'fontSize' => true,
        '__experimentalFontFamily' => true,
        '__experimentalTextTransform' => true,
        '__experimentalDefaultControls' => 
        array (
          'fontSize' => true,
        ),
      ),
    ),
    'attributes' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'payments-intro' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/payments-intro',
    'title' => 'Payments',
    'description' => 'Sell products and services or receive donations on your website.',
    'keywords' => 
    array (
      0 => 'earn',
      1 => 'monetize',
      2 => 'paid',
      3 => 'pay',
      4 => 'money',
      5 => 'checkout',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' width=\'24\' height=\'24\'><path d=\'M3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zm-1.338 4.877c-.314.22-.412.452-.412.623 0 .171.098.403.412.623.312.218.783.377 1.338.377.825 0 1.605.233 2.198.648.59.414 1.052 1.057 1.052 1.852 0 .795-.461 1.438-1.052 1.852-.41.286-.907.486-1.448.582v.316a.75.75 0 01-1.5 0v-.316a3.64 3.64 0 01-1.448-.582c-.59-.414-1.052-1.057-1.052-1.852a.75.75 0 011.5 0c0 .171.098.403.412.623.312.218.783.377 1.338.377s1.026-.159 1.338-.377c.314-.22.412-.452.412-.623 0-.171-.098-.403-.412-.623-.312-.218-.783-.377-1.338-.377-.825 0-1.605-.233-2.198-.648-.59-.414-1.052-1.057-1.052-1.852 0-.795.461-1.438 1.052-1.852a3.64 3.64 0 011.448-.582V7.5a.75.75 0 011.5 0v.316c.54.096 1.039.296 1.448.582.59.414 1.052 1.057 1.052 1.852a.75.75 0 01-1.5 0c0-.171-.098-.403-.412-.623-.312-.218-.783-.377-1.338-.377s-1.026.159-1.338.377z\'></path></svg>',
    'supports' => 
    array (
      'alignWide' => false,
      'className' => true,
      'customClassName' => false,
      'html' => false,
      'reusable' => false,
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'paywall' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/paywall',
    'title' => 'Paywall',
    'description' => 'Limit access to the content below this block to chosen subscribers.',
    'keywords' => 
    array (
      0 => 'earn',
      1 => 'monetize',
      2 => 'more',
      3 => 'email',
      4 => 'follow',
      5 => 'gated',
      6 => 'memberships',
      7 => 'newsletter',
      8 => 'signin',
      9 => 'subscribe',
      10 => 'subscription',
      11 => 'subscriptions',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M4 16.7134L20 16.7134V15.106H4V16.7134Z\' /><path d=\'M16 21H20V19.3925H16V21Z\' /><path d=\'M14 21H10V19.3925H14V21Z\' /><path d=\'M4 21H8V19.3925H4V21Z\' /><path d=\'M11.471 6.37162C11.2294 6.55286 11.1538 6.74395 11.1538 6.88519C11.1538 7.02644 11.2294 7.21752 11.471 7.39877C11.7108 7.57865 12.0728 7.70953 12.5 7.70953C13.1349 7.70953 13.7344 7.90158 14.1907 8.24382C14.6451 8.5847 15 9.11491 15 9.77039C15 10.4259 14.6451 10.9561 14.1907 11.297C13.8758 11.5331 13.4928 11.6978 13.0769 11.7771V12.0373C13.0769 12.3788 12.8186 12.6556 12.5 12.6556C12.1814 12.6556 11.9231 12.3788 11.9231 12.0373V11.7771C11.5072 11.6978 11.1242 11.5331 10.8093 11.297C10.3549 10.9561 10 10.4259 10 9.77039C10 9.42893 10.2583 9.15213 10.5769 9.15213C10.8955 9.15213 11.1538 9.42893 11.1538 9.77039C11.1538 9.91163 11.2294 10.1027 11.471 10.284C11.7108 10.4638 12.0728 10.5947 12.5 10.5947C12.9272 10.5947 13.2892 10.4638 13.529 10.284C13.7706 10.1027 13.8462 9.91163 13.8462 9.77039C13.8462 9.62914 13.7706 9.43806 13.529 9.25681C13.2892 9.07693 12.9272 8.94605 12.5 8.94605C11.8651 8.94605 11.2656 8.754 10.8093 8.41176C10.3549 8.07089 10 7.54067 10 6.88519C10 6.22971 10.3549 5.6995 10.8093 5.35863C11.1242 5.12246 11.5072 4.95781 11.9231 4.87844V4.61826C11.9231 4.2768 12.1814 4 12.5 4C12.8186 4 13.0769 4.2768 13.0769 4.61826V4.87844C13.4928 4.95781 13.8758 5.12246 14.1907 5.35863C14.6451 5.6995 15 6.22971 15 6.88519C15 7.22665 14.7417 7.50345 14.4231 7.50345C14.1045 7.50345 13.8462 7.22665 13.8462 6.88519C13.8462 6.74395 13.7706 6.55286 13.529 6.37162C13.2892 6.19174 12.9272 6.06085 12.5 6.06085C12.0728 6.06085 11.7108 6.19174 11.471 6.37162Z\' /></svg>',
    'supports' => 
    array (
      'customClassName' => false,
      'html' => false,
      'multiple' => false,
    ),
    'parent' => 
    array (
      0 => 'core/post-content',
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'pinterest' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/pinterest',
    'title' => 'Pinterest',
    'description' => 'Embed a Pinterest pin, board, or user.',
    'keywords' => 
    array (
      0 => 'social',
      1 => 'pinboard',
      2 => 'pins',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M12,2C6.477,2,2,6.477,2,12c0,4.236,2.636,7.855,6.356,9.312c-0.087-0.791-0.166-2.005,0.035-2.869c0.182-0.78,1.173-4.971,1.173-4.971s-0.299-0.599-0.299-1.484c0-1.39,0.806-2.429,1.809-2.429c0.853,0,1.265,0.641,1.265,1.409c0,0.858-0.546,2.141-0.828,3.329c-0.236,0.996,0.499,1.807,1.481,1.807c1.777,0,3.144-1.874,3.144-4.579c0-2.394-1.72-4.068-4.177-4.068c-2.845,0-4.515,2.134-4.515,4.34c0,0.859,0.331,1.781,0.744,2.282c0.082,0.099,0.094,0.186,0.069,0.287C8.18,14.682,8.011,15.361,7.978,15.5c-0.044,0.183-0.145,0.222-0.334,0.134c-1.249-0.581-2.03-2.407-2.03-3.874c0-3.154,2.292-6.051,6.607-6.051c3.469,0,6.165,2.472,6.165,5.775c0,3.446-2.173,6.22-5.189,6.22c-1.013,0-1.966-0.526-2.292-1.148c0,0-0.501,1.909-0.623,2.377c-0.226,0.869-0.835,1.957-1.243,2.622C9.975,21.844,10.969,22,12,22c5.523,0,10-4.477,10-10C22,6.477,17.523,2,12,2z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'align' => false,
      'inserter' => false,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'url' => 'https://pinterest.com/anapinskywalker/',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'podcast-player' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/podcast-player',
    'title' => 'Podcast Player',
    'description' => 'Select and play episodes from a single podcast.',
    'keywords' => 
    array (
      0 => 'audio',
      1 => 'embed',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m22,6h-5v8.18c-.31-.11-.65-.18-1-.18-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3v-9h3v-2h0Zm-7,0H3v2h12v-2h0Zm0,4H3v2h12v-2h0Zm-4,4H3v2h8v-2h0Zm4,3c0-.55.45-1,1-1s1,.45,1,1-.45,1-1,1-1-.45-1-1Z\' /></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'spacing' => 
      array (
        'padding' => true,
        'margin' => true,
      ),
      'anchor' => false,
      'customClassName' => true,
      'className' => true,
      'html' => false,
      'multiple' => true,
      'reusable' => true,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
      ),
      'selectedEpisodes' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'itemsToShow' => 
      array (
        'type' => 'integer',
        'default' => 5,
      ),
      'showCoverArt' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showEpisodeTitle' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'showEpisodeDescription' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'primaryColor' => 
      array (
        'type' => 'string',
      ),
      'customPrimaryColor' => 
      array (
        'type' => 'string',
      ),
      'hexPrimaryColor' => 
      array (
        'type' => 'string',
      ),
      'secondaryColor' => 
      array (
        'type' => 'string',
      ),
      'customSecondaryColor' => 
      array (
        'type' => 'string',
      ),
      'hexSecondaryColor' => 
      array (
        'type' => 'string',
      ),
      'backgroundColor' => 
      array (
        'type' => 'string',
      ),
      'customBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'hexBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'exampleFeedData' => 
      array (
        'type' => 'object',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'customPrimaryColor' => 'GREEN',
        'hexPrimaryColor' => 'GREEN',
        'exampleFeedData' => 
        array (
          'title' => 'Jetpack Example Podcast',
          'link' => 'https://jetpack.com',
          'cover' => 'https://jetpackme.files.wordpress.com/2020/05/jetpack-example-podcast-cover.png?w=160',
          'tracks' => 
          array (
            0 => 
            array (
              'id' => '3',
              'title' => '3. Our third episode',
              'duration' => '14:58',
            ),
            1 => 
            array (
              'id' => '2',
              'title' => '2. Interview with a special guest',
              'duration' => '19:17',
            ),
            2 => 
            array (
              'id' => '1',
              'title' => '1. Welcome to Example Podcast',
              'duration' => '11:25',
            ),
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'premium-content' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'premium-content/container',
    'title' => 'Paid Content',
    'description' => 'Restrict access to your content for paying subscribers.',
    'keywords' => 
    array (
      0 => 'buy',
      1 => 'credit card',
      2 => 'debit card',
      3 => 'monetize',
      4 => 'earn',
      5 => 'exclusive',
      6 => 'gated',
      7 => 'gofundme',
      8 => 'memberships',
      9 => 'money',
      10 => 'newsletter',
      11 => 'paid',
      12 => 'patreon',
      13 => 'pay',
      14 => 'payments',
      15 => 'paywall',
      16 => 'premium content',
      17 => 'purchase',
      18 => 'recurring',
      19 => 'repeat',
      20 => 'signin',
      21 => 'stripe',
      22 => 'subscribe',
      23 => 'subscriptions',
      24 => 'support',
      25 => 'sponsor',
      26 => 'square',
      27 => 'toast',
      28 => 'venmo',
      29 => 'stripe',
      30 => 'substack',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m12.74,14.43l-4.1-1.26-.13.71-.42,6.87c-.03.49.52.81.93.54l3.72-2.48,4,2.51c.42.26.96-.07.92-.56l-.64-6.87v-.71l-4.28,1.26Z\'/><path d=\'m12.74,15.14c-3.55,0-6.44-2.89-6.44-6.44s2.89-6.44,6.44-6.44,6.44,2.89,6.44,6.44-2.89,6.44-6.44,6.44Zm0-11.89c-3,0-5.44,2.44-5.44,5.44s2.44,5.44,5.44,5.44,5.44-2.44,5.44-5.44-2.44-5.44-5.44-5.44Z\'/><path d=\'M11.95 11.08 9.36 8.48 10.06 7.77 11.95 9.66 15.42 6.19 16.13 6.9 11.95 11.08z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
    ),
    'providesContext' => 
    array (
      'premium-content/planIds' => 'selectedPlanIds',
      'premium-content/isPreview' => 'isPreview',
      'isPremiumContentChild' => 'isPremiumContentChild',
    ),
    'attributes' => 
    array (
      'selectedPlanIds' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'isPreview' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'isPremiumContentChild' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'isPreview' => true,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'rating-star' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/rating-star',
    'title' => 'Star Rating',
    'description' => 'Rate movies, books, songs, recipes — anything you can put a number on.',
    'keywords' => 
    array (
      0 => 'star',
      1 => 'rating',
      2 => 'review',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'widgets',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
    ),
    'styles' => 
    array (
      0 => 
      array (
        'name' => 'filled',
        'label' => 'Filled',
        'isDefault' => true,
      ),
      1 => 
      array (
        'name' => 'outlined',
        'label' => 'Outlined',
      ),
    ),
    'attributes' => 
    array (
      'rating' => 
      array (
        'type' => 'number',
        'default' => 1,
      ),
      'maxRating' => 
      array (
        'type' => 'number',
        'default' => 5,
      ),
      'color' => 
      array (
        'type' => 'string',
      ),
      'ratingStyle' => 
      array (
        'type' => 'string',
        'default' => 'star',
      ),
      'className' => 
      array (
        'type' => 'string',
      ),
      'align' => 
      array (
        'type' => 'string',
        'default' => 'left',
      ),
    ),
    'example' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'recipe' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/recipe',
    'title' => 'Recipe (Beta)',
    'description' => 'Add images, ingredients and cooking steps to display an easy to read recipe.',
    'keywords' => 
    array (
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'widgets',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z\' /><path d=\'M17.5,10.5c0.88,0,1.73,0.09,2.5,0.26V9.24C19.21,9.09,18.36,9,17.5,9c-1.7,0-3.24,0.29-4.5,0.83v1.66 C14.13,10.85,15.7,10.5,17.5,10.5z\' /><path d=\'M13,12.49v1.66c1.13-0.64,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26V11.9c-0.79-0.15-1.64-0.24-2.5-0.24 C15.8,11.66,14.26,11.96,13,12.49z\' /><path d=\'M17.5,14.33c-1.7,0-3.24,0.29-4.5,0.83v1.66c1.13-0.64,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26v-1.52 C19.21,14.41,18.36,14.33,17.5,14.33z\' /></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'full',
        1 => 'wide',
      ),
      'alignWide' => true,
      'anchor' => false,
      'customClassName' => true,
      'className' => true,
      'html' => false,
      'multiple' => true,
      'reusable' => true,
    ),
    'attributes' => 
    array (
      'ingredients' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'steps' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'recurring-payments' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/recurring-payments',
    'title' => 'Payment Button',
    'description' => 'Button allowing you to sell products and subscriptions.',
    'keywords' => 
    array (
      0 => 'buy',
      1 => 'contribution',
      2 => 'commerce',
      3 => 'credit card',
      4 => 'debit card',
      5 => 'donate',
      6 => 'Donations',
      7 => 'monetize',
      8 => 'earn',
      9 => 'ecommerce',
      10 => 'gofundme',
      11 => 'memberships',
      12 => 'money',
      13 => 'paid',
      14 => 'patreon',
      15 => 'pay',
      16 => 'payments',
      17 => 'products',
      18 => 'purchase',
      19 => 'recurring',
      20 => 'sell',
      21 => 'shop',
      22 => 'stripe',
      23 => 'subscribe',
      24 => 'subscriptions',
      25 => 'sponsor',
      26 => 'square',
      27 => 'toast',
      28 => 'venmo',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M20 4H4c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2zm0 2v2H4V6h16zM4 18v-6h16v6H4zm2-4h7v2H6v-2zm9 0h3v2h-3v-2z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      '__experimentalExposeControlsToChildren' => true,
    ),
    'usesContext' => 
    array (
      0 => 'isPremiumContentChild',
    ),
    'providesContext' => 
    array (
      'jetpack/parentBlockWidth' => 'width',
    ),
    'attributes' => 
    array (
      'planId' => 
      array (
        'type' => 'integer',
      ),
      'planIds' => 
      array (
        'type' => 'array',
      ),
      'align' => 
      array (
        'type' => 'string',
      ),
      'url' => 
      array (
        'type' => 'string',
        'default' => '#',
      ),
      'uniqueId' => 
      array (
        'type' => 'string',
        'default' => 'id',
      ),
      'width' => 
      array (
        'type' => 'string',
      ),
    ),
    'parent' => 
    array (
      0 => 'jetpack/payment-buttons',
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'related-posts' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/related-posts',
    'title' => 'Related Posts',
    'description' => 'Display a list of related posts.',
    'keywords' => 
    array (
      0 => 'similar content',
      1 => 'linked',
      2 => 'connected',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m19.5,3.5H3.5v4.94s.01,6,.01,6v4s-.01,0-.01,0v1h15.97v-.06h.05l-.02-15.88Zm-11,1v3.94s-3.99,0-3.99,0v-3.94s3.99,0,3.99,0Zm.01,4.94v4h-4v-4h4Zm-3.99,9v-4s3.99,0,3.99,0v4s-3.99,0-3.99,0Zm13.98-13.94v3.94s-8.99,0-8.99,0v-3.94s8.99,0,8.99,0Zm.01,4.94v4h-9v-4h9Zm-8.99,9v-4s8.99,0,8.99,0v4s-8.99,0-8.99,0Z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'multiple' => false,
      'reusable' => false,
      'color' => 
      array (
        'gradients' => true,
        'link' => true,
      ),
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      'typography' => 
      array (
        '__experimentalFontFamily' => true,
        'fontSize' => true,
        'lineHeight' => true,
      ),
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
    ),
    'attributes' => 
    array (
      'postLayout' => 
      array (
        'type' => 'string',
        'default' => 'grid',
      ),
      'displayAuthor' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'displayDate' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'displayThumbnails' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'displayContext' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'postsToShow' => 
      array (
        'type' => 'number',
        'default' => 3,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'postLayout' => 'grid',
        'displayAuthor' => false,
        'displayDate' => true,
        'displayThumbnails' => true,
        'displayContext' => false,
        'postsToShow' => 2,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'repeat-visitor' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/repeat-visitor',
    'title' => 'Repeat Visitor',
    'description' => 'Control block visibility based on how often a visitor has viewed the page.',
    'keywords' => 
    array (
      0 => 'return',
      1 => 'visitors',
      2 => 'visibility',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'widgets',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'html' => false,
    ),
    'attributes' => 
    array (
      'criteria' => 
      array (
        'type' => 'string',
        'default' => 'after-visits',
      ),
      'threshold' => 
      array (
        'type' => 'number',
        'default' => 3,
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'criteria' => 'after-visits',
        'threshold' => 3,
      ),
      'innerBlocks' => 
      array (
        0 => 
        array (
          'name' => 'core/paragraph',
          'attributes' => 'This block will only appear to a visitor who visited the page three or more times.',
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'send-a-message' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/send-a-message',
    'title' => 'Send A Message',
    'description' => 'Let your visitors send you messages with the tap of a button.',
    'keywords' => 
    array (
      0 => 'whatsapp',
      1 => 'messenger',
      2 => 'contact',
      3 => 'support',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
    ),
    'attributes' => 
    array (
    ),
    'example' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'sharing-button' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/sharing-button',
    'title' => 'Sharing Button',
    'description' => 'Display a sharing button, allowing users to share your post.',
    'keywords' => 
    array (
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'parent' => 
    array (
      0 => 'jetpack/sharing-buttons',
    ),
    'attributes' => 
    array (
      'service' => 
      array (
        'type' => 'string',
      ),
      'label' => 
      array (
        'type' => 'string',
      ),
    ),
    'usesContext' => 
    array (
      0 => 'styleType',
      1 => 'postId',
      2 => 'iconColorValue',
      3 => 'iconBackgroundColorValue',
    ),
    'supports' => 
    array (
      'reusable' => false,
      'html' => false,
    ),
    'viewScript' => 'file:./view.js',
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'sharing-buttons' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/sharing-buttons',
    'title' => 'Sharing Buttons',
    'description' => 'Give your readers the ability to easily share your content with X, Facebook, Tumblr, LinkedIn, and a host of other services to help spread your message across the web.',
    'keywords' => 
    array (
      0 => 'sharing',
      1 => 'social',
      2 => 'bluesky',
      3 => 'twitter',
      4 => 'x',
      5 => 'linkedin',
      6 => 'facebook',
      7 => 'mastodon',
      8 => 'tumblr',
      9 => 'threads',
      10 => 'whatsapp',
      11 => 'telegram',
      12 => 'pinterest',
      13 => 'pocket',
      14 => 'reddit',
      15 => 'nextdoor',
      16 => 'print',
      17 => 'email',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z\' /></svg>',
    'attributes' => 
    array (
      'styleType' => 
      array (
        'type' => 'string',
        'default' => 'icon-text',
        'validValues' => 
        array (
          0 => 'icon-text',
          1 => 'icon',
          2 => 'text',
          3 => 'official',
        ),
      ),
      'size' => 
      array (
        'type' => 'string',
        'default' => 'has-normal-icon-size',
        'validValues' => 
        array (
          0 => 'has-small-icon-size',
          1 => 'has-normal-icon-size',
          2 => 'has-large-icon-size',
          3 => 'has-huge-icon-size',
        ),
      ),
      'iconColor' => 
      array (
        'type' => 'string',
      ),
      'customIconColor' => 
      array (
        'type' => 'string',
      ),
      'iconColorValue' => 
      array (
        'type' => 'string',
      ),
      'iconBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'customIconBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'iconBackgroundColorValue' => 
      array (
        'type' => 'string',
      ),
    ),
    'providesContext' => 
    array (
      'styleType' => 'styleType',
      'iconColor' => 'iconColor',
      'iconColorValue' => 'iconColorValue',
      'iconBackgroundColor' => 'iconBackgroundColor',
      'iconBackgroundColorValue' => 'iconBackgroundColorValue',
    ),
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'left',
        1 => 'center',
        2 => 'right',
      ),
      'anchor' => true,
      '__experimentalExposeControlsToChildren' => true,
      'layout' => 
      array (
        'allowSwitching' => false,
        'allowInheriting' => false,
        'allowVerticalAlignment' => false,
        'default' => 
        array (
          'type' => 'flex',
        ),
      ),
      'color' => 
      array (
        'enableContrastChecker' => true,
        'background' => true,
        'gradients' => true,
        'customGradient' => true,
        'text' => false,
        '__experimentalDefaultControls' => 
        array (
          'background' => false,
        ),
      ),
      'spacing' => 
      array (
        'blockGap' => 
        array (
          0 => 'horizontal',
          1 => 'vertical',
        ),
        'margin' => true,
        'padding' => true,
        'units' => 
        array (
          0 => 'px',
          1 => 'em',
          2 => 'rem',
          3 => 'vh',
          4 => 'vw',
        ),
        '__experimentalDefaultControls' => 
        array (
          'blockGap' => true,
          'margin' => true,
          'padding' => false,
        ),
      ),
    ),
    'example' => 
    array (
      'innerBlocks' => 
      array (
        0 => 
        array (
          'name' => 'jetpack/sharing-button',
          'attributes' => 
          array (
            'service' => 'facebook',
          ),
        ),
        1 => 
        array (
          'name' => 'jetpack/sharing-button',
          'attributes' => 
          array (
            'service' => 'x',
          ),
        ),
        2 => 
        array (
          'name' => 'jetpack/sharing-button',
          'attributes' => 
          array (
            'service' => 'mastodon',
          ),
        ),
      ),
    ),
    'viewScript' => 'file:./view.js',
    'style' => 'file:./view.css',
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'simple-payments' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/simple-payments',
    'title' => 'Pay with PayPal',
    'description' => 'Add credit and debit card payment buttons with minimal setup. Good for collecting donations or payments for products and services.',
    'keywords' => 
    array (
      0 => 'buy',
      1 => 'commerce',
      2 => 'credit card',
      3 => 'debit card',
      4 => 'monetize',
      5 => 'earn',
      6 => 'ecommerce',
      7 => 'money',
      8 => 'paid',
      9 => 'payments',
      10 => 'products',
      11 => 'purchase',
      12 => 'sell',
      13 => 'shop',
      14 => 'square',
      15 => 'payments',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path fill=\'none\' d=\'M0 0h24v24H0V0z\' /><path d=\'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z\' /></svg>',
    'supports' => 
    array (
      'className' => false,
      'customClassName' => false,
      'html' => false,
      'reusable' => false,
    ),
    'attributes' => 
    array (
      'currency' => 
      array (
        'type' => 'string',
        'default' => 'USD',
      ),
      'content' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => '.jetpack-simple-payments-description p',
        'default' => '',
      ),
      'email' => 
      array (
        'type' => 'string',
        'default' => '',
      ),
      'featuredMediaId' => 
      array (
        'type' => 'number',
        'default' => 0,
      ),
      'featuredMediaUrl' => 
      array (
        'type' => 'string',
        'source' => 'attribute',
        'selector' => '.jetpack-simple-payments-image img',
        'attribute' => 'src',
        'default' => NULL,
      ),
      'featuredMediaTitle' => 
      array (
        'type' => 'string',
        'source' => 'attribute',
        'selector' => '.jetpack-simple-payments-image img',
        'attribute' => 'alt',
        'default' => NULL,
      ),
      'multiple' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'postLinkUrl' => 
      array (
        'type' => 'string',
        'source' => 'attribute',
        'selector' => '.jetpack-simple-payments-purchase',
        'attribute' => 'href',
      ),
      'postLinkText' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => '.jetpack-simple-payments-purchase',
        'default' => 'Click here to purchase.',
      ),
      'price' => 
      array (
        'type' => 'number',
      ),
      'productId' => 
      array (
        'type' => 'number',
      ),
      'title' => 
      array (
        'type' => 'string',
        'source' => 'html',
        'selector' => '.jetpack-simple-payments-title p',
        'default' => '',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'price' => 25,
        'title' => 'Jetpack t-shirt',
        'content' => 'Take flight in ultimate comfort with this stylish t-shirt featuring the Jetpack logo.',
        'email' => 'jetpack@jetpack.com',
        'featuredMediaUrl' => './simple-payments_example-1.jpg',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'slideshow' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/slideshow',
    'title' => 'Slideshow',
    'description' => 'Display multiple images in sequential order.',
    'keywords' => 
    array (
      0 => 'story',
      1 => 'image',
      2 => 'video',
      3 => 'gallery',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'media',
    'icon' => '<svg  viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m19,21.5H6v-1h13c.83,0,1.5-.67,1.5-1.5v-11h1v11c0,1.38-1.12,2.5-2.5,2.5Z\'/><path d=\'m16.38,3.25H4.62c-.75,0-1.37.62-1.37,1.37v11.76c0,.75.62,1.37,1.37,1.37h11.76c.75,0,1.37-.62,1.37-1.37V4.62c0-.75-.62-1.37-1.37-1.37Zm.37,13.13c0,.2-.17.37-.37.37H4.62c-.2,0-.37-.17-.37-.37V4.62c0-.2.17-.37.37-.37h11.76c.2,0,.37.17.37.37v11.76Z\'/><path d=\'M9.39 7.51 12.73 11.04 9.31 14.32 8.61 13.6 11.34 10.99 8.67 8.2 9.39 7.51z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'align' => 
      array (
        0 => 'center',
        1 => 'wide',
        2 => 'full',
      ),
    ),
    'attributes' => 
    array (
      'align' => 
      array (
        'default' => 'center',
        'type' => 'string',
      ),
      'autoplay' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'delay' => 
      array (
        'type' => 'number',
        'default' => 3,
      ),
      'ids' => 
      array (
        'default' => 
        array (
        ),
        'type' => 'array',
      ),
      'images' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
        'source' => 'query',
        'selector' => '.swiper-slide',
        'query' => 
        array (
          'alt' => 
          array (
            'source' => 'attribute',
            'selector' => 'img',
            'attribute' => 'alt',
            'default' => '',
          ),
          'caption' => 
          array (
            'type' => 'string',
            'source' => 'html',
            'selector' => 'figcaption',
          ),
          'id' => 
          array (
            'source' => 'attribute',
            'selector' => 'img',
            'attribute' => 'data-id',
          ),
          'url' => 
          array (
            'source' => 'attribute',
            'selector' => 'img',
            'attribute' => 'src',
          ),
        ),
      ),
      'effect' => 
      array (
        'type' => 'string',
        'default' => 'slide',
      ),
      'sizeSlug' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
      'align' => 'center',
      'autoplay' => true,
      'ids' => 
      array (
        0 => 22,
        1 => 23,
        2 => 24,
      ),
      'images' => 
      array (
        0 => 
        array (
          'alt' => '',
          'caption' => '',
          'id' => 22,
          'url' => './slideshowExample1.png',
        ),
        1 => 
        array (
          'alt' => '',
          'caption' => '',
          'id' => 23,
          'url' => './slideshowExample2.png',
        ),
        2 => 
        array (
          'alt' => '',
          'caption' => '',
          'id' => 24,
          'url' => './slideshowExample3.png',
        ),
      ),
      'effect' => 'slide',
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'story' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/story',
    'title' => 'Story',
    'description' => 'Add an interactive story.',
    'keywords' => 
    array (
      0 => 'story',
      1 => 'image',
      2 => 'video',
      3 => 'gallery',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'media',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><g><path d=\'M17 5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2h9z\' /><path d=\'M13 4H5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z\' /><path d=\'M7 16h8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z\' /></g></svg>',
    'supports' => 
    array (
      'html' => false,
    ),
    'attributes' => 
    array (
      'settings' => 
      array (
        'type' => 'object',
      ),
      'mediaFiles' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'mediaFiles' => 
        array (
          0 => 
          array (
            'alt' => '',
            'caption' => '',
            'mime' => 'image/jpg',
            'type' => 'image',
            'id' => 22,
            'url' => './storyExample1.png',
          ),
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'subscriber-login' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/subscriber-login',
    'title' => 'Subscriber Login',
    'description' => 'Show links for subscribers to login, logout, or manage their subscription.',
    'keywords' => 
    array (
      0 => 'login',
      1 => 'logout',
      2 => 'subscription',
      3 => 'member',
      4 => 'account',
      5 => 'user',
    ),
    'version' => '0.0.1',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7.25 16.437a6.5 6.5 0 1 1 9.5 0V16A2.75 2.75 0 0 0 14 13.25h-4A2.75 2.75 0 0 0 7.25 16v.437Zm1.5 1.193a6.47 6.47 0 0 0 3.25.87 6.47 6.47 0 0 0 3.25-.87V16c0-.69-.56-1.25-1.25-1.25h-4c-.69 0-1.25.56-1.25 1.25v1.63ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z\' fill-rule=\'evenodd\' clip-rule=\'evenodd\'></path></svg>',
    'supports' => 
    array (
      'align' => true,
      'anchor' => false,
      'customClassName' => true,
      'className' => true,
      'html' => false,
      'multiple' => true,
      'reusable' => true,
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      'typography' => 
      array (
        'fontSize' => true,
        'lineHeight' => true,
      ),
      'color' => 
      array (
        'text' => false,
        'link' => true,
        'gradients' => true,
      ),
    ),
    'attributes' => 
    array (
      'redirectToCurrent' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'logInLabel' => 
      array (
        'type' => 'string',
      ),
      'logOutLabel' => 
      array (
        'type' => 'string',
      ),
      'showManageSubscriptionsLink' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'manageSubscriptionsLabel' => 
      array (
        'type' => 'string',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'subscriptions' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/subscriptions',
    'title' => 'Subscribe',
    'description' => 'Subscribe to this blog\'s posts as a newsletter.',
    'keywords' => 
    array (
      0 => 'newsletter',
      1 => 'email',
      2 => 'follow',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'grow',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'m19.02,5H4.98c-1.09,0-1.98.89-1.98,1.98v10.04c0,1.09.89,1.98,1.98,1.98h14.04c1.09,0,1.98-.89,1.98-1.98V6.98c0-1.09-.89-1.98-1.98-1.98Zm.48,11.92c0,.32-.26.58-.58.58H5.08c-.32,0-.58-.26-.58-.58V7.08c0-.32.26-.58.58-.58h13.84c.32,0,.58.26.58.58v9.84Z\'/><path d=\'m4.38,17.69l5.71-4.79s.96,1,1.91.99,1.91-.99,1.91-.99l5.59,4.79v-2.03l-4.41-3.73,4.41-3.72v-1.91l-7.14,5.76c-.24.19-.59.19-.83,0l-7.14-5.88v1.98l4.3,3.67-4.3,3.78v2.08Z\'/></svg>',
    'supports' => 
    array (
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
    ),
    'styles' => 
    array (
      0 => 
      array (
        'name' => 'split',
        'label' => 'Split',
        'isDefault' => true,
      ),
      1 => 
      array (
        'name' => 'compact',
        'label' => 'Compact',
      ),
      2 => 
      array (
        'name' => 'button',
        'label' => 'Button only',
      ),
    ),
    'attributes' => 
    array (
      'subscribePlaceholder' => 
      array (
        'type' => 'string',
      ),
      'showSubscribersTotal' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'includeSocialFollowers' => 
      array (
        'type' => 'boolean',
      ),
      'buttonOnNewLine' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'buttonWidth' => 
      array (
        'type' => 'string',
      ),
      'submitButtonText' => 
      array (
        'type' => 'string',
      ),
      'emailFieldBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'customEmailFieldBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'emailFieldGradient' => 
      array (
        'type' => 'string',
      ),
      'customEmailFieldGradient' => 
      array (
        'type' => 'string',
      ),
      'buttonBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'customButtonBackgroundColor' => 
      array (
        'type' => 'string',
      ),
      'buttonGradient' => 
      array (
        'type' => 'string',
      ),
      'customButtonGradient' => 
      array (
        'type' => 'string',
      ),
      'textColor' => 
      array (
        'type' => 'string',
      ),
      'customTextColor' => 
      array (
        'type' => 'string',
      ),
      'fontSize' => 
      array (
        'type' => 'string',
      ),
      'customFontSize' => 
      array (
        'type' => 'string',
      ),
      'borderRadius' => 
      array (
        'type' => 'number',
      ),
      'borderWeight' => 
      array (
        'type' => 'number',
      ),
      'borderColor' => 
      array (
        'type' => 'string',
      ),
      'customBorderColor' => 
      array (
        'type' => 'string',
      ),
      'padding' => 
      array (
        'type' => 'number',
      ),
      'spacing' => 
      array (
        'type' => 'number',
      ),
      'successMessage' => 
      array (
        'type' => 'string',
        'default' => 'Success! An email was just sent to confirm your subscription. Please find the email now and click \'Confirm\' to start subscribing.',
      ),
      'appSource' => 
      array (
        'type' => 'string',
      ),
      'className' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'tiled-gallery' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/tiled-gallery',
    'title' => 'Tiled Gallery',
    'description' => 'Display multiple images in an elegantly organized tiled layout.',
    'keywords' => 
    array (
      0 => 'columns',
      1 => 'images',
      2 => 'photos',
      3 => 'pictures',
      4 => 'square',
      5 => 'circle',
      6 => 'mosaic',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'media',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M19 5v2h-4V5h4M9 5v6H5V5h4m10 8v6h-4v-6h4M9 17v2H5v-2h4M21 3h-8v6h8V3zM11 3H3v10h8V3zm10 8h-8v10h8V11zm-10 4H3v6h8v-6z\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'center',
        1 => 'wide',
        2 => 'full',
      ),
      'color' => 
      array (
        'gradients' => true,
        'text' => false,
      ),
      'customClassName' => false,
      'html' => false,
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      '__experimentalHideChildBlockControls' => true,
    ),
    'providesContext' => 
    array (
      'imageCrop' => 'imageCrop',
    ),
    'styles' => 
    array (
      0 => 
      array (
        'name' => 'rectangular',
        'label' => 'Tiled mosaic',
        'isDefault' => true,
      ),
      1 => 
      array (
        'name' => 'circle',
        'label' => 'Circles',
      ),
      2 => 
      array (
        'name' => 'square',
        'label' => 'Square tiles',
      ),
      3 => 
      array (
        'name' => 'columns',
        'label' => 'Tiled columns',
      ),
    ),
    'attributes' => 
    array (
      'align' => 
      array (
        'type' => 'string',
        'default' => 'center',
      ),
      'className' => 
      array (
        'type' => 'string',
        'default' => 'is-style-rectangular',
      ),
      'columns' => 
      array (
        'type' => 'number',
      ),
      'columnWidths' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'ids' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
      ),
      'imageFilter' => 
      array (
        'type' => 'string',
      ),
      'images' => 
      array (
        'type' => 'array',
        'default' => 
        array (
        ),
        'source' => 'query',
        'selector' => '.tiled-gallery__item',
        'query' => 
        array (
          'alt' => 
          array (
            'attribute' => 'alt',
            'default' => '',
            'selector' => 'img',
            'source' => 'attribute',
          ),
          'height' => 
          array (
            'attribute' => 'data-height',
            'type' => 'number',
            'selector' => 'img',
            'source' => 'attribute',
          ),
          'id' => 
          array (
            'attribute' => 'data-id',
            'selector' => 'img',
            'source' => 'attribute',
          ),
          'link' => 
          array (
            'attribute' => 'data-link',
            'selector' => 'img',
            'source' => 'attribute',
          ),
          'url' => 
          array (
            'attribute' => 'data-url',
            'selector' => 'img',
            'source' => 'attribute',
          ),
          'width' => 
          array (
            'attribute' => 'data-width',
            'selector' => 'img',
            'source' => 'attribute',
            'type' => 'number',
          ),
        ),
      ),
      'imageCrop' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'linkTo' => 
      array (
        'default' => 'none',
        'type' => 'string',
      ),
      'roundedCorners' => 
      array (
        'type' => 'integer',
        'default' => 0,
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'tock' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/tock',
    'title' => 'Tock',
    'description' => 'Reserve a table at your restaurant with Tock.',
    'keywords' => 
    array (
      0 => 'booking',
      1 => 'reservation',
      2 => 'restaurant',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M10 15.619C6.84915 15.619 4.28572 13.0542 4.28572 9.90176C4.28572 7.24269 6.10957 5.00183 8.57143 4.36551V0C3.72557 0.693782 0 4.86162 0 9.90176C0 15.4274 4.47715 19.9069 10 19.9069C12.2461 19.9069 14.3193 19.1658 15.9887 17.9148L12.9003 14.825C12.0494 15.3287 11.0581 15.619 10 15.619 M15.7135 9.90176C15.7135 10.9604 15.4233 11.9522 14.9199 12.8035L18.0082 15.8935C19.2585 14.2232 19.9992 12.149 19.9992 9.90176C19.9992 4.86162 16.2736 0.693782 11.4277 0V4.36551C13.8896 5.00183 15.7135 7.24269 15.7135 9.90176\'/></svg>',
    'supports' => 
    array (
      'align' => true,
      'html' => false,
      'multiple' => false,
    ),
    'attributes' => 
    array (
      'url' => 
      array (
        'type' => 'string',
      ),
    ),
    'example' => 
    array (
      'attributes' => 
      array (
        'url' => 'roister',
      ),
      'viewportWidth' => 250,
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'top-posts' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/top-posts',
    'title' => 'Top Posts & Pages',
    'description' => 'Display your most popular content.',
    'keywords' => 
    array (
      0 => 'ranking',
      1 => 'views',
      2 => 'trending',
      3 => 'popular',
    ),
    'version' => '1.0',
    'textdomain' => 'jetpack',
    'category' => 'embed',
    'icon' => '<svg xmlns=\'http://www.w3.org/2000/svg\' height=\'24px\' viewBox=\'0 0 24 24\' width=\'24px\'><rect fill=\'none\' height=\'24\' width=\'24\'/><path d=\'M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.55,1.92,4.63,4.39,4.94c0.63,1.5,1.98,2.63,3.61,2.96V19H7v2h10v-2h-4v-3.1 c1.63-0.33,2.98-1.46,3.61-2.96C19.08,12.63,21,10.55,21,8V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.82C5.84,10.4,5,9.3,5,8z M19,8 c0,1.3-0.84,2.4-2,2.82V7h2V8z\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'wide',
        1 => 'full',
      ),
      'html' => false,
      'multiple' => true,
      'reusable' => true,
      'color' => 
      array (
        'gradients' => true,
        'link' => true,
      ),
      'spacing' => 
      array (
        'margin' => true,
        'padding' => true,
      ),
      'typography' => 
      array (
        '__experimentalFontFamily' => true,
        'fontSize' => true,
        'lineHeight' => true,
      ),
    ),
    'attributes' => 
    array (
      'layout' => 
      array (
        'type' => 'string',
        'default' => 'grid',
      ),
      'displayAuthor' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'displayDate' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'displayThumbnail' => 
      array (
        'type' => 'boolean',
        'default' => true,
      ),
      'displayContext' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
      'period' => 
      array (
        'type' => 'string',
        'default' => '7',
      ),
      'postsToShow' => 
      array (
        'type' => 'number',
        'default' => 3,
      ),
      'postTypes' => 
      array (
        'type' => 'object',
        'default' => 
        array (
          'post' => true,
          'page' => true,
        ),
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'voice-to-content' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/voice-to-content',
    'title' => 'Voice to content',
    'description' => 'Transform your spoken words into a post ready to publish with AI.',
    'keywords' => 
    array (
      0 => 'AI',
      1 => 'GPT',
      2 => 'AL',
      3 => 'Magic',
      4 => 'help',
      5 => 'assistant',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'media',
    'icon' => '<svg viewBox=\'0 0 20 20\' width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M12 9V3c0-1.1-.89-2-2-2-1.12 0-2 .94-2 2v6c0 1.1.9 2 2 2 1.13 0 2-.94 2-2zm4 0c0 2.97-2.16 5.43-5 5.91V17h2c.56 0 1 .45 1 1s-.44 1-1 1H7c-.55 0-1-.45-1-1s.45-1 1-1h2v-2.09C6.17 14.43 4 11.97 4 9c0-.55.45-1 1-1 .56 0 1 .45 1 1 0 2.21 1.8 4 4 4 2.21 0 4-1.79 4-4 0-.55.45-1 1-1 .56 0 1 .45 1 1z\'/></svg>',
    'supports' => 
    array (
      'html' => false,
      'multiple' => true,
      'reusable' => false,
    ),
    'attributes' => 
    array (
      'content' => 
      array (
        'type' => 'string',
      ),
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
  'wordads' => 
  array (
    '$schema' => 'https://schemas.wp.org/trunk/block.json',
    'apiVersion' => 3,
    'name' => 'jetpack/wordads',
    'title' => 'Ad',
    'description' => 'Earn income by adding high quality ads to your post.',
    'keywords' => 
    array (
      0 => 'ads',
      1 => 'WordAds',
      2 => 'advertisement',
    ),
    'version' => '12.5.0',
    'textdomain' => 'jetpack',
    'category' => 'monetize',
    'icon' => '<svg viewBox=\'0 0 24 24\' width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M15,15.6L13,14H4V10H13L15,8.4V15.6M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z\'/></svg>',
    'supports' => 
    array (
      'align' => 
      array (
        0 => 'left',
        1 => 'center',
        2 => 'right',
      ),
      'alignWide' => false,
      'className' => false,
      'customClassName' => false,
      'html' => false,
      'reusable' => false,
    ),
    'attributes' => 
    array (
      'align' => 
      array (
        'type' => 'string',
        'default' => 'center',
      ),
      'format' => 
      array (
        'type' => 'string',
        'default' => 'mrec',
      ),
      'hideMobile' => 
      array (
        'type' => 'boolean',
        'default' => false,
      ),
    ),
    'example' => 
    array (
    ),
    'editorScript' => 'jetpack-blocks-editor',
  ),
);
