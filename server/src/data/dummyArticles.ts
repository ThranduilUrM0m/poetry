import { Types } from 'mongoose';
import slugify from 'slugify';

import { ViewDocument } from '../models/view.model';
export const dummyViews: Partial<ViewDocument>[] = [
    {
        _id: new Types.ObjectId('64ebeafd91e1bea198845f89'),
        _viewer: 'de70188181ebae2f3d8b4ef269f6c227',
        createdAt: new Date('2023-08-26T22:31:57.536Z'),
        updatedAt: new Date('2023-08-26T22:31:57.536Z'),
    },
    {
        _id: new Types.ObjectId('66a8ec668c35b3ebd6c01fd3'),
        _viewer: '502eac3e6a7d71288b56c1ed233afe2b',
        createdAt: new Date('2024-07-30T14:36:38.817Z'),
        updatedAt: new Date('2024-07-30T14:36:38.817Z'),
    },
];

import { UpvoteDocument } from '../models/upvote.model';
export const dummyUpvotes: Partial<UpvoteDocument>[] = [
    {
        _id: new Types.ObjectId('64ebb261f0c23054c88e4800'),
        _upvoter: 'de70188181ebae2f3d8b4ef269f6c227',
        createdAt: new Date('2023-08-27T20:30:25.368+00:00'),
        updatedAt: new Date('2023-08-27T20:30:25.368+00:00'),
    },
];

import { DownvoteDocument } from '../models/downvote.model';
export const dummyDownvotes: Partial<DownvoteDocument>[] = [];

import { CommentDocument } from '../models/comment.model';
export const dummyComments: Partial<CommentDocument>[] = [
    {
        _id: new Types.ObjectId('64eca1eb693faca7ec603d60'),
        Parent: null,
        _comment_isOK: true,
        _comment_author: 'Zakariae',
        _comment_email: '',
        _comment_body: 'Glad to have made your acquaintance',
        _comment_isPrivate: false,
        isFeatured: true,
        _comment_fingerprint: 'de70188181ebae2f3d8b4ef269f6c227',
        _comment_upvotes: [],
        _comment_downvotes: [],
        article: new Types.ObjectId('5e93853e0289c153a8737041'),
        createdAt: new Date('2023-08-28T13:32:27.354+00:00'),
        updatedAt: new Date('2023-08-28T13:41:46.929+00:00'),
    },
];

import { UserDocument } from '../models/user.model';
export const dummyUsers: Partial<UserDocument>[] = [
    {
        _id: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        email: 'zakariaeboutaleb@gmail.com',
        username: 'zakariae',
        password: 'hashed_password',
        isVerified: true,
        isActive: true,
        createdAt: new Date('2023-07-29T15:25:10.397Z'),
        updatedAt: new Date('2024-10-23T15:25:10.392Z'),
        city: 'Meknes',
        firstName: 'Zakariae',
        lastName: 'Boutaleb',
        country: { _code: 'MA', _country: 'Morocco' },
    },
];

