import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';

/**
 * Routes for user notifications.
 */
@Controller('api/notifications')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT auth :contentReference[oaicite:0]{index=0}
export class NotificationController {
    constructor(private readonly service: NotificationService) {}

    /**
     * GET /api/notifications?page=1&limit=20
     * Returns paginated notifications for the current user.
     */
    @Get()
    async list(@Query('page') page = '1', @Query('limit') limit = '20') {
        return this.service.findAll(+page, +limit);
    }

    /**
     * PATCH /api/notifications/:id/read
     * Marks a single notification as read.
     */
    @Patch(':id/read')
    async markOne(@Param('id') id: string) {
        return this.service.markAsRead(id);
    }

    /**
     * PATCH /api/notifications/read
     * Marks all notifications for the user as read.
     */
    @Patch('read')
    async markAll() {
        await this.service.markAllRead();
        return { message: 'All notifications marked as read' };
    }

    /**
     * DELETE /api/notifications/:id
     * Deletes a single notification.
     */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.service.delete(id);
        return { message: 'Deleted' };
    }
}
