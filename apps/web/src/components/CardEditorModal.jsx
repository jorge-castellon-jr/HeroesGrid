import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CardEditorModal = ({ 
	isOpen, 
	onClose, 
	card, 
	onCardChange, 
	onSave, 
	isEditing 
}) => {
	const cardTypes = ['attack', 'maneuver', 'reaction'];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEditing ? 'Edit Card' : 'Add Card'}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="cardName">Card Name *</Label>
						<Input
							id="cardName"
							name="name"
							value={card.name}
							onChange={onCardChange}
							placeholder="e.g., Power Strike"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cardType">Type</Label>
						<Select name="type" value={card.type} onValueChange={(value) => onCardChange({ target: { name: 'type', value } })}>
							<SelectTrigger id="cardType">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{cardTypes.map((type) => (
									<SelectItem key={type} value={type}>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</SelectItem>
								))}
								<SelectItem value="custom">Custom</SelectItem>
							</SelectContent>
						</Select>
						{card.type === 'custom' && (
							<Input
								id="customType"
								name="customType"
								value={card.customType || ''}
								onChange={onCardChange}
								placeholder="Enter custom card type"
								className="mt-2"
							/>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="cardDescription">Description</Label>
						<Textarea
							id="cardDescription"
							name="description"
							value={card.description}
							onChange={onCardChange}
							rows={3}
							placeholder="Card effect description..."
						/>
					</div>

					<div className="grid grid-cols-5 gap-4">
						<div className="space-y-2">
							<Label htmlFor="energyCost">Energy</Label>
							<Input
								id="energyCost"
								name="energyCost"
								value={card.energyCost}
								onChange={onCardChange}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="shields">Shields</Label>
							<Input
								id="shields"
								name="shields"
								value={card.shields}
								onChange={onCardChange}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="attackDice">Dice</Label>
							<Input
								id="attackDice"
								type="number"
								name="attackDice"
								value={card.attackDice}
								onChange={onCardChange}
								min="0"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="attackHit">Hit</Label>
							<Input
								id="attackHit"
								type="number"
								name="attackHit"
								value={card.attackHit}
								onChange={onCardChange}
								min="0"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="count">Count</Label>
							<Input
								id="count"
								type="number"
								name="count"
								value={card.count}
								onChange={onCardChange}
								min="1"
								max="10"
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={onSave} className="flex-1">
						{isEditing ? 'Update Card' : 'Add Card'}
					</Button>
					<Button onClick={onClose} variant="secondary" className="flex-1">
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CardEditorModal;
