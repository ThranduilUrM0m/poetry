/**
 * dashboard/articles/page.tsx
 * ----------------------------
 * This Articles page displays the analytical insights previously
 * part of the Dashboard. It includes categorical charts that illustrate:
 *  - Articles by Category
 *  - Content Impact Analysis
 *  - Reader Engagement Analysis
 *
 * Data is retrieved and processed using a similar strategy as in the dashboard.
 */
'use client';
import React, { useEffect, useState, JSX } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { calculateAnalyticsThunk } from '@/slices/analyticsSlice';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Cell,
} from 'recharts';

// ----------------------------------------------------------------------
// Define Interfaces for Chart Data Types used in this page
// ----------------------------------------------------------------------
interface CategoricalDataItem {
    category?: string;
    articleTitle?: string;
    count?: number;
    votes?: number;
    comments?: number;
    percentage?: number;
    trend?: 'up' | 'down' | 'stable';
}

interface ChartData {
    categoryStats: CategoricalDataItem[];
    voteStats: CategoricalDataItem[];
    commentStats: CategoricalDataItem[];
}

// ----------------------------------------------------------------------
// Dummy Calculation Function
// ----------------------------------------------------------------------
const computeImprovementPercentage = (current: number, baseline: number): string => {
    if (!baseline) return '0%';
    const diff = ((current - baseline) / baseline) * 100;
    return `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
};

// ----------------------------------------------------------------------
// Chart Rendering Helper for Categorical Charts
// ----------------------------------------------------------------------
const renderCategoricalChart = (
    data: CategoricalDataItem[],
    dataKey: string,
    nameKey: string,
    chartType: 'bar' | 'pie'
): JSX.Element => {
    if (!data || data.length === 0) {
        return <div className="chart-empty">No data available</div>;
    }
    switch (chartType) {
        case 'bar':
            return (
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={nameKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={dataKey} fill="#1cc88a" />
                </BarChart>
            );
        case 'pie':
            return (
                <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={['#FF6B6B', '#4ECDC4', '#45B7D1'][index % 3]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            );
        default:
            return <></>;
    }
};

// Configurable chart types.
const votesChartType: 'bar' | 'pie' = 'bar';
const commentsChartType: 'bar' | 'pie' = 'pie';

// ----------------------------------------------------------------------
// Articles Page Component
// ----------------------------------------------------------------------
export default function ArticlesPage(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const [chartData, setChartData] = useState<ChartData>({
        categoryStats: [],
        voteStats: [],
        commentStats: [],
    });
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isAnalyticsCalculating, setIsAnalyticsCalculating] = useState<boolean>(true);

    useEffect(() => {
        const loadAnalytics = async (): Promise<void> => {
            try {
                setLoadError(null);
                const aggregated = await dispatch(calculateAnalyticsThunk()).unwrap();
                setChartData({
                    categoryStats: aggregated.articleStats,
                    voteStats: aggregated.votes,
                    commentStats: aggregated.comments,
                });
            } catch (error) {
                console.error('Error loading analytics data:', error);
                setLoadError('Failed to load analytics data');
            } finally {
                setIsAnalyticsCalculating(false);
            }
        };
        loadAnalytics();
    }, [dispatch]);

    return (
        <main className="articles-page">
            <h1>Articles</h1>
            <p>Welcome to the Articles insights page.</p>
            {loadError && <div className="articles__error">Error: {loadError}</div>}
            {isAnalyticsCalculating ? (
                <div className="articles__loader">Calculating Analytics...</div>
            ) : (
                <div className="articles__content-grid">
                    <div className="__row">
                        {/* Articles by Category Chart */}
                        <div className="__card __card--categories">
                            <div className="__header">
                                <h3 className="__header-title">Articles by Category</h3>
                            </div>
                            <div className="__body">
                                <div className="__body-chart">
                                    <ResponsiveContainer>
                                        {renderCategoricalChart(
                                            chartData.categoryStats,
                                            'count',
                                            'category',
                                            'bar'
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        {/* Per-Article Votes Chart */}
                        <div className="__card __card--impact">
                            <div className="__header">
                                <h3 className="__header-title">Content Impact Analysis</h3>
                            </div>
                            <div className="__body">
                                <div className="__body-chart">
                                    <ResponsiveContainer>
                                        {renderCategoricalChart(
                                            chartData.voteStats,
                                            'votes',
                                            'articleTitle',
                                            votesChartType
                                        )}
                                    </ResponsiveContainer>
                                </div>
                                <div className="__body-summary">
                                    <div className="summary__count">
                                        {chartData.voteStats.reduce(
                                            (acc, cur) => acc + (cur.votes || 0),
                                            0
                                        )}
                                    </div>
                                    <div className="summary__percentage">
                                        {computeImprovementPercentage(80, 75)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Per-Article Comments Chart */}
                        <div className="__card __card--engagement-metrics">
                            <div className="__header">
                                <h3 className="__header-title">Reader Engagement Analysis</h3>
                            </div>
                            <div className="__body">
                                <div className="__body-chart">
                                    <ResponsiveContainer>
                                        {renderCategoricalChart(
                                            chartData.commentStats,
                                            'comments',
                                            'articleTitle',
                                            commentsChartType
                                        )}
                                    </ResponsiveContainer>
                                </div>
                                <div className="__body-summary">
                                    <div className="summary__count">
                                        {chartData.commentStats.reduce(
                                            (acc, cur) => acc + (cur.comments || 0),
                                            0
                                        )}
                                    </div>
                                    <div className="summary__percentage">
                                        {computeImprovementPercentage(60, 55)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
