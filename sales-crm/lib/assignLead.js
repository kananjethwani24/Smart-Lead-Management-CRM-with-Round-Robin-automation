import getDb from './db';
import crypto from 'crypto';

/**
 * Smart Lead Assignment Logic (SQLite version)
 */
export async function assignLeadToCaller(lead) {
    try {
        const db = getDb();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Fetch all callers
        const allCallers = db.prepare('SELECT * FROM callers ORDER BY id').all();
        if (!allCallers?.length) return null;

        // Get today's lead counts per caller
        const todayCounts = db.prepare(
            'SELECT assigned_caller_id FROM leads WHERE created_at >= ? AND assigned_caller_id IS NOT NULL'
        ).all(todayISO);

        const countMap = {};
        (todayCounts || []).forEach(l => {
            countMap[l.assigned_caller_id] = (countMap[l.assigned_caller_id] || 0) + 1;
        });

        // Filter callers who haven't hit daily cap
        const availableCallers = allCallers.filter(c => {
            const used = countMap[c.id] || 0;
            return used < c.daily_lead_limit;
        });

        if (!availableCallers.length) return null;

        // 1. Try to find callers matched by State
        let eligibleCallers = [];
        let stateKey = '__global__';

        if (lead.state) {
            const normalizedState = lead.state.trim().toLowerCase();
            eligibleCallers = availableCallers.filter(c => {
                let states = c.assigned_states;
                if (typeof states === 'string') {
                    try { states = JSON.parse(states || '[]'); } catch (e) { states = []; }
                }
                return (states || []).some(s => s.toLowerCase() === normalizedState);
            });

            if (eligibleCallers.length > 0) {
                stateKey = normalizedState; // We found specialists for this specific state
            }
        }

        // 2. If no state-matched callers exist, use the full list (Global Fallback)
        if (eligibleCallers.length === 0) {
            eligibleCallers = availableCallers;
            stateKey = '__global__';
        }

        // 3. Implement Round Robin within the chosen eligible group
        const rrState = db.prepare('SELECT * FROM round_robin_state WHERE state_key = ?').get(stateKey);

        let nextCaller;
        if (rrState?.last_caller_id) {
            const lastIndex = eligibleCallers.findIndex(c => c.id === rrState.last_caller_id);
            // Cycle to next available, or start at index 0 if last person isn't in this group anymore
            const nextIndex = (lastIndex + 1) % eligibleCallers.length;
            nextCaller = eligibleCallers[nextIndex];
        } else {
            nextCaller = eligibleCallers[0];
        }

        if (!nextCaller) return null;

        // 4. Update the Round Robin tracker for this specific key (State or Global)
        db.prepare(
            `INSERT INTO round_robin_state (state_key, last_caller_id) VALUES (?, ?)
             ON CONFLICT(state_key) DO UPDATE SET last_caller_id = excluded.last_caller_id`
        ).run(stateKey, nextCaller.id);

        // 5. Finalize the assignment
        db.prepare('UPDATE leads SET assigned_caller_id = ? WHERE id = ?').run(nextCaller.id, lead.id);

        return nextCaller;
    } catch (error) {
        console.error('Error in assignLeadToCaller:', error);
        return null;
    }
}
