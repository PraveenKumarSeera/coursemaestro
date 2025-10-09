
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type ChartData = {
  name: string;
  students: number;
};

const chartConfig = {
  students: {
    label: "Students",
  },
};

export default function TeacherPerformanceChart({ data, courseTitle }: { data: ChartData[], courseTitle: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{courseTitle}</CardTitle>
        <CardDescription>
          Grade distribution for this course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} accessibilityLayer>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
