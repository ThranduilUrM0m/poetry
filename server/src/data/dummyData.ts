import { Types } from 'mongoose';
import slugify from 'slugify';

import { ViewDocument } from '../models/view.model';
export const dummyViews: Partial<ViewDocument>[] = [
    {
        _id: new Types.ObjectId('64ebeafd91e1bea198845f89'),
        _viewer: 'de70188181ebae2f3d8b4ef269f6c227',
        article: new Types.ObjectId('5f2fde4558803f59e4e07cdd'), // Fixed to point to boutaleb. article
        createdAt: new Date('2023-08-26T22:31:57.536Z'),
        updatedAt: new Date('2023-08-26T22:31:57.536Z'),
    },
    {
        _id: new Types.ObjectId('66a8ec668c35b3ebd6c01fd3'),
        _viewer: '502eac3e6a7d71288b56c1ed233afe2b',
        article: new Types.ObjectId('5f2fde4558803f59e4e07cdd'), // Fixed to point to boutaleb. article
        createdAt: new Date('2024-07-30T14:36:38.817Z'),
        updatedAt: new Date('2024-07-30T14:36:38.817Z'),
    },
    // new view on article 5e93853e...
    {
        _id: new Types.ObjectId('70b9f123abcd1234ef567890'),
        _viewer: 'aaaabbbbcccc111122223333',
        article: new Types.ObjectId('5e93853e0289c153a8737041'),
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
    },
    // new view on Hello World article
    {
        _id: new Types.ObjectId('70b9f123abcd1234ef567891'),
        _viewer: 'fff0ee0dd0ccbb0aa0998877',
        article: new Types.ObjectId('671d13b291cf6e74fb8bb9ef'),
        createdAt: new Date('2025-02-15T12:00:00.000Z'),
        updatedAt: new Date('2025-02-15T12:00:00.000Z'),
    },
];

import { VoteDocument } from '../models/vote.model';
export const dummyVotes: Partial<VoteDocument>[] = [
    {
        _id: new Types.ObjectId('64ebb261f0c23054c88e4800'),
        voter: 'de70188181ebae2f3d8b4ef269f6c227',
        targetType: 'Article',
        target: new Types.ObjectId('5f2fde4558803f59e4e07cdd'), // Fixed to point to boutaleb. article
        direction: 'up',
        createdAt: new Date('2023-08-27T20:30:25.368Z'),
        updatedAt: new Date('2023-08-27T20:30:25.368Z'),
    },
    // new vote on second article
    {
        _id: new Types.ObjectId('70b9f123abcd1234ef567892'),
        voter: '11223344556677889900aabb',
        targetType: 'Article',
        target: new Types.ObjectId('5e93936d0289c153a8737044'),
        direction: 'down',
        createdAt: new Date('2025-03-10T09:30:00.000Z'),
        updatedAt: new Date('2025-03-10T09:30:00.000Z'),
    },
    // new vote on Hello World article
    {
        _id: new Types.ObjectId('70b9f123abcd1234ef567893'),
        voter: 'ffeeddccbbaa998877665544',
        targetType: 'Article',
        target: new Types.ObjectId('671d13b291cf6e74fb8bb9ef'),
        direction: 'up',
        createdAt: new Date('2025-04-01T08:00:00.000Z'),
        updatedAt: new Date('2025-04-01T08:00:00.000Z'),
    },
];

import { CommentDocument } from '../models/comment.model';
export const dummyComments: Partial<CommentDocument>[] = [
    {
        _id: new Types.ObjectId('64eca1eb693faca7ec603d60'),
        Parent: null,
        _comment_isOK: true,
        _comment_author: 'Zakariae',
        _comment_email: '',
        _comment_body: 'Glad to have made your acquaintance',
        isFeatured: true,
        _comment_fingerprint: 'de70188181ebae2f3d8b4ef269f6c227',
        _comment_votes: [],
        article: new Types.ObjectId('5f2fde4558803f59e4e07cdd'),
        createdAt: new Date('2023-08-28T13:32:27.354+00:00'),
        updatedAt: new Date('2023-08-28T13:41:46.929+00:00'),
    },
];