import { ArticleDocument } from '../models/article.model';
export const dummyArticles: Partial<ArticleDocument>[] = [
    {
        _id: new Types.ObjectId('5e93853e0289c153a8737041'),
        createdAt: new Date('2020-04-12T20:23:26.046Z'),
        updatedAt: new Date('2021-07-17T20:23:26.933Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p class="ql-direction-rtl ql-align-center"><strong><img src="https://i.ibb.co/nPgYCk5/018bb7733a70a2f4a4c2b5c78313f4f5a88293c0da.jpg"></strong></p><p class="ql-direction-rtl ql-align-center"><br></p><p class="ql-direction-rtl ql-align-right"><strong>نظرة العالم تؤذيني، عفوا ! لا داعي لكل هذا الاستعداد قصد تدميري بجوابك : أنها وعلى العكس لا تعنيك، فأنا أتكلم وذاك الصوت الذي بداخلك، ذلك الصوت نشأ بنظرة العالم.</strong></p>',
        downvotes: [],
        title: '.نظرة العالم تهم',
        slug: slugify('.نظرة العالم تهم', { lower: true, strict: true }),
        upvotes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['نظرةالعالمتهم'],
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e93936d0289c153a8737044'),

        createdAt: new Date('2020-04-13T03:23:57.214Z'),
        updatedAt: new Date('2023-06-25T03:23:57.990Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(38, 38, 38);"><img src="https://i.ibb.co/VpxBJrH/01e803880a6c31f7493c18ec891a15e7a45dc3ed5b.jpg">Le sadisme c’est l’art de penser que pour éduquer un enfant il est nécessaire ou même pire, vertueux, de lui faire endurer le malheur d’être puni physiquement.</span></p>',
        downvotes: [],
        title: 'Le Sadisme.',
        slug: slugify('Le Sadisme.', { lower: true, strict: true }),
        upvotes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['sadisme'],
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e7552999374103e40c5570e'),

        createdAt: new Date('2020-03-20T20:26:01.988Z'),
        updatedAt: new Date('2021-08-14T20:26:01.295Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><img src="https://i.ibb.co/d2yx68q/ISRAE.jpg" style="display: block; margin: auto;"></p><p>A wise man once said :</p><blockquote><strong>When given the choice between being right </strong>and <strong>being kind, choose kind !</strong></blockquote>',
        downvotes: [],
        title: "Don't teach violence.",
        upvotes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['teachlove', 'stopviolence'],
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e938cce0289c153a8737042'),

        createdAt: new Date('2020-04-12T20:29:02.322Z'),
        updatedAt: new Date('2021-06-17T20:29:02.005Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(102, 102, 102);"><img src="https://i.ibb.co/wwC2GGP/B0-F334-D0-248-F-40-D1-AD91-63-FD3641-DE89.jpg" width="202"></span><strong style="color: rgb(102, 102, 102);"><u>à force de forger on devient forgeron</u></strong></p>',
        downvotes: [],
        title: 'Tolérer.',
        slug: slugify('Tolérer.', { lower: true, strict: true }),
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['tolerance'],
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e9396300289c153a8737045'),

        createdAt: new Date('2020-04-13T03:29:04.122Z'),
        updatedAt: new Date('2023-07-01T03:29:04.936Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(38, 38, 38);"><img src="https://i.ibb.co/R0cC8Zh/IMG-2700.jpg" style="display: inline; float: left; margin: 0px 1em 1em 0px;" width="106"></span><u style="color: rgb(38, 38, 38);">N’oublies jamais</u></p>',
        downvotes: [],
        title: "N'oublies.",
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['vivre'],
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('671d13b291cf6e74fb8bb9ef'),

        title: 'Hello World',
        slug: slugify('Hello World', { lower: true, strict: true }),
        body: '<p class="ql-direction-rtl ql-align-center"><strong><img src="https://i.ibb.co/nPgYCk5/018bb7733a70a2f4a4c2b5c78313f4f5a88293c0da.jpg"></strong></p><p>My name is <em><u>Zakariae</u></em></p>',
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        category: 'community',
        isPrivate: false,
        isFeatured: true,
        tags: ['helloWorld'],
        comments: [],
        views: [],
        upvotes: [],
        downvotes: [],
        createdAt: new Date('2024-10-26T15:27:14.380Z'),
        updatedAt: new Date('2024-10-26T15:27:14.380Z'),
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e938dac0289c153a8737043'),

        createdAt: new Date('2020-04-12T20:32:44.599Z'),
        updatedAt: new Date('2023-06-25T20:32:44.412Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(102, 102, 102);"><img src="https://i.ibb.co/WkLgYtT/504170-D3-294-E-4-AFD-9-C5-A-89-C2-D8-B71-A6-B.jpg"></span></p>',
        downvotes: [],
        title: 'La naïveté.',
        slug: slugify('La naïveté.', { lower: true, strict: true }),
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: [],
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5f2fde4558803f59e4e07cdd'),

        createdAt: new Date('2020-08-09T20:30:14.438Z'),
        updatedAt: new Date('2023-06-25T20:30:14.732Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><img src="https://i.ibb.co/wzKvqGW/0160a791fa43629d5fa9928026f9c4a74296ec8043.jpg" style="display: inline; float: left; margin: 0px 1em 1em 0px; cursor: nesw-resize;" width="456">An elemantary teacher born in the 90\'s, yeah I was around when messenger was the thing.</p>',
        downvotes: [],
        title: 'boutaleb.',
        slug: slugify('boutaleb.', { lower: true, strict: true }),
        upvotes: [new Types.ObjectId('64ebb261f0c23054c88e4800')],
        category: 'Community',
        comments: [new Types.ObjectId('64eca1eb693faca7ec603d60')],
        isPrivate: false,
        isFeatured: true,
        tags: ['boutaleb', 'aboutme'],
        views: [
            new Types.ObjectId('64ebeafd91e1bea198845f89'),
            new Types.ObjectId('66a8ec668c35b3ebd6c01fd3'),
        ],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e9368cf0289c153a8737040'),

        createdAt: new Date('2020-04-12T20:15:27.725Z'),
        updatedAt: new Date('2021-05-30T20:15:27.417Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="background-color: transparent;"><img src="https://i.ibb.co/ypCzwTW/017b0d5928490b41f9df0c4d362a680a0f41e64cb6.jpg">HIM</span></p>',
        downvotes: [],
        title: 'Sweaters Chapter Two.',
        slug: slugify('Sweaters Chapter Two.', { lower: true, strict: true }),
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['tomyex', 'sweaters'],
        views: [],
        isBio: false,
    },
];
