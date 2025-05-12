import { Vote } from '@/types/article';

export class VoteStateManager {
    private static getVoteKey(targetId: string): string {
        return `vote_${targetId}`;
    }

    static saveVoteState(targetId: string, direction: 'up' | 'down' | null, fingerprint: string) {
        const key = this.getVoteKey(targetId);
        if (direction) {
            localStorage.setItem(key, JSON.stringify({ direction, fingerprint }));
        } else {
            localStorage.removeItem(key);
        }
    }

    static getVoteState(targetId: string, fingerprint: string): 'up' | 'down' | null {
        const key = this.getVoteKey(targetId);
        const stored = localStorage.getItem(key);
        
        if (!stored) return null;
        
        try {
            const data = JSON.parse(stored);
            return data.fingerprint === fingerprint ? data.direction : null;
        } catch {
            return null;
        }
    }

    static verifyVoteStates(votes: Vote[], fingerprint: string, targetId: string): 'up' | 'down' | null {
        // Find user's vote in database
        const userVote = votes.find(v => v.voter === fingerprint);
        const storedVote = this.getVoteState(targetId, fingerprint);

        if (!userVote) {
            // No vote in DB, clear localStorage
            this.saveVoteState(targetId, null, fingerprint);
            return null;
        }

        // Vote exists in DB, sync with localStorage
        if (storedVote !== userVote.direction) {
            this.saveVoteState(targetId, userVote.direction, fingerprint);
        }
        
        return userVote.direction as 'up' | 'down';
    }
}
