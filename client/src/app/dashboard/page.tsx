'use client';
import { useEffect } from 'react';
import { Card, Title, BarChart, DonutChart } from '@tremor/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchAnalytics, selectAnalytics, selectAnalyticsLoading, selectAnalyticsError } from '@/slices/analyticsSlice';
import { useLoading } from '@/context/LoadingContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const analytics = useSelector(selectAnalytics);
    const isLoading = useSelector(selectAnalyticsLoading);
    const error = useSelector(selectAnalyticsError);
    const { isLoaded } = useLoading();

    useEffect(() => {
        dispatch(fetchAnalytics());
    }, [dispatch]);

    return (
        <div className="space-y-6">
            {error && <div className="text-red-500 p-4">{error}</div>}
            
            <AnimatedWrapper
                as="div"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                from={{ transform: 'translateY(-10%)', opacity: 0 }}
                to={isLoaded && !isLoading ? { transform: 'translateY(0)', opacity: 1 } : undefined}
                config={{ mass: 1, tension: 170, friction: 26 }}
            >
                <Card>
                    <Title>Page Views</Title>
                    <LineChart
                        width={500}
                        height={300}
                        data={analytics.pageViews}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#8884d8" />
                    </LineChart>
                </Card>

                <Card>
                    <Title>Content Interactions</Title>
                    <DonutChart
                        data={analytics.interactions}
                        category="value"
                        index="name"
                        className="h-80"
                    />
                </Card>

                <Card>
                    <Title>Subscriber Growth</Title>
                    <BarChart
                        data={analytics.subscribers}
                        index="date"
                        categories={['count']}
                        className="h-80"
                    />
                </Card>

                <Card>
                    <Title>Articles by Category</Title>
                    <DonutChart
                        data={analytics.articleStats}
                        category="count"
                        index="category"
                        className="h-80"
                    />
                </Card>
            </AnimatedWrapper>
        </div>
    );
}
