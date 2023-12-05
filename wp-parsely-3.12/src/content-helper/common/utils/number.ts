/**
 * Implements the "Imprecise Number" functionality of the Parse.ly dashboard.
 *
 * Note: This function is not made to process float numbers.
 *
 * @param {string} value          The number to process. It can be formatted.
 * @param {number} fractionDigits The number of desired fraction digits.
 * @param {string} glue           A string to put between the number and unit.
 * @return {string} The number formatted as an imprecise number.
 */
export function formatToImpreciseNumber( value: string, fractionDigits = 1, glue = '' ): string {
	const number = parseInt( value.replace( /\D/g, '' ), 10 );

	if ( number < 1000 ) {
		return value;
	} else if ( number < 10000 ) {
		fractionDigits = 1;
	}

	const unitNames: {[key:string]: string} = {
		1000: 'k',
		'1,000,000': 'M',
		'1,000,000,000': 'B',
		'1,000,000,000,000': 'T',
		'1,000,000,000,000,000': 'Q',
	};
	let currentNumber = number;
	let currentNumberAsString = number.toString();
	let unit = '';
	let previousNumber = 0;

	Object.entries( unitNames ).forEach( ( [ thousands, suffix ] ) => {
		const thousandsInt = parseInt( thousands.replace( /\D/g, '' ), 10 );

		if ( number >= thousandsInt ) {
			currentNumber = number / thousandsInt;
			let precision = fractionDigits;

			// For over 10 units, we reduce the precision to 1 fraction digit.
			if ( currentNumber % 1 > 1 / previousNumber ) {
				precision = currentNumber > 10 ? 1 : 2;
			}

			// Precision override, where we want to show 2 fraction digits.
			const zeroes = parseFloat( currentNumber.toFixed( 2 ) ) === parseFloat( currentNumber.toFixed( 0 ) );
			precision = zeroes ? 0 : precision;
			currentNumberAsString = currentNumber.toFixed( precision );
			unit = suffix;
		}

		previousNumber = thousandsInt;
	} );

	return currentNumberAsString + glue + unit;
}
