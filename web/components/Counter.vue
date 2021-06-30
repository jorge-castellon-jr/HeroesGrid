<template>
	<div>
		<div
			class="flex justify-center text-6xl time"
		>{{displayMinutes}}:{{displaySeconds}}.{{displayMilliseconds}}</div>
		<div class="flex flex-col mt-4 buttons">
			<a
				v-if="timerStarted"
				class="flex justify-center w-24 w-full py-4 mb-4 transition-colors duration-300 bg-gray-400 border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
				@click="pauseTimer()"
			>Pause</a>
			<a
				v-else
				class="flex justify-center w-24 w-full py-4 mb-4 transition-colors duration-300 bg-gray-400 border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
				@click="showRemaining()"
			>Start</a>
			<a
				class="flex justify-center w-24 w-full py-4 mb-4 transition-colors duration-300 bg-gray-400 border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
				@click="clearTimer()"
			>Clear</a>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		startTime: {
			type: Number,
			default: 1800000,
		},
	},
	data: () => ({
		displayMinutes: "00",
		displaySeconds: "00",
		displayMilliseconds: 0,
		timer: null,
		timeLeft: 0,
		timerStarted: false,
	}),
	watch: {
		startTime(newValue, oldValue) {
			this.setTime(newValue)
		},
	},
	mounted() {
		this.setTime(this.startTime)
	},
	beforeDestroy() {
		this.clearTimer()
	},
	methods: {
		setTime(value) {
			this.displayMinutes = this.formatNum(
				Math.floor((value % this._hours) / this._minutes),
			)
			this.displaySeconds = this.formatNum(
				Math.floor((value % this._minutes) / this._seconds),
			)
			this.displayMilliseconds = 0
			this.timeLeft = value
		},
		formatNum: num => (num < 10 ? `0${num}` : num),
		showRemaining() {
			if (this.timerStarted) return
			this.timer = setInterval(() => {
				this.timerStarted = true
				const distance = this.timeLeft

				if (distance < 0) return clearInterval(this.timer)

				const minutes = Math.floor((distance % this._hours) / this._minutes)
				const seconds = Math.floor((distance % this._minutes) / this._seconds)
				const milliseconds = Math.floor(
					(distance % this._seconds) / this._milliseconds,
				)

				this.displayMinutes = this.formatNum(minutes)
				this.displaySeconds = this.formatNum(seconds)
				this.displayMilliseconds = milliseconds

				this.timeLeft = this.timeLeft - 100
			}, 100)
		},
		pauseTimer() {
			this.timerStarted = false
			clearInterval(this.timer)
		},
		clearTimer() {
			this.timerStarted = false
			this.timeLeft = this.startTime
			clearInterval(this.timer)
			this.setTime(this.startTime)
		},
	},
	computed: {
		_milliseconds: () => 100,
		_seconds: () => 1000,
		_minutes() {
			return this._seconds * 60
		},
		_hours() {
			return this._minutes * 60
		},
		_days() {
			return this._hours * 24
		},
		end() {
			return new Date(
				this.year,
				this.month,
				this.date,
				this.hour,
				this.minute,
				this.second,
				this.millisecond,
			)
		},
	},
}
</script>

<style lang="scss" scoped>
</style>