/**
 * dashboard/page.tsx
 * -------------------
 * This Dashboard page displays selected analytics charts and summary cards.
 * It displays the Visitor Traffic and Subscriber Growth charts with their respective
 * summary panels. The categorical analytics charts have been removed here and moved
 * to the dashboard/articles/page.tsx.
 */
'use client';
import React, { useState, JSX } from 'react';
import { useSelector } from 'react-redux';
import { useDashboard } from '@/context/DashboardContext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Article } from '@/types/article';
import { CalendarRange, Eye, LayoutTemplate, MessagesSquare, MonitorSmartphone, SquareUser, ThumbsUp, Timer, Users } from 'lucide-react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import { VisitorIncrease } from '@/components/ui/HeroImage';
import { ReturningUsers } from '@/components/ui/HeroImage';

// Import prerequisite data slices
import { selectArticles } from '@/slices/articleSlice';

// Import aggregated analytics thunk and selectors.
import { selectAnalyticsCalculating, selectAnalytics } from '@/slices/analyticsSlice';

// Import Recharts components.
import {
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// ----------------------------------------------------------------------
// Define Interfaces for Chart Data Types
// ----------------------------------------------------------------------
interface TimeSeriesDataItem {
    date: string | Date;
    views?: number;
    count?: number;
    value?: number;
    rate?: number;
}

/* interface AudienceDemographics {
    age: { [range: string]: number };
    gender: { male: number; female: number; other: number };
}

interface ArticleStats {
    articleTitle: string;
    views: number;
    votes: number;
} */

// Add type for timespan options
type TimeFrameOption = '24h' | '7d' | '30d' | '6m' | 'all';

interface DashboardFormValues {
    trafficTimespan: TimeFrameOption;
    subscribersTimespan: TimeFrameOption;
}

// ----------------------------------------------------------------------
// Dummy Calculation Functions
// ----------------------------------------------------------------------
const computeImprovementPercentage = (current: number, baseline: number): string => {
    if (!baseline) return '0%';
    const diff = ((current - baseline) / baseline) * 100;
    return `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
};

// Dummy baseline index for demonstration purposes.
const baselineIndex = 100;

// Helper function to format audience data in case pageViews is empty
const formatAudienceData = (
    ageData: { [key: string]: number } | undefined
): TimeSeriesDataItem[] => {
    if (!ageData) return [];
    return Object.entries(ageData).map(([range, count]) => ({
        date: range,
        views: count,
    }));
};

// ----------------------------------------------------------------------
// Dashboard Page Component
// ----------------------------------------------------------------------
export default function DashboardPage() {
    const { loadError, isReady, chartData } = useDashboard();
    console.log('[Page] Using context values:', { isReady, chartData });

    // Retrieve auth-related data.
    const analyticsData = useSelector(selectAnalytics);

    const articles = useSelector(selectArticles);

    // Retrieve aggregated analytics data.
    const isAnalyticsCalculating = useSelector(selectAnalyticsCalculating);

    // Local state for chart controls.
    const [showAxisNumbers] = useState<boolean>(false); // Axis numbers hidden by default

    // Replace single timespan state with form control
    const { control, watch } = useForm<DashboardFormValues>({
        defaultValues: {
            trafficTimespan: '30d',
            subscribersTimespan: '30d',
        },
    });

    // ----------------------------------------------------------------------
    // Chart Rendering Helpers with Legend & Axis Controls
    // ----------------------------------------------------------------------
    const filterDataByTimespan = (
        data: TimeSeriesDataItem[],
        timespan: TimeFrameOption
    ): TimeSeriesDataItem[] => {
        if (!data || data.length === 0) return [];

        const now = new Date();
        const msPerDay = 24 * 60 * 60 * 1000;

        const getDaysAgo = (days: number) => new Date(now.getTime() - days * msPerDay);

        let cutoffDate;
        switch (timespan) {
            case '24h':
                cutoffDate = getDaysAgo(1);
                break;
            case '7d':
                cutoffDate = getDaysAgo(7);
                break;
            case '30d':
                cutoffDate = getDaysAgo(30);
                break;
            case '6m':
                cutoffDate = getDaysAgo(180);
                break;
            default:
                return data; // 'all' case
        }

        return data.filter((item) => new Date(item.date) >= cutoffDate);
    };

    const renderTimeSeriesChart = (
        data: TimeSeriesDataItem[],
        dataKey: string,
        chartType: 'area' | 'line' | 'bar',
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

    // Helper function to render specific chart type
    const renderChartType = (
        data: TimeSeriesDataItem[],
        dataKey: string,
        chartType: 'area' | 'line' | 'bar',
        gradientId: string
    ): JSX.Element => {
        const axisProps = showAxisNumbers ? {} : { hide: true, tick: false };

        switch (chartType) {
            case 'area':
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
            case 'line':
                return (
                    <LineChart data={data}>
                        <XAxis dataKey="date" {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={dataKey} stroke="#4e73df" />
                    </LineChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        <XAxis dataKey="date" {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={dataKey} fill="#4e73df" />
                    </BarChart>
                );
            default:
                return <></>;
        }
    };

    // Add these helper functions near your other helpers
    const calculateArticleScore = (article: Article) => {
        const viewsCount = article.views?.length || 0;
        const commentsCount = article.comments?.length || 0;
        const upvotesCount = article.votes?.filter((vote) => vote.direction === 'up').length || 0;
        return viewsCount + commentsCount * 2 + upvotesCount * 3;
    };

    const getTopArticles = () => {
        return _.orderBy(articles, [calculateArticleScore], ['desc']).slice(0, 4);
    };

    // Dummy calculation for visitor increase card.
    const visitorIncrease = 10; // Replace with dynamic calculation based on analytics.pageViews differences.

    const getTodaysVisits = (): number => {
        if (!analyticsData?.pageViews) return 0;
        const today = new Date().toISOString().split('T')[0];
        return analyticsData.pageViews.find((d) => d.date === today)?.views || 0;
    };

    const getMostViewedPage = (): { title: string; views: number } => {
        if (!analyticsData?.userBehavior?.pageViewsDetail) return { title: 'N/A', views: 0 };
        const entries = Object.entries(analyticsData.userBehavior.pageViewsDetail);
        const [title, views] = entries.reduce(
            (max, entry) => (entry[1] > max[1] ? entry : max),
            ['', 0]
        );
        return { title, views };
    };

    // Add this helper function with the other helper functions
    const formatAgeRange = (range: string): JSX.Element => {
        // Handle various possible formats
        const [start, end] = range.split('-');
        if (!start || !end) return <>{range}</>; // Return original if not in expected format

        // Remove any existing 'yo' suffix and clean numbers
        const cleanStart = start.replace('yo', '').trim();
        const cleanEnd = end.replace('yo', '').trim();

        return (
            <>
                {cleanStart}
                <span className="__age-suffix">yo</span>-{cleanEnd}
                <span className="__age-suffix">yo</span>
            </>
        );
    };

    // Update the getMostPopularAgeRange function to handle JSX
    const getMostPopularAgeRange = (): { range: JSX.Element; count: number } => {
        if (!analyticsData?.audienceDemographics?.age) {
            return { range: <>N/A</>, count: 0 };
        }

        const ageRanges = Object.entries(analyticsData.audienceDemographics.age);

        // Get the max range and format it
        const { range, count } = ageRanges.reduce(
            (max, [range, count]) => (count > max.count ? { range, count } : max),
            { range: '', count: 0 }
        );

        return {
            range: formatAgeRange(range),
            count,
        };
    };

    const getDeviceDistribution = (): { label: string; value: number }[] => {
        if (!analyticsData?.deviceInsights?.deviceTypes) return [];
        return Object.entries(analyticsData.deviceInsights.deviceTypes).map(([device, count]) => ({
            label: device,
            value: count,
        }));
    };

    return (
        <div className="dashboard__main-home">
            {loadError && (
                <div className="dashboard__main-home-error">
                    <p>Error loading analytics: {loadError}</p>
                </div>
            )}
            {isAnalyticsCalculating ? (
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
                                            {
                                                value: '24h',
                                                label: 'Last 24 hours',
                                            },
                                            {
                                                value: '7d',
                                                label: 'Last 7 days',
                                            },
                                            {
                                                value: '30d',
                                                label: 'Last 30 days',
                                            },
                                            {
                                                value: '6m',
                                                label: 'Last 6 months',
                                            },
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
                                                    {getMostViewedPage().title} (
                                                    {getMostViewedPage().views})
                                                </div>
                                            </div>
                                        </div>
                                        <div className="__stat-item">
                                            <SquareUser />
                                            <div className="_content">
                                                <div className="__stat-label">New Users</div>
                                                <div className="__stat-value">
                                                    {analyticsData.engagementMetrics?.newUsers || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="__body-right">
                                    <div className="__body-chart">
                                        <ResponsiveContainer>
                                            {renderTimeSeriesChart(
                                                chartData.pageViews.length
                                                    ? chartData.pageViews
                                                    : formatAudienceData(undefined),
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
                                            <Users />
                                            {getMostPopularAgeRange().count} usr.
                                        </div>
                                        <CalendarRange />
                                    </div>
                                </div>
                                <div className="__body-devices">
                                    <MonitorSmartphone />
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                bottom: 20,
                                                left: 20,
                                            }}
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
                                                        entry.payload as {
                                                            label?: string;
                                                        }
                                                    )?.label; // Explicit type cast
                                                    return _.startCase(label || value);
                                                }}
                                                wrapperStyle={{
                                                    paddingTop: '20px',
                                                }}
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
                                            {
                                                value: '24h',
                                                label: 'Last 24 hours',
                                            },
                                            {
                                                value: '7d',
                                                label: 'Last 7 days',
                                            },
                                            {
                                                value: '30d',
                                                label: 'Last 30 days',
                                            },
                                            {
                                                value: '6m',
                                                label: 'Last 6 months',
                                            },
                                            { value: 'all', label: 'All time' },
                                        ]}
                                    />
                                </div>
                            </form>
                            <div className="__body">
                                <div className="__body-chart">
                                    <ResponsiveContainer>
                                        {renderTimeSeriesChart(
                                            chartData.subscriberStats,
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
                                                href={`/blog/${article.category.toLowerCase()}/${
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
                            {/* Summary Card */}
                            <div className="__card __card--doubleSummary">
                                <form className="__header _form">
                                    <div className="_row">
                                        <h3 className="__header-title">Visitor Increase</h3>
                                    </div>
                                </form>
                                <div className="__body">
                                    <div className="summary__count">
                                        +{visitorIncrease} Visitors
                                    </div>
                                    <div className="summary__percentage">
                                        {computeImprovementPercentage(
                                            visitorIncrease,
                                            baselineIndex
                                        )}
                                    </div>
                                    <VisitorIncrease />
                                </div>
                            </div>

                            {/* New Returning Users Card */}
                            <div className="__card __card--doubleReturn">
                                <form className="__header _form">
                                    <div className="_row">
                                        <h3 className="__header-title">Returning Users</h3>
                                    </div>
                                </form>
                                <div className="__body">
                                    <div className="summary__count">
                                        {analyticsData.engagementMetrics?.returningUsers || 0}
                                    </div>
                                    <div className="summary__percentage">
                                        {computeImprovementPercentage(
                                            analyticsData.engagementMetrics?.returningUsers || 0,
                                            baselineIndex
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
