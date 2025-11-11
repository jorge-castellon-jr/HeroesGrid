const PRIcons = ({ icon = "pr-hotg", width = 45, height = 45, className = "" }) => {
	return (
		<svg width={width} height={height} className={className}>
			<image
				width={width}
				height={height}
				xlinkHref={`/svg/${icon}.svg`}
				src="yourfallback.png"
			/>
		</svg>
	)
}

export default PRIcons
