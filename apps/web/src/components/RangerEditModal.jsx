import { useState, useEffect } from 'react';
import { database } from '../database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const RangerEditModal = ({ ranger, onClose, onSave }) => {
	const [relationData, setRelationData] = useState({ teams: [], expansions: [] });
	const [editingItem, setEditingItem] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		loadRelationData();
		
		if (ranger) {
			setEditingItem({
				id: ranger.id,
				name: ranger.name,
				slug: ranger.slug,
				title: ranger.title,
				cardTitle: ranger.cardTitle,
				color: ranger.color,
				abilityName: ranger.abilityName,
				ability: ranger.ability,
				imageUrl: ranger.imageUrl,
				type: ranger.type,
				teamPosition: ranger.teamPosition,
				isOncePerBattle: ranger.isOncePerBattle,
				teamId: ranger.teamId,
				expansionId: ranger.expansionId,
				published: ranger.published,
			});
		}
	}, [ranger]);

	const loadRelationData = async () => {
		try {
			const [teams, expansions] = await Promise.all([
				database.get('teams').query().fetch(),
				database.get('expansions').query().fetch(),
			]);
			setRelationData({ teams, expansions });
		} catch (error) {
			console.error('Error loading relation data:', error);
		}
	};

	const handleSave = async () => {
		if (!editingItem) return;
		
		try {
			setIsSaving(true);
			await database.write(async () => {
				const record = await database.get('rangers').find(editingItem.id);
				await record.update((r) => {
					r.name = editingItem.name;
					r.slug = editingItem.slug;
					r.title = editingItem.title;
					r.cardTitle = editingItem.cardTitle;
					r.color = editingItem.color;
					r.abilityName = editingItem.abilityName;
					r.ability = editingItem.ability;
					r.imageUrl = editingItem.imageUrl;
					r.type = editingItem.type;
					r.teamPosition = editingItem.teamPosition;
					r.isOncePerBattle = editingItem.isOncePerBattle;
					r.teamId = editingItem.teamId;
					r.expansionId = editingItem.expansionId;
					r.published = editingItem.published;
				});
			});
			
			if (onSave) {
				await onSave();
			}
			onClose();
		} catch (error) {
			console.error('Error saving:', error);
		} finally {
			setIsSaving(false);
		}
	};

	// Add keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && !isSaving) {
				onClose();
			} else if (e.key === 'Enter' && !isSaving && !e.target.matches('textarea')) {
				// Don't trigger on Enter in textarea (for multi-line input)
				e.preventDefault();
				handleSave();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSaving, onClose, handleSave]);

	if (!editingItem) return null;

	return (
		<Dialog open={!!editingItem} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit {editingItem.name}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={editingItem.name || ''}
								onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={editingItem.title || ''}
								onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="cardTitle">Card Title (Override)</Label>
							<Input
								id="cardTitle"
								value={editingItem.cardTitle || ''}
								onChange={(e) => setEditingItem({ ...editingItem, cardTitle: e.target.value })}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="type">Type</Label>
								<Select value={editingItem.type || ''} onValueChange={(value) => setEditingItem({ ...editingItem, type: value })}>
									<SelectTrigger id="type">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="core">Core</SelectItem>
										<SelectItem value="sixth">Sixth</SelectItem>
										<SelectItem value="extra">Extra</SelectItem>
										<SelectItem value="ally">Ally</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="color">Color</Label>
								<Select value={editingItem.color || ''} onValueChange={(value) => setEditingItem({ ...editingItem, color: value })}>
									<SelectTrigger id="color">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="red">Red</SelectItem>
										<SelectItem value="blue">Blue</SelectItem>
										<SelectItem value="black">Black</SelectItem>
										<SelectItem value="green">Green</SelectItem>
										<SelectItem value="yellow">Yellow</SelectItem>
										<SelectItem value="pink">Pink</SelectItem>
										<SelectItem value="white">White</SelectItem>
										<SelectItem value="gold">Gold</SelectItem>
										<SelectItem value="silver">Silver</SelectItem>
										<SelectItem value="purple">Purple</SelectItem>
										<SelectItem value="orange">Orange</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="teamPosition">Team Position</Label>
							<div className="flex gap-2">
								<Button
									type="button"
									onClick={() => setEditingItem({ ...editingItem, teamPosition: Math.round(((editingItem.teamPosition || 0) - 0.1) * 10) / 10 })}
									variant="outline"
									size="icon"
								>
									−
								</Button>
								<Input
									id="teamPosition"
									type="number"
									step="any"
									value={editingItem.teamPosition || ''}
									onChange={(e) => setEditingItem({ ...editingItem, teamPosition: parseFloat(e.target.value) || null })}
									placeholder="Auto-assigned based on type/color"
									className="flex-1"
								/>
								<Button
									type="button"
									onClick={() => setEditingItem({ ...editingItem, teamPosition: Math.round(((editingItem.teamPosition || 0) + 0.1) * 10) / 10 })}
									variant="outline"
									size="icon"
								>
									+
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="abilityName">Ability Name</Label>
							<Input
								id="abilityName"
								value={editingItem.abilityName || ''}
								onChange={(e) => setEditingItem({ ...editingItem, abilityName: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="ability">Ability Description</Label>
							<Textarea
								id="ability"
								value={editingItem.ability || ''}
								onChange={(e) => setEditingItem({ ...editingItem, ability: e.target.value })}
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="teamId">Team</Label>
								<Select value={editingItem.teamId || ''} onValueChange={(value) => setEditingItem({ ...editingItem, teamId: value })}>
									<SelectTrigger id="teamId">
										<SelectValue placeholder="Select team..." />
									</SelectTrigger>
									<SelectContent>
										{relationData.teams.map(team => (
											<SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="expansionId">Expansion</Label>
								<Select value={editingItem.expansionId || ''} onValueChange={(value) => setEditingItem({ ...editingItem, expansionId: value })}>
									<SelectTrigger id="expansionId">
										<SelectValue placeholder="Select expansion..." />
									</SelectTrigger>
									<SelectContent>
										{relationData.expansions.map(expansion => (
											<SelectItem key={expansion.id} value={expansion.id}>{expansion.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="imageUrl">Image URL</Label>
							<Input
								id="imageUrl"
								value={editingItem.imageUrl || ''}
								onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
							/>
						</div>

						<div className="flex gap-6">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="isOncePerBattle"
									checked={editingItem.isOncePerBattle || false}
									onCheckedChange={(checked) => setEditingItem({ ...editingItem, isOncePerBattle: checked })}
								/>
								<Label htmlFor="isOncePerBattle" className="cursor-pointer">Once Per Battle</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="published"
									checked={editingItem.published || false}
									onCheckedChange={(checked) => setEditingItem({ ...editingItem, published: checked })}
								/>
								<Label htmlFor="published" className="cursor-pointer">Published</Label>
							</div>
						</div>
					</div>

				<DialogFooter>
					<Button onClick={onClose} disabled={isSaving} variant="outline">
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default RangerEditModal;
