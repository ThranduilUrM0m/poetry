import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    NotFoundException,
    BadRequestException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Types, isObjectIdOrHexString } from 'mongoose';
import { ArticleService } from '../services/article.service';
import { Article, ArticleDocument } from '../models/article.model';
import { NotificationService } from 'src/services/notification.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';

export type PopulatedArticle =
    ReturnType<ArticleService['populateOne']> extends Promise<infer U> ? U : never;

@Controller('api/articles')
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService,
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway
    ) {}

    @Post()
    async create(@Body() dto: Partial<ArticleDocument>): Promise<PopulatedArticle> {
        const article = await this.articleService.createArticle(dto);

        await this.notificationService.create({
            category: 'article',
            action: 'created',
            title: 'Article Created',
            message: `A new article was created: "${article.title}"`,
            metadata: {
                articleId: article._id,
                title: article.title,
                category: article.category,
                isPrivate: article.isPrivate,
                isFeatured: article.isFeatured,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
            },
        });

        this.notificationGateway.server.emit('article:created', {
            type: 'created',
            article,
        });

        return article;
    }

    @Get()
    async findAll(): Promise<PopulatedArticle[]> {
        return this.articleService.getAllArticles();
    }

    @Get('bySlug/:category/:slug')
    async findBySlug(
        @Param('category') category: string,
        @Param('slug') slug: string
    ): Promise<PopulatedArticle> {
        return this.articleService.getBySlug(category, slug);
    }

    @Get(':category')
    async findByCategory(@Param('category') category: string): Promise<PopulatedArticle[]> {
        const list = await this.articleService.getByCategory(category);
        if (!list.length) {
            throw new NotFoundException(`No articles in "${category}"`);
        }
        return list;
    }

    @Patch(':identifier')
    async updateOne(
        @Param('identifier') idOrSlug: string,
        @Body() dto: Partial<ArticleDocument>
    ): Promise<PopulatedArticle> {
        const isId = isObjectIdOrHexString(idOrSlug);

        // 1. Fetch previous article
        let prevArticle: PopulatedArticle;
        try {
            prevArticle = isId
                ? await this.articleService.getById(idOrSlug)
                : await this.articleService.getBySlug(dto.category || '', idOrSlug);
        } catch (err) {
            throw new NotFoundException(`Article "${idOrSlug}" not found for update`);
        }

        // 2. Update article
        let article: PopulatedArticle;
        try {
            article = isId
                ? await this.articleService.updateById(idOrSlug, dto)
                : await this.articleService.updateBySlug(idOrSlug, dto);
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new BadRequestException(`Failed to update "${idOrSlug}"`);
        }

        // 3. Compare fields and build change summary
        const changedFields: Record<string, { old: any; new: any }> = {};
        for (const key of Object.keys(dto)) {
            if ((prevArticle as any)[key] !== (article as any)[key]) {
                changedFields[key] = {
                    old: (prevArticle as any)[key],
                    new: (article as any)[key],
                };
            }
        }

        // 4. Build message
        const changedKeys = Object.keys(changedFields);
        const message =
            changedKeys.length > 0
                ? `Article "${article.title}" updated: ${changedKeys
                      .map((k) => `${k}: "${changedFields[k].old}" → "${changedFields[k].new}"`)
                      .join(', ')}`
                : `Article "${article.title}" updated (no visible changes)`;

        // 5. Send notification
        await this.notificationService.create({
            category: 'article',
            action: 'updated',
            title: 'Article Updated',
            message,
            metadata: {
                articleId: article._id,
                title: article.title,
                category: article.category,
                isPrivate: article.isPrivate,
                isFeatured: article.isFeatured,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
                changed: changedFields,
            },
        });

        this.notificationGateway.server.emit('article:updated', {
            type: 'updated',
            article,
            changed: changedFields,
        });

        return article;
    }

    @Patch()
    async updateMany(@Body() dtos: Partial<ArticleDocument>[]): Promise<PopulatedArticle[]> {
        // Fetch previous articles for comparison
        const prevArticles = await this.articleService.getAllArticles();
        const prevMap = new Map(prevArticles.map((a) => [a._id.toString(), a]));

        const updatedArticles = await this.articleService.bulkUpdate(dtos);

        // For each updated article, send notification and emit
        for (const article of updatedArticles) {
            const prev = prevMap.get(article._id.toString());
            if (!prev) continue;

            // Compare fields
            const changedFields: Record<string, { old: any; new: any }> = {};
            for (const key of Object.keys(article)) {
                if ((prev as any)[key] !== (article as any)[key]) {
                    changedFields[key] = {
                        old: (prev as any)[key],
                        new: (article as any)[key],
                    };
                }
            }
            const changedKeys = Object.keys(changedFields);
            const message =
                changedKeys.length > 0
                    ? `Article "${article.title}" updated: ${changedKeys
                          .map((k) => `${k}: "${changedFields[k].old}" → "${changedFields[k].new}"`)
                          .join(', ')}`
                    : `Article "${article.title}" updated (no visible changes)`;

            await this.notificationService.create({
                category: 'article',
                action: 'updated',
                title: 'Article Updated',
                message,
                metadata: {
                    articleId: article._id,
                    title: article.title,
                    category: article.category,
                    isPrivate: article.isPrivate,
                    isFeatured: article.isFeatured,
                    createdAt: article.createdAt,
                    updatedAt: article.updatedAt,
                    changed: changedFields,
                },
            });

            this.notificationGateway.server.emit('article:updated', {
                type: 'updated',
                article,
                changed: changedFields,
            });
        }

        return updatedArticles;
    }

    @Delete(':identifier')
    async delete(@Param('identifier') idOrSlug: string): Promise<{ message: string }> {
        const isId = isObjectIdOrHexString(idOrSlug);
        let deletedArticle: PopulatedArticle | null = null;
        try {
            // Fetch before delete for notification details
            deletedArticle = isId
                ? await this.articleService.getById(idOrSlug)
                : await this.articleService.getBySlug('', idOrSlug);

            if (isId) {
                await this.articleService.deleteById(idOrSlug);
            } else {
                await this.articleService.deleteBySlug(idOrSlug);
            }
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new BadRequestException(`Failed to delete "${idOrSlug}"`);
        }

        if (deletedArticle) {
            await this.notificationService.create({
                category: 'article',
                action: 'deleted',
                title: 'Article Deleted',
                message: `Article deleted: "${deletedArticle.title}"`,
                metadata: {
                    articleId: deletedArticle._id,
                    title: deletedArticle.title,
                    category: deletedArticle.category,
                    isPrivate: deletedArticle.isPrivate,
                    isFeatured: deletedArticle.isFeatured,
                    createdAt: deletedArticle.createdAt,
                    updatedAt: deletedArticle.updatedAt,
                },
            });

            this.notificationGateway.server.emit('article:deleted', {
                type: 'deleted',
                deletedArticle,
            });
        }

        return { message: `Deleted ${isId ? 'ID' : 'slug'} ${idOrSlug}` };
    }

    @Post(':id/views')
    async trackView(
        @Param('id') id: string,
        @Body('fingerprint') fp: string
    ): Promise<PopulatedArticle> {
        try {
            const { article, changed } = await this.articleService.trackView(id, fp);

            if (changed) {
                await this.notificationService.create({
                    category: 'article',
                    action: 'viewed',
                    title: 'Article Viewed',
                    message: `Article "${article.title}" was viewed.`,
                    metadata: {
                        articleId: article._id,
                        title: article.title,
                        category: article.category,
                        isPrivate: article.isPrivate,
                        isFeatured: article.isFeatured,
                        createdAt: article.createdAt,
                        updatedAt: article.updatedAt,
                        fingerprint: fp,
                    },
                });

                this.notificationGateway.server.emit('article:viewed', {
                    type: 'viewed',
                    article,
                    fingerprint: fp,
                });
            }

            return article;
        } catch {
            throw new HttpException('Failed to track view', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post(':id/vote')
    async toggleVote(
        @Param('id') id: string,
        @Body() body: { fingerprint: string; direction: 'up' | 'down' }
    ): Promise<PopulatedArticle> {
        try {
            const { article, changed } = await this.articleService.toggleVote(
                id,
                body.fingerprint,
                body.direction
            );

            if (changed) {
                await this.notificationService.create({
                    category: 'article',
                    action: 'voted',
                    title: 'Article Voted',
                    message: `Article "${article.title}" received a "${body.direction}" vote.`,
                    metadata: {
                        articleId: article._id,
                        title: article.title,
                        category: article.category,
                        isPrivate: article.isPrivate,
                        isFeatured: article.isFeatured,
                        createdAt: article.createdAt,
                        updatedAt: article.updatedAt,
                        fingerprint: body.fingerprint,
                        direction: body.direction,
                    },
                });

                this.notificationGateway.server.emit('article:voted', {
                    type: 'voted',
                    article,
                    direction: body.direction,
                    fingerprint: body.fingerprint,
                });
            }

            return article;
        } catch {
            throw new HttpException('Failed to process vote', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
