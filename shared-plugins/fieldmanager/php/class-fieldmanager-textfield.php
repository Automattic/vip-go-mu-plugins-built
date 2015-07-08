<?php

/**
 * Text field. A good basic implementation guide, too.
 * @package Fieldmanager
 */
class Fieldmanager_TextField extends Fieldmanager_Field {

	/**
	 * @var string
	 * Override field_class
	 */
	public $field_class = 'text';

	/**
	 * Override constructor to set default size.
	 * @param string $label
	 * @param array $options
	 */
	public function __construct( $label = '', $options = array() ) {
		$this->attributes = array(
			'size' => '50',
		);
		parent::__construct( $label, $options );
	}

}