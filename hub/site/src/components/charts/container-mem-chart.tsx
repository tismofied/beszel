import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { useMemo, useRef } from 'react'
import {
	chartTimeData,
	cn,
	formatShortDate,
	toFixedWithoutTrailingZeros,
	useYaxisWidth,
} from '@/lib/utils'
// import Spinner from '../spinner'
import { useStore } from '@nanostores/react'
import { $chartTime } from '@/lib/stores'

export default function ContainerMemChart({
	chartData,
	ticks,
}: {
	chartData: Record<string, number | string>[]
	ticks: number[]
}) {
	const chartTime = useStore($chartTime)
	const chartRef = useRef<HTMLDivElement>(null)
	const yAxisWidth = useYaxisWidth(chartRef)

	const yAxisSet = useMemo(() => yAxisWidth !== 180, [yAxisWidth])

	const chartConfig = useMemo(() => {
		let config = {} as Record<
			string,
			{
				label: string
				color: string
			}
		>
		const totalUsage = {} as Record<string, number>
		for (let stats of chartData) {
			for (let key in stats) {
				if (key === 'time') {
					continue
				}
				if (!(key in totalUsage)) {
					totalUsage[key] = 0
				}
				// @ts-ignore
				totalUsage[key] += stats[key]
			}
		}
		let keys = Object.keys(totalUsage)
		keys.sort((a, b) => (totalUsage[a] > totalUsage[b] ? -1 : 1))
		const length = keys.length
		for (let i = 0; i < length; i++) {
			const key = keys[i]
			const hue = ((i * 360) / length) % 360
			config[key] = {
				label: key,
				color: `hsl(${hue}, 60%, 55%)`,
			}
		}
		return config satisfies ChartConfig
	}, [chartData])

	// if (!chartData.length || !ticks.length) {
	// 	return <Spinner />
	// }

	return (
		<div ref={chartRef}>
			{/* {!yAxisSet && <Spinner />} */}
			<ChartContainer
				config={{}}
				className={cn('h-full w-full absolute aspect-auto bg-card opacity-0 transition-opacity', {
					'opacity-100': yAxisSet,
				})}
			>
				<AreaChart
					accessibilityLayer
					data={chartData}
					reverseStackOrder={true}
					margin={{
						top: 10,
					}}
				>
					<CartesianGrid vertical={false} />
					<YAxis
						// domain={[0, (max: number) => Math.ceil(max)]}
						tickLine={false}
						axisLine={false}
						unit={' GB'}
						width={yAxisWidth}
						tickFormatter={(value) => toFixedWithoutTrailingZeros(value / 1024, 2)}
					/>
					<XAxis
						dataKey="time"
						domain={[ticks[0], ticks.at(-1)!]}
						ticks={ticks}
						type="number"
						scale={'time'}
						minTickGap={35}
						tickMargin={8}
						axisLine={false}
						tickFormatter={chartTimeData[chartTime].format}
					/>
					<ChartTooltip
						// cursor={false}
						animationEasing="ease-out"
						animationDuration={150}
						labelFormatter={(_, data) => formatShortDate(data[0].payload.time)}
						// @ts-ignore
						itemSorter={(a, b) => b.value - a.value}
						content={<ChartTooltipContent unit=" MB" indicator="line" />}
					/>
					{Object.keys(chartConfig).map((key) => (
						<Area
							key={key}
							// animationDuration={1200}
							isAnimationActive={false}
							dataKey={key}
							type="monotoneX"
							fill={chartConfig[key].color}
							fillOpacity={0.4}
							stroke={chartConfig[key].color}
							stackId="a"
						/>
					))}
				</AreaChart>
			</ChartContainer>
		</div>
	)
}
