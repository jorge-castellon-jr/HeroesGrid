import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import Dialog from '../components/Dialog';

const DialogContext = createContext();

export const useDialog = () => {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error('useDialog must be used within a DialogProvider');
	}
	return context;
};

export const DialogProvider = ({ children }) => {
	const [dialog, setDialog] = useState({
		isOpen: false,
		title: '',
		message: '',
		type: 'info',
		confirmText: 'OK',
		onConfirm: null,
	});

	const showDialog = ({ title, message, type = 'info', confirmText = 'OK', onConfirm }) => {
		setDialog({
			isOpen: true,
			title,
			message,
			type,
			confirmText,
			onConfirm,
		});
	};

	const closeDialog = () => {
		setDialog((prev) => ({ ...prev, isOpen: false }));
	};

	// Toast functions (non-blocking notifications)
	const showToast = {
		success: (message, options) => toast.success(message, options),
		error: (message, options) => toast.error(message, options),
		warning: (message, options) => toast.warning(message, options),
		info: (message, options) => toast.info(message, options),
	};

	// Helper functions for dialog types (blocking modals)
	const showSuccess = (message, title = 'Success') => {
		showDialog({ title, message, type: 'success' });
	};

	const showError = (message, title = 'Error') => {
		showDialog({ title, message, type: 'error' });
	};

	const showWarning = (message, title = 'Warning') => {
		showDialog({ title, message, type: 'warning' });
	};

	const showInfo = (message, title = 'Information') => {
		showDialog({ title, message, type: 'info' });
	};

	const showConfirm = (message, onConfirm, title = 'Confirm', confirmText = 'Confirm') => {
		showDialog({ title, message, type: 'confirm', confirmText, onConfirm });
	};

	return (
		<DialogContext.Provider
			value={{
				showDialog,
				showToast,
				showSuccess,
				showError,
				showWarning,
				showInfo,
				showConfirm,
				closeDialog,
			}}
		>
			{children}
			<Dialog
				isOpen={dialog.isOpen}
				onClose={closeDialog}
				title={dialog.title}
				message={dialog.message}
				type={dialog.type}
				confirmText={dialog.confirmText}
				onConfirm={dialog.onConfirm}
			/>
		</DialogContext.Provider>
	);
};