import { UserDocument } from '../models/user.model';
export const dummyUsers: Partial<UserDocument>[] = [
    {
        _id: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        email: 'zakariaeboutaleb@gmail.com',
        username: 'ThranduilUrMom',
        passwordHash: '$2a$12$dhNcfpLRfKKB0kpVKeqnQeJAPcmdW2XMK047N1y09.A9GHQd.83Ba',
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
        body: `<p class="ql-direction-rtl ql-align-center"><strong><img src="https://i.ibb.co/nPgYCk5/018bb7733a70a2f4a4c2b5c78313f4f5a88293c0da.jpg" class="ql-align-center"></strong></p><p class="ql-direction-rtl ql-align-center"><br></p><p class="ql-direction-rtl ql-align-right"><strong>نظرة العالم تؤذيني، عفوا ! لا داعي لكل هذا الاستعداد قصد تدميري بجوابك : أنها وعلى العكس لا تعنيك، فأنا أتكلم وذاك الصوت الذي بداخلك، ذلك الصوت نشأ بنظرة العالم.</strong></p>`,
        title: '.نظرة العالم تهم',
        slug: slugify('.نظرة العالم تهم', { lower: true, strict: true }),
        votes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['نظرةالعالمتهم'],
        status: 'approved',
        views: [new Types.ObjectId('70b9f123abcd1234ef567890')],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e93936d0289c153a8737044'),
        createdAt: new Date('2020-04-13T03:23:57.214Z'),
        updatedAt: new Date('2023-06-25T03:23:57.990Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: `<p class="ql-align-justify"><img src="https://i.ibb.co/VpxBJrH/01e803880a6c31f7493c18ec891a15e7a45dc3ed5b.jpg" class="ql-align-justify">Le sadisme c’est l’art de penser que pour éduquer un enfant il est nécessaire ou même pire, vertueux, de lui faire endurer le malheur d’être puni physiquement.</p>`,
        title: 'Le Sadisme.',
        slug: slugify('Le Sadisme.', { lower: true, strict: true }),
        votes: [new Types.ObjectId('70b9f123abcd1234ef567892')],
        category: 'Education',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['sadisme'],
        status: 'approved',
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e7552999374103e40c5570e'),
        createdAt: new Date('2020-03-20T20:26:01.988Z'),
        updatedAt: new Date('2021-08-14T20:26:01.295Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: `<p class="ql-align-center"><img src="https://i.ibb.co/d2yx68q/ISRAE.jpg" class="ql-align-center"></p><p>A wise man once said :</p><blockquote><strong>When given the choice between being right </strong>and <strong>being kind, choose kind !</strong></blockquote>`,
        title: "Don't teach violence.",
        slug: slugify(`Don't teach violence.`, { lower: true, strict: true }),
        votes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['teachlove', 'stopviolence'],
        status: 'approved',
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e938cce0289c153a8737042'),
        createdAt: new Date('2020-04-12T20:29:02.322Z'),
        updatedAt: new Date('2021-06-17T20:29:02.005Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: `<p class="ql-align-left"><img src="https://i.ibb.co/wwC2GGP/B0-F334-D0-248-F-40-D1-AD91-63-FD3641-DE89.jpg" class="ql-align-left" width="202"><strong><u>à force de forger on devient forgeron</u></strong></p>`,
        title: 'Tolérer.',
        slug: slugify('Tolérer.', { lower: true, strict: true }),
        votes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['tolerance'],
        status: 'approved',
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e9396300289c153a8737045'),
        createdAt: new Date('2020-04-13T03:29:04.122Z'),
        updatedAt: new Date('2023-07-01T03:29:04.936Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: `<p class="ql-align-left"><img src="https://i.ibb.co/R0cC8Zh/IMG-2700.jpg" class="ql-align-left ql-float-left" width="106"><u>N’oublies jamais</u></p>`,
        title: "N'oublies.",
        slug: slugify(`N'oublies.`, { lower: true, strict: true }),
        votes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['vivre'],
        status: 'approved',
        views: [],
        isBio: false,
    },
    {
        _id: new Types.ObjectId('671d13b291cf6e74fb8bb9ef'),
        title: 'Hello World',
        slug: slugify('Hello World', { lower: true, strict: true }),
        body: `<p class="ql-direction-rtl ql-align-center"><strong><img src="https://i.ibb.co/nPgYCk5/018bb7733a70a2f4a4c2b5c78313f4f5a88293c0da.jpg" class="ql-align-center"></strong></p><p>My name is <em><u>Zakariae</u></em></p>`,
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        category: 'Community',
        isPrivate: false,
        isFeatured: true,
        tags: ['helloworld'],
        status: 'approved',
        comments: [],
        views: [new Types.ObjectId('70b9f123abcd1234ef567891')],
        votes: [new Types.ObjectId('70b9f123abcd1234ef567893')],
        createdAt: new Date('2024-10-26T15:27:14.380Z'),
        updatedAt: new Date('2024-10-26T15:27:14.380Z'),
        isBio: false,
    },
    {
        _id: new Types.ObjectId('5e938dac0289c153a8737043'),
        createdAt: new Date('2020-04-12T20:32:44.599Z'),
        updatedAt: new Date('2023-06-25T20:32:44.412Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: `<p class="ql-align-left"><img src="https://i.ibb.co/WkLgYtT/504170-D3-294-E-4-AFD-9-C5-A-89-C2-D8.jpg" class="ql-align-left"><strong class="ql-align-left">Some caption or quote</strong></p>`,
        title: 'La naïveté.',
        slug: slugify('La naïveté.', { lower: true, strict: true }),
        votes: [],
        category: 'Community',
        status: 'approved',
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
        body: `
      <p class="ql-reset">
        <img src="https://i.ibb.co/wzKvqGW/0160a791fa43629d5fa9928026f9c4a74296ec8043.jpg"
             class="ql-float-right img-responsive img-frame-shadow img-rotate img-rounded shape-polygon">
      </p>

      <div class="layout-column gap-md padding-right-lg relative">
        <h1 class="heading--highlight">
          From Tamagotchis to Tablets:<br>
          Educating the AI Generation
        </h1>

        <div class="content-col single-col margin-bottom-lg">
          <p class="ql-body">
            As a 90s kid standing at the classroom chalkboard, I never imagined I’d one day explain blockchain to students while troubleshooting a smartboard. Our generation bridges the analog-digital divide – we remember library card catalogs but mastered TikTok EduHacks.
          </p>
          <p class="ql-body">
            The real magic happens when floppy disk nostalgia meets AI-powered lesson plans. Students gasp at our “ancient” iPods but sit mesmerized by Windows 95 demos. We’ve become tech-time travelers, making retro tech relevant through augmented reality field trips.
          </p>
        </div>
      </div>

      <div class="clearfix margin-top-none"></div>

      <div class="grid-two-col gap-xl margin-y-lg">
        <div class="card card--light padding-lg rounded overflow-hidden relative">
          <div class="accent-bar accent-primary"></div>
          <h3 class="card-title indent-sm">Tech Milestones I’ve Witnessed</h3>
          <ul class="list-reset indent-md">
            <li class="list-item flex align-center border-dashed">
              <span class="icon-circle">🕹</span>
              <span class="list-text">1998: Oregon Trail in Computer Lab</span>
            </li>
            <li class="list-item flex align-center border-dashed">
              <span class="icon-circle">📱</span>
              <span class="list-text">2007: First iPhone in Classroom</span>
            </li>
            <li class="list-item flex align-center">
              <span class="icon-circle">🤖</span>
              <span class="list-text">2023: AI Writing Assistants</span>
            </li>
          </ul>
        </div>

        <div class="card card--alt padding-lg rounded relative">
          <h3 class="card-title indent-sm">Teaching Toolkit Evolution</h3>
          <div class="flex gap-md margin-bottom-md">
            <div class="tool-card">
              <div class="tool-icon">📼</div>
              <div class="tool-label">VHS Era</div>
            </div>
            <div class="tool-card">
              <div class="tool-icon">💻</div>
              <div class="tool-label">Smartboard Days</div>
            </div>
            <div class="tool-card">
              <div class="tool-icon">🌐</div>
              <div class="tool-label">Virtual Reality</div>
            </div>
          </div>
        </div>
      </div>

      <blockquote class="blockquote-primary margin-y-lg">
        "We didn't just adapt to technology – we became its translators, helping analog parents and digital natives understand each other."
      </blockquote>

      <div class="columns-two gap-lg margin-y-lg">
        <p class="ql-body">
          The real classroom magic happens when 90s nostalgia meets Gen Alpha pragmatism. My students laugh at our “ancient” CD-ROMs but sit mesmerized when I show my first GeoCities site. We’ve created a time-capsule curriculum where TikTok dances coexist with cursive writing workshops.
        </p>
        <p class="ql-body">
          Tomorrow’s challenge? Preparing kids for Mars colonies and quantum computing while keeping paper books “just because they smell nice.” Some things never change – the joy of a perfectly organized Trapper Keeper still rivals any productivity app.
        </p>
      </div>
    `,
        title: 'boutaleb.',
        slug: slugify('boutaleb.', { lower: true, strict: true }),
        votes: [new Types.ObjectId('64ebb261f0c23054c88e4800')],
        category: 'Community',
        comments: [new Types.ObjectId('64eca1eb693faca7ec603d60')],
        isPrivate: false,
        isFeatured: true,
        tags: ['boutaleb', 'aboutme'],
        views: [
            new Types.ObjectId('64ebeafd91e1bea198845f89'),
            new Types.ObjectId('66a8ec668c35b3ebd6c01fd3'),
        ],
        status: 'approved',
        isBio: true,
    },
    {
        _id: new Types.ObjectId('5e9368cf0289c153a8737040'),
        createdAt: new Date('2020-04-12T20:15:27.725Z'),
        updatedAt: new Date('2021-05-30T20:15:27.417Z'),
        author: new Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: `
      <p class="ql-align-center">
        <img src="https://i.ibb.co/ypCzwTW/017b0d5928490b41f9df0c4d362a680a0f41e64cb6.jpg"
             class="ql-align-center img-responsive">
        <span class="text-transparent">HIM</span>
      </p>
    `,
        title: 'Sweaters Chapter Two.',
        slug: slugify('Sweaters Chapter Two.', { lower: true, strict: true }),
        votes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        isFeatured: true,
        tags: ['tomyex', 'sweaters'],
        views: [],
        status: 'approved',
        isBio: false,
    },
];
