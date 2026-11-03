const cron = require('node-cron');
const prisma = require('../db');

/**
 * Start automated chat message cleanup job
 * Runs daily at 2 AM, deletes messages older than 30 days
 * Excludes pinned announcements
 */
function startChatCleanup() {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[CLEANUP] Starting chat message cleanup...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete old messages (excluding pinned announcements)
      const result = await prisma.chatMessage.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          OR: [
            { type: 'MESSAGE' },
            { AND: [{ type: 'ANNOUNCEMENT' }, { isPinned: false }] },
          ],
        },
      });

      console.log(`[CLEANUP] Deleted ${result.count} old chat messages`);
    } catch (error) {
      console.error('[CLEANUP] Chat cleanup error:', error);
    }
  });

  console.log('[CLEANUP] Chat cleanup job scheduled (daily at 2 AM)');
}

module.exports = { startChatCleanup };
