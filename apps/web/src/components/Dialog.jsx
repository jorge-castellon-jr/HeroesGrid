import { useEffect } from 'react';

const Dialog = ({ isOpen, onClose, title, message, type = 'info', confirmText = 'OK', onConfirm }) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		}
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black bg-opacity-50"
				onClick={type === 'confirm' ? null : onClose}
			/>

			{/* Dialog */}
			<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
				<div className="p-6">
					{title && (
						<h3 className="text-lg font-semibold mb-3 dark:text-gray-100">{title}</h3>
					)}
					<p className="text-gray-700 dark:text-gray-300">{message}</p>
				</div>

				<div className="px-6 pb-6 flex gap-3 justify-end">
					{type === 'confirm' && (
						<button
							onClick={onClose}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
						>
							Cancel
						</button>
					)}
					<button
							onClick={handleConfirm}
							className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
						>
							{confirmText}
						</button>
				</div>
			</div>
		</div>
	);
};

export default Dialog;
