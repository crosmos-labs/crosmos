export interface UsageMetric {
	used: number;
	limit: number;
	remaining: number;
}

export interface Usage {
	plan: string;
	period_start: string;
	period_end: string;
	tokens: UsageMetric;
	queries: UsageMetric;
	spaces: UsageMetric;
	rate_limit_rpm: number;
	rate_limit_per_day: number;
}