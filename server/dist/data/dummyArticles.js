"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummyArticles = exports.dummyUsers = void 0;
const mongoose_1 = require("mongoose");
exports.dummyUsers = [
    {
        _id: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
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
exports.dummyArticles = [
    {
        _id: new mongoose_1.Types.ObjectId('5e93853e0289c153a8737041'),
        slug: '5e93853e0289c153a8737041',
        createdAt: new Date('2020-04-12T20:23:26.046Z'),
        updatedAt: new Date('2021-07-17T20:23:26.933Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p class="ql-direction-rtl ql-align-center"><strong><img src="https://i.ibb.co/nPgYCk5/018bb7733a70a2f4a4c2b5c78313f4f5a88293c0da.jpg"></strong></p><p class="ql-direction-rtl ql-align-center"><br></p><p class="ql-direction-rtl ql-align-right"><strong>نظرة العالم تؤذيني، عفوا ! لا داعي لكل هذا الاستعداد قصد تدميري بجوابك : أنها وعلى العكس لا تعنيك، فأنا أتكلم وذاك الصوت الذي بداخلك، ذلك الصوت نشأ بنظرة العالم.</strong></p>',
        downvotes: [],
        title: '.نظرة العالم تهم',
        upvotes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        tags: ['نظرةالعالمتهم'],
        views: [],
    },
    {
        _id: new mongoose_1.Types.ObjectId('5e93936d0289c153a8737044'),
        slug: '5e93936d0289c153a8737044',
        createdAt: new Date('2020-04-13T03:23:57.214Z'),
        updatedAt: new Date('2023-06-25T03:23:57.990Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(38, 38, 38);"><img src="https://i.ibb.co/VpxBJrH/01e803880a6c31f7493c18ec891a15e7a45dc3ed5b.jpg">Le sadisme c’est l’art de penser que pour éduquer un enfant il est nécessaire ou même pire, vertueux, de lui faire endurer le malheur d’être puni physiquement.</span></p>',
        downvotes: [],
        title: 'Le Sadisme.',
        upvotes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        tags: ['sadisme'],
        views: [],
    },
    {
        _id: new mongoose_1.Types.ObjectId('5e7552999374103e40c5570e'),
        slug: '5e7552999374103e40c5570e',
        createdAt: new Date('2020-03-20T20:26:01.988Z'),
        updatedAt: new Date('2021-08-14T20:26:01.295Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><img src="https://i.ibb.co/d2yx68q/ISRAE.jpg" style="display: block; margin: auto;"></p><p>A wise man once said :</p><blockquote><strong>When given the choice between being right </strong>and <strong>being kind, choose kind !</strong></blockquote>',
        downvotes: [],
        title: "Don't teach violence.",
        upvotes: [],
        category: 'Education',
        comments: [],
        isPrivate: false,
        tags: ['teachlove', 'stopviolence'],
        views: [],
    },
    {
        _id: new mongoose_1.Types.ObjectId('5e938cce0289c153a8737042'),
        slug: '5e938cce0289c153a8737042',
        createdAt: new Date('2020-04-12T20:29:02.322Z'),
        updatedAt: new Date('2021-06-17T20:29:02.005Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(102, 102, 102);"><img src="https://i.ibb.co/wwC2GGP/B0-F334-D0-248-F-40-D1-AD91-63-FD3641-DE89.jpg" width="202"></span><strong style="color: rgb(102, 102, 102);"><u>à force de forger on devient forgeron</u></strong></p>',
        downvotes: [],
        title: 'Tolérer.',
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        tags: ['tolerance'],
        views: [],
    },
    {
        _id: new mongoose_1.Types.ObjectId('5e9396300289c153a8737045'),
        slug: '5e9396300289c153a8737045',
        createdAt: new Date('2020-04-13T03:29:04.122Z'),
        updatedAt: new Date('2023-07-01T03:29:04.936Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(38, 38, 38);"><img src="https://i.ibb.co/R0cC8Zh/IMG-2700.jpg" style="display: inline; float: left; margin: 0px 1em 1em 0px;" width="106"></span><u style="color: rgb(38, 38, 38);">N’oublies jamais</u></p>',
        downvotes: [],
        title: "N'oublies.",
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        tags: ['vivre'],
        views: [],
    },
    {
        _id: new mongoose_1.Types.ObjectId('671d13b291cf6e74fb8bb9ef'),
        slug: '671d13b291cf6e74fb8bb9ef',
        title: 'Hello World',
        body: '<p>My name is <em><u>Zakariae</u></em></p>',
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        category: 'community',
        isPrivate: false,
        tags: [],
        comments: [],
        views: [],
        upvotes: [],
        downvotes: [],
        createdAt: new Date('2024-10-26T15:27:14.380Z'),
        updatedAt: new Date('2024-10-26T15:27:14.380Z'),
    },
    {
        _id: new mongoose_1.Types.ObjectId('5e938dac0289c153a8737043'),
        slug: '5e938dac0289c153a8737043',
        createdAt: new Date('2020-04-12T20:32:44.599Z'),
        updatedAt: new Date('2023-06-25T20:32:44.412Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="color: rgb(102, 102, 102);"><img src="https://i.ibb.co/WkLgYtT/504170-D3-294-E-4-AFD-9-C5-A-89-C2-D8-B71-A6-B.jpg"></span></p>',
        downvotes: [],
        title: 'La naïveté.',
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        tags: [],
        views: [],
    },
    {
        _id: new mongoose_1.Types.ObjectId('5f2fde4558803f59e4e07cdd'),
        slug: '5f2fde4558803f59e4e07cdd',
        createdAt: new Date('2020-08-09T20:30:14.438Z'),
        updatedAt: new Date('2023-06-25T20:30:14.732Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><img src="https://i.ibb.co/wzKvqGW/0160a791fa43629d5fa9928026f9c4a74296ec8043.jpg" style="display: inline; float: left; margin: 0px 1em 1em 0px; cursor: nesw-resize;" width="456">An elemantary teacher born in the 90\'s, yeah I was around when messenger was the thing.</p>',
        downvotes: [],
        title: 'boutaleb.',
        upvotes: [new mongoose_1.Types.ObjectId('64ebb261f0c23054c88e4800')],
        category: 'Community',
        comments: [new mongoose_1.Types.ObjectId('64eca1eb693faca7ec603d60')],
        isPrivate: false,
        tags: ['boutaleb', 'aboutme'],
        views: [
            new mongoose_1.Types.ObjectId('64ebeafd91e1bea198845f89'),
            new mongoose_1.Types.ObjectId('66a8ec668c35b3ebd6c01fd3'),
        ],
    },
    {
        _id: new mongoose_1.Types.ObjectId('5e9368cf0289c153a8737040'),
        slug: '5e9368cf0289c153a8737040',
        createdAt: new Date('2020-04-12T20:15:27.725Z'),
        updatedAt: new Date('2021-05-30T20:15:27.417Z'),
        author: new mongoose_1.Types.ObjectId('64c52786fb1b9964f2e5b06c'),
        body: '<p><span style="background-color: transparent;"><img src="https://i.ibb.co/ypCzwTW/017b0d5928490b41f9df0c4d362a680a0f41e64cb6.jpg">HIM</span></p>',
        downvotes: [],
        title: 'Sweaters Chapter Two.',
        upvotes: [],
        category: 'Community',
        comments: [],
        isPrivate: false,
        tags: ['tomyex', 'sweaters'],
        views: [],
    },
];
//# sourceMappingURL=dummyArticles.js.map