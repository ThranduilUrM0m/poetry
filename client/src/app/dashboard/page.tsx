'use client';
import React, { JSX, useState } from 'react'; // Removed unused useState import
import { useSelector } from 'react-redux';
import { useDashboard } from '@/context/DashboardContext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Article } from '@/types/article';
import {
    CalendarRange,
    Eye,
    LayoutTemplate,
    MessagesSquare,
    MonitorSmartphone,
    SquareUser,
    ThumbsUp,
    Timer,
    Users,
} from 'lucide-react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { VisitorIncrease, ReturningUsers } from '@/components/ui/HeroImage';
import { selectArticles } from '@/slices/articleSlice';
import { selectSubscribers } from '@/slices/subscriberSlice';
import { selectAnalyticsLoading, selectAnalytics } from '@/slices/analyticsSlice';
import {
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { normalizeString } from '@/utils/stringUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

interface TimeSeriesDataItem {
    date: string | Date;
    views?: number;
    count?: number;
    value?: number;
    rate?: number;
}

type TimeFrameOption = '24h' | '7d' | '30d' | '6m' | 'all';

interface DashboardFormValues {
    trafficTimespan: TimeFrameOption;
    subscribersTimespan: TimeFrameOption;
}

const computeImprovementPercentage = (current: number, baseline: number): string => {
    if (!baseline) return '0%';
    const diff = ((current - baseline) / baseline) * 100;
    return `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
};

// Helper to find max value in an object
const findMaxEntry = (obj: Record<string, number>): [string, number] | null => {
    if (!obj || Object.keys(obj).length === 0) return null;
    return Object.entries(obj).reduce((max, entry) =>
        entry[1] > (max?.[1] || -Infinity) ? entry : max
    );
};

export default function DashboardPage() {
    const { loadError, isReady, chartData } = useDashboard();
    const analyticsData = useSelector(selectAnalytics);
    const articles = useSelector(selectArticles);
    const subscribers = useSelector(selectSubscribers);
    const isAnalyticsLoading = useSelector(selectAnalyticsLoading);
    const [showAxisNumbers] = useState<boolean>(false);
    const { control, watch } = useForm<DashboardFormValues>({
        defaultValues: {
            trafficTimespan: '30d',
            subscribersTimespan: '30d',
        },
    });

    const filterDataByTimespan = (
        data: TimeSeriesDataItem[],
        timespan: TimeFrameOption
    ): TimeSeriesDataItem[] => {
        if (!data || data.length === 0) return [];
        const now = new Date();
        const cutoffDate = new Date(now);

        switch (timespan) {
            case '24h':
                cutoffDate.setDate(now.getDate() - 1);
                break;
            case '7d':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                cutoffDate.setDate(now.getDate() - 30);
                break;
            case '6m':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            default:
                return data;
        }

        return data.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });
    };

    const renderChartType = (
        data: TimeSeriesDataItem[],
        dataKey: string,
        chartType: 'area',
        gradientId: string
    ): JSX.Element => {
        const axisProps = showAxisNumbers ? {} : { hide: true, tick: false };
        return (
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4e73df" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4e73df" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip />
                <Legend />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke="#4e73df"
                    fill={`url(#${gradientId})`}
                />
            </AreaChart>
        );
    };

    const renderTimeSeriesChart = (
        data: TimeSeriesDataItem[],
        dataKey: string,
        chartType: 'area',
        gradientId: string = 'chartGradient',
        timespan: TimeFrameOption
    ): JSX.Element => {
        const filteredData = filterDataByTimespan(data, timespan);

        if (!filteredData || filteredData.length === 0) {
            const dummyData = [
                { date: 'Today', views: 0 },
                { date: 'Yesterday', views: 0 },
            ];
            return renderChartType(dummyData, dataKey, chartType, gradientId);
        }

        return renderChartType(filteredData, dataKey, chartType, gradientId);
    };

    const calculateArticleScore = (article: Article) => {
        const viewsCount = article.views?.length || 0;
        const commentsCount = article.comments?.length || 0;
        const upvotesCount = article.votes?.filter((v) => v.direction === 'up').length || 0;
        return viewsCount + commentsCount * 2 + upvotesCount * 3;
    };

    const getTopArticles = () => {
        return _.orderBy(articles, [calculateArticleScore], ['desc']).slice(0, 4);
    };

    const getTodaysVisits = (): number => {
        if (!analyticsData?.pageViews) return 0;
        const today = new Date().toISOString().split('T')[0];
        return analyticsData.pageViews.find((d) => d.date === today)?.views || 0;
    };

    const subscriberStats = React.useMemo(() => {
        // Group by date and count
        const counts: Record<string, number> = {};
        subscribers.forEach((sub) => {
            const date = new Date(sub.createdAt).toISOString().split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });
        return Object.entries(counts).map(([date, count]) => ({ date, count }));
    }, [subscribers]);

    // UPDATED: More robust most viewed page detection
    const getMostViewedPage = (): { path: string; views: number } => {
        if (!analyticsData?.userBehavior?.pageViewsByPath) {
            return { path: 'N/A', views: 0 };
        }
        const maxEntry = findMaxEntry(analyticsData.userBehavior.pageViewsByPath);
        return maxEntry ? { path: maxEntry[0], views: maxEntry[1] } : { path: 'N/A', views: 0 };
    };

    // UPDATED: Format age range display
    const formatAgeRange = (range: string): JSX.Element => {
        if (range.includes('-')) {
            const [start, end] = range.split('-');
            return (
                <>
                    {start} <span className="__age-suffix">yo</span>-{end}{' '}
                    <span className="__age-suffix">yo</span>
                </>
            );
        }
        return <>{range}</>;
    };

    // UPDATED: Most popular age range with fallback
    const getMostPopularAgeRange = (): { range: JSX.Element; count: number } => {
        if (!analyticsData?.audienceDemographics?.age) {
            return { range: <>N/A</>, count: 0 };
        }

        const maxEntry = findMaxEntry(analyticsData.audienceDemographics.age);
        if (!maxEntry) return { range: <>N/A</>, count: 0 };

        const [range, count] = maxEntry;
        return { range: formatAgeRange(range), count };
    };

    // UPDATED: Device distribution
    const getDeviceDistribution = (): { label: string; value: number }[] => {
        if (!analyticsData?.deviceInsights?.deviceTypes) return [];
        return Object.entries(analyticsData.deviceInsights.deviceTypes).map(([device, count]) => ({
            label: device,
            value: count,
        }));
    };

    // NEW: Compute visitor increase from real data
    const computeVisitorIncrease = (): { increase: number; percentage: string } => {
        const sortedPageViews = (analyticsData?.pageViews || [])
            .slice()
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedPageViews.length < 2) {
            return { increase: 0, percentage: '0%' };
        }

        // Get today and yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const last = sortedPageViews[sortedPageViews.length - 1];
        const prev = sortedPageViews[sortedPageViews.length - 2];
        const increase = last.views - prev.views;
        const percentage = computeImprovementPercentage(last.views, prev.views);

        return { increase, percentage };
    };

    // Calculate metrics once for rendering
    const visitorIncreaseData = computeVisitorIncrease();
    const newUsers = analyticsData?.engagementMetrics?.newUsers || 0;
    const returningUsers = analyticsData?.engagementMetrics?.returningUsers || 0;

    return (
        <div className="dashboard__main-home">
            {loadError && (
                <div className="dashboard__main-home-error">
                    <p>Error loading analytics: {loadError}</p>
                </div>
            )}

            {!isReady || isAnalyticsLoading ? (
                <div className="dashboard__main-home-loader">Calculating Analytics...</div>
            ) : (
                <div className="dashboard__main-home-grid">
                    <div className="__row">
                        {/* Visits Overview Card */}
                        <div className="__card __card--visits-overview">
                            <form className="__header _form">
                                <div className="_row">
                                    <h3 className="__header-title">Visits for today</h3>
                                    <FormField
                                        name="trafficTimespan"
                                        icon={<Timer />}
                                        control={control}
                                        type="select"
                                        options={[
                                            { value: '24h', label: 'Last 24 hours' },
                                            { value: '7d', label: 'Last 7 days' },
                                            { value: '30d', label: 'Last 30 days' },
                                            { value: '6m', label: 'Last 6 months' },
                                            { value: 'all', label: 'All time' },
                                        ]}
                                    />
                                </div>
                            </form>
                            <div className="__body">
                                <div className="__body-left">
                                    <div className="__todays-visits">
                                        <div className="__count">{getTodaysVisits()}</div>
                                    </div>
                                    <div className="__stats-grid">
                                        <div className="__stat-item">
                                            <LayoutTemplate />
                                            <div className="_content">
                                                <div className="__stat-label">Most Viewed Page</div>
                                                <div className="__stat-value">
                                                    {getMostViewedPage().path} (
                                                    {getMostViewedPage().views})
                                                </div>
                                            </div>
                                        </div>
                                        <div className="__stat-item">
                                            <SquareUser />
                                            <div className="_content">
                                                <div className="__stat-label">New Users</div>
                                                <div className="__stat-value">
                                                    {newUsers} {/* Using real data */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="__body-right">
                                    <div className="__body-chart">
                                        <ResponsiveContainer>
                                            {renderTimeSeriesChart(
                                                chartData.pageViews,
                                                'views',
                                                'area',
                                                'colorViews',
                                                watch('trafficTimespan')
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demographics Card */}
                        <div className="__card __card--demographics">
                            <form className="__header _form">
                                <div className="_row">
                                    <h3 className="__header-title">Age & Device Insights</h3>
                                </div>
                            </form>
                            <div className="__body">
                                <div className="__body-age">
                                    <div className="__age-stats">
                                        <div className="__range">
                                            {getMostPopularAgeRange().range}
                                        </div>
                                        <div className="__count">
                                            <Users /> {getMostPopularAgeRange().count} usr.
                                        </div>
                                        <CalendarRange />
                                    </div>
                                </div>
                                <div className="__body-devices">
                                    <MonitorSmartphone />
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart
                                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                        >
                                            <Pie
                                                data={getDeviceDistribution()}
                                                dataKey="value"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                fill="#8884d8"
                                            >
                                                {getDeviceDistribution().map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name, props) => [
                                                    `${value}`,
                                                    `${props.payload?.label || name}`,
                                                ]}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    const label = (
                                                        entry.payload as { label?: string }
                                                    )?.label;
                                                    return _.startCase(label || value);
                                                }}
                                                wrapperStyle={{ paddingTop: '20px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="__row">
                        {/* Subscriber Growth Chart */}
                        <div className="__card __card--subscribers">
                            <form className="__header _form">
                                <div className="_row">
                                    <h3 className="__header-title">Subscriber Growth</h3>
                                    <FormField
                                        name="subscribersTimespan"
                                        icon={<Timer />}
                                        control={control}
                                        type="select"
                                        options={[
                                            { value: '24h', label: 'Last 24 hours' },
                                            { value: '7d', label: 'Last 7 days' },
                                            { value: '30d', label: 'Last 30 days' },
                                            { value: '6m', label: 'Last 6 months' },
                                            { value: 'all', label: 'All time' },
                                        ]}
                                    />
                                </div>
                            </form>
                            <div className="__body">
                                <div className="__body-chart">
                                    <ResponsiveContainer>
                                        {renderTimeSeriesChart(
                                            subscriberStats || [],
                                            'count',
                                            'area',
                                            'colorSubs',
                                            watch('subscribersTimespan')
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Top Articles Card */}
                        <div className="__card __card--top-articles">
                            <form className="__header _form">
                                <div className="_row">
                                    <h3 className="__header-title">Top Performing Articles</h3>
                                </div>
                            </form>
                            <div className="__body">
                                <div className="__article-list">
                                    {getTopArticles().map((article) => (
                                        <div key={article._id} className="__article-item">
                                            <Link
                                                href={`/blog/${normalizeString(article.category)}/${
                                                    article.slug
                                                }`}
                                                className="__article-link"
                                            >
                                                <div className="__article-content">
                                                    <div className="__article-meta">
                                                        <span className="__article-category">
                                                            {article.category}
                                                        </span>
                                                        <span className="__article-date">
                                                            {formatDistanceToNow(
                                                                new Date(article.updatedAt!),
                                                                { addSuffix: true }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="_corps">
                                                        <h4 className="__article-title">
                                                            {article.title}
                                                        </h4>
                                                        <div className="__article-stats">
                                                            <span>
                                                                <Eye size={16} />{' '}
                                                                {article.views?.length || 0}
                                                            </span>
                                                            <span>
                                                                <MessagesSquare size={16} />{' '}
                                                                {article.comments?.length || 0}
                                                            </span>
                                                            <span>
                                                                <ThumbsUp size={16} />{' '}
                                                                {article.votes?.filter(
                                                                    (v) => v.direction === 'up'
                                                                ).length || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Combined Metrics Card */}
                        <div className="__card __card--double">
                            <div className="__card __card--doubleSummary">
                                <form className="__header _form">
                                    <div className="_row">
                                        <h3 className="__header-title">Visitor Increase</h3>
                                    </div>
                                </form>
                                <div className="__body">
                                    <div className="summary__count">
                                        {visitorIncreaseData.increase >= 0 ? '+' : ''}
                                        {visitorIncreaseData.increase} Visitors
                                    </div>
                                    <div className="summary__percentage">
                                        {visitorIncreaseData.percentage}
                                    </div>
                                    <VisitorIncrease />
                                </div>
                            </div>

                            <div className="__card __card--doubleReturn">
                                <form className="__header _form">
                                    <div className="_row">
                                        <h3 className="__header-title">Returning Users</h3>
                                    </div>
                                </form>
                                <div className="__body">
                                    <div className="summary__count">{returningUsers}</div>
                                    <div className="summary__percentage">
                                        {computeImprovementPercentage(
                                            returningUsers,
                                            analyticsData?.engagementMetrics?.returningUsers || 0
                                        )}
                                    </div>
                                    <ReturningUsers />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
