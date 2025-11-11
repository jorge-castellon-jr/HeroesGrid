import { useState, useEffect, useRef } from 'react';

export default function Counter({ startTime = 1800000 }) {
	const [displayMinutes, setDisplayMinutes] = useState('00');
	const [displaySeconds, setDisplaySeconds] = useState('00');
	const [displayMilliseconds, setDisplayMilliseconds] = useState(0);
	const [timeLeft, setTimeLeft] = useState(startTime);
	const [timerStarted, setTimerStarted] = useState(false);
	const timerRef = useRef(null);

	const _milliseconds = 100;
	const _seconds = 1000;
	const _minutes = _seconds * 60;
	const _hours = _minutes * 60;

	const formatNum = (num) => (num < 10 ? `0${num}` : num);

	const setTime = (value) => {
		setDisplayMinutes(formatNum(Math.floor((value % _hours) / _minutes)));
		setDisplaySeconds(formatNum(Math.floor((value % _minutes) / _seconds)));
		setDisplayMilliseconds(0);
		setTimeLeft(value);
	};

	const showRemaining = () => {
		if (timerStarted) return;
		
		timerRef.current = setInterval(() => {
			setTimerStarted(true);
			
			setTimeLeft((prevTimeLeft) => {
				const distance = prevTimeLeft;

				if (distance < 0) {
					clearInterval(timerRef.current);
					return prevTimeLeft;
				}

				const minutes = Math.floor((distance % _hours) / _minutes);
				const seconds = Math.floor((distance % _minutes) / _seconds);
				const milliseconds = Math.floor((distance % _seconds) / _milliseconds);

				setDisplayMinutes(formatNum(minutes));
				setDisplaySeconds(formatNum(seconds));
				setDisplayMilliseconds(milliseconds);

				return prevTimeLeft - 100;
			});
		}, 100);
	};

	const pauseTimer = () => {
		setTimerStarted(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
	};

	const clearTimer = () => {
		setTimerStarted(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		setTime(startTime);
	};

	useEffect(() => {
		setTime(startTime);
	}, [startTime]);

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	return (
		<div>
			<div className="flex justify-center text-6xl time">
				{displayMinutes}:{displaySeconds}.{displayMilliseconds}
			</div>
			<div className="flex flex-col mt-4 buttons">
				{timerStarted ? (
					<a
						className="flex justify-center w-24 w-full py-4 mb-4 transition-colors duration-300 bg-gray-400 border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
						onClick={pauseTimer}
					>
						Pause
					</a>
				) : (
					<a
						className="flex justify-center w-24 w-full py-4 mb-4 transition-colors duration-300 bg-gray-400 border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
						onClick={showRemaining}
					>
						Start
					</a>
				)}
				<a
					className="flex justify-center w-24 w-full py-4 mb-4 transition-colors duration-300 bg-gray-400 border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
					onClick={clearTimer}
				>
					Clear
				</a>
			</div>
		</div>
	);
}
