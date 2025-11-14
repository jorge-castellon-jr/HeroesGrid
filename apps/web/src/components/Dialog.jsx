import { Dialog as ShadcnDialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Dialog = ({ isOpen, onClose, title, message, type = 'info', confirmText = 'OK', onConfirm }) => {
	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		}
		onClose();
	};

	return (
		<ShadcnDialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					{title && <DialogTitle>{title}</DialogTitle>}
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					{type === 'confirm' && (
						<Button onClick={onClose} variant="outline">
							Cancel
						</Button>
					)}
					<Button onClick={handleConfirm}>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</ShadcnDialog>
	);
};

export default Dialog;
