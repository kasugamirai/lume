import type { SVGProps } from "react";

export function CheckCircleIcon(
	props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
	return (
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm3.774 8.133a1 1 0 0 0-1.548-1.266l-3.8 4.645-1.219-1.22a1 1 0 0 0-1.414 1.415l2 2a1 1 0 0 0 1.481-.074l4.5-5.5Z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
