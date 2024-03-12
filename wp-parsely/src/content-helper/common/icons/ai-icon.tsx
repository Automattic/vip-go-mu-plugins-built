import { Path, SVG } from '@wordpress/components';

export const AiIcon = ( { size = 24, className = 'wp-parsely-icon' }: { size?: number, className: string } ): JSX.Element => {
	return (
		<SVG xmlns="http://www.w3.org/2000/svg"
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none">
			<Path
				d="M8.18983 5.90381L8.83642 7.54325L10.4758 8.18983L8.83642 8.8364L8.18983 10.4759L7.54324 8.8364L5.90381 8.18983L7.54324 7.54325L8.18983 5.90381Z" />
			<Path
				d="M15.048 5.90381L15.9101 8.08972L18.0961 8.95186L15.9101 9.81397L15.048 11.9999L14.1859 9.81397L12 8.95186L14.1859 8.08972L15.048 5.90381Z" />
			<Path
				d="M11.238 10.4761L12.3157 13.2085L15.048 14.2861L12.3157 15.3638L11.238 18.0962L10.1603 15.3638L7.42798 14.2861L10.1603 13.2085L11.238 10.4761Z" />
		</SVG>
	);
};
