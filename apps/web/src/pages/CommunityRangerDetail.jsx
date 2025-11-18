import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import { trpc } from '../utils/trpc';
import RangerCard from '../components/cards/RangerCard';
import CommentsSection from '../components/comments/CommentsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Copy } from 'lucide-react';

const CommunityRangerDetail = () => {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const { showError, showToast, showConfirm } = useDialog();
  const { user, isAuthenticated } = useAuth();
  const trpcUtils = trpc.useUtils();

  const [ranger, setRanger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasCheckedLikeStatus, setHasCheckedLikeStatus] = useState(false);
  const [hasLoadedLikes, setHasLoadedLikes] = useState(false);

  useEffect(() => {
    fetchRanger();
  }, [slug, username]);

  // Load likes and check like status after ranger is loaded
  useEffect(() => {
    if (ranger && !hasLoadedLikes) {
      loadLikesAndCheckStatus();
      setHasLoadedLikes(true);
    }
  }, [ranger, hasLoadedLikes]);

  const loadLikesAndCheckStatus = async () => {
    if (!ranger) return;
    try {
      // Fetch the published ranger from API to get likes count
      // Pass viewerId so views aren't incremented if this is the creator viewing their own ranger
      const publishedRanger = await trpcUtils.client.customRangers.getById.query({
        id: ranger.id,
        viewerId: user?.id,
      });
      if (publishedRanger && publishedRanger.likes !== undefined) {
        setLikeCount(publishedRanger.likes);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
    
    // Check if liked (only if authenticated)
    if (isAuthenticated && user) {
      checkIfLiked();
    }
  };

  // Check like status after ranger is loaded
  useEffect(() => {
    if (ranger && isAuthenticated && user && !hasCheckedLikeStatus) {
      checkIfLiked();
    }
  }, [ranger, isAuthenticated, user, hasCheckedLikeStatus]);

  const checkIfLiked = () => {
    if (!ranger) return;
    try {
      // Check localStorage for like status
      const likedRangers = JSON.parse(localStorage.getItem('liked_rangers') || '{}');
      const userLikedKey = `${user.id}_${ranger.id}`;
      if (likedRangers[userLikedKey]) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    } finally {
      setHasCheckedLikeStatus(true);
    }
  };

  const fetchRanger = async () => {
    try {
      const customRangersCollection = database.get('custom_rangers');
      const fetchedRangers = await customRangersCollection
        .query(Q.where('slug', slug))
        .fetch();

      if (fetchedRangers.length === 0) {
        showError('Ranger not found');
        navigate('/community');
        return;
      }

      const rangerRecord = fetchedRangers[0];

      // Verify it's published
      if (!rangerRecord.published) {
        showError('This ranger is not published');
        navigate('/community');
        return;
      }

      let teamName = rangerRecord.customTeamName;
      if (rangerRecord.teamId) {
        try {
          const team = await rangerRecord.team.fetch();
          teamName = team?.name || 'Unknown Team';
        } catch (err) {
          console.error('Error fetching team:', err);
          teamName = 'Unknown Team';
        }
      }

      const rangerData = {
        id: rangerRecord.id,
        name: rangerRecord.name,
        slug: rangerRecord.slug,
        title: rangerRecord.title,
        cardTitle: rangerRecord.cardTitle,
        color: rangerRecord.color,
        type: rangerRecord.type,
        abilityName: rangerRecord.abilityName,
        ability: rangerRecord.ability,
        teamId: rangerRecord.teamId || '',
        customTeamName: rangerRecord.customTeamName || '',
        teamName: teamName || 'No Team',
        teamPosition: rangerRecord.teamPosition,
        deck: JSON.parse(rangerRecord.deck || '[]'),
        extraCharacters: rangerRecord.extraCharacters
          ? JSON.parse(rangerRecord.extraCharacters)
          : [],
        createdAt: rangerRecord.createdAt,
        userId: rangerRecord.userId,
        record: rangerRecord,
      };

      setRanger(rangerData);
    } catch (error) {
      console.error('Error fetching ranger:', error);
      showError('Failed to load ranger');
      navigate('/community');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showError('Please log in to like rangers');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await trpcUtils.client.customRangers.unlike.mutate({ id: ranger.id });
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        showToast.success('Removed from likes');
        // Persist to localStorage
        const likedRangers = JSON.parse(localStorage.getItem('liked_rangers') || '{}');
        const userLikedKey = `${user.id}_${ranger.id}`;
        delete likedRangers[userLikedKey];
        localStorage.setItem('liked_rangers', JSON.stringify(likedRangers));
      } else {
        // Like
        await trpcUtils.client.customRangers.like.mutate({ id: ranger.id });
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        showToast.success('Added to likes!');
        // Persist to localStorage
        const likedRangers = JSON.parse(localStorage.getItem('liked_rangers') || '{}');
        const userLikedKey = `${user.id}_${ranger.id}`;
        likedRangers[userLikedKey] = true;
        localStorage.setItem('liked_rangers', JSON.stringify(likedRangers));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showError('Failed to update like status');
    }
  };

  const handleClone = () => {
    try {
      const clonedData = {
        name: `${ranger.name} (Clone)`,
        title: ranger.title || '',
        cardTitle: ranger.cardTitle || '',
        color: ranger.color,
        type: ranger.type,
        abilityName: ranger.abilityName,
        ability: ranger.ability,
        teamId: ranger.teamId || '',
        customTeamName: ranger.customTeamName || '',
        teamPosition: ranger.teamPosition || 1,
        deck: ranger.deck,
        extraCharacters: ranger.extraCharacters,
      };

      navigate('/rangers/create', { state: { clonedData } });
    } catch (error) {
      console.error('Error cloning ranger:', error);
      showError('Failed to clone ranger');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center dark:text-gray-100">Loading...</div>
      </div>
    );
  }

  if (!ranger) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link to="/community">← Back to Community</Link>
          </Button>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 dark:text-gray-100">{ranger.name}</h1>
              {ranger.title && (
                <p className="text-xl text-gray-600 dark:text-gray-300">{ranger.title}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Created by <span className="font-semibold">{username}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded ${getColor(ranger.color)} text-white font-semibold`}>
                {ranger.color.toUpperCase()}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  disabled={!isAuthenticated}
                >
                  <Heart
                    size={16}
                    className="mr-1"
                    fill={isLiked ? 'currentColor' : 'none'}
                  />
                  {likeCount}
                </Button>
                <Button onClick={handleClone} variant="outline" size="sm">
                  <Copy size={16} className="mr-1" />
                  Clone
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Character */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Primary Character: {ranger.abilityName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{ranger.ability}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">{ranger.teamName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {ranger.type.charAt(0).toUpperCase() + ranger.type.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra Characters */}
        {ranger.extraCharacters && ranger.extraCharacters.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Extra Characters ({ranger.extraCharacters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ranger.extraCharacters.map((character, index) => (
                  <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-semibold mb-1">{character.name}</h4>
                    {character.title && (
                      <p className="text-sm text-muted-foreground mb-2">{character.title}</p>
                    )}
                    <div className="bg-muted p-3 rounded">
                      <p className="font-medium text-sm mb-1">{character.abilityName}</p>
                      <p className="text-sm text-muted-foreground">{character.ability}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deck */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Deck</CardTitle>
          </CardHeader>
          <CardContent>
            {ranger.deck.length === 0 ? (
              <p className="text-muted-foreground">No cards in deck</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ranger.deck.map((card, index) => (
                  <div key={index} className="relative">
                    <RangerCard
                      card={{
                        name: card.name,
                        cardTitle: ranger.cardTitle || ranger.title,
                        type: card.type === 'custom' ? card.customType : card.type,
                        color: ranger.color.charAt(0).toUpperCase() + ranger.color.slice(1),
                        energy: card.energyCost,
                        shields: card.shields,
                        text: card.description ? [card.description] : [],
                        attack: (() => {
                          const attacks = [];
                          if (parseInt(card.attackHit) > 0) {
                            attacks.push({ value: parseInt(card.attackHit), fixed: true });
                          }
                          if (parseInt(card.attackDice) > 0) {
                            attacks.push({ value: parseInt(card.attackDice), fixed: false });
                          }
                          return attacks;
                        })(),
                        team: ranger.teamName,
                      }}
                    />
                    {card.count && card.count > 1 && (
                      <div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded-full text-sm font-bold">
                        ×{card.count}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <CommentsSection customRangerId={ranger.id} creatorId={ranger.userId} />
      </div>
    </div>
  );
};

export default CommunityRangerDetail;
