export type StatusColorName =
	| 'slate'
	| 'gray'
	| 'red'
	| 'orange'
	| 'amber'
	| 'yellow'
	| 'lime'
	| 'green'
	| 'emerald'
	| 'teal'
	| 'cyan'
	| 'sky'
	| 'blue'
	| 'indigo'
	| 'violet'
	| 'purple'
	| 'fuchsia'
	| 'pink'
	| 'rose';

export const STATUS_COLOR_OPTIONS: StatusColorName[] = [
	'slate',
	'gray',
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose'
];

export const statusBadge: Record<StatusColorName, string> = {
	slate:
		'bg-slate-100 text-slate-700 ring-slate-300/60 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/30',
	gray: 'bg-gray-100 text-gray-700 ring-gray-300/60 dark:bg-gray-500/15 dark:text-gray-200 dark:ring-gray-400/30',
	red: 'bg-red-100 text-red-700 ring-red-300/60 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-400/30',
	orange:
		'bg-orange-100 text-orange-700 ring-orange-300/60 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-400/30',
	amber:
		'bg-amber-100 text-amber-800 ring-amber-300/60 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/30',
	yellow:
		'bg-yellow-100 text-yellow-800 ring-yellow-300/60 dark:bg-yellow-500/15 dark:text-yellow-200 dark:ring-yellow-400/30',
	lime: 'bg-lime-100 text-lime-800 ring-lime-300/60 dark:bg-lime-500/15 dark:text-lime-200 dark:ring-lime-400/30',
	green:
		'bg-green-100 text-green-700 ring-green-300/60 dark:bg-green-500/15 dark:text-green-200 dark:ring-green-400/30',
	emerald:
		'bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/30',
	teal: 'bg-teal-100 text-teal-700 ring-teal-300/60 dark:bg-teal-500/15 dark:text-teal-200 dark:ring-teal-400/30',
	cyan: 'bg-cyan-100 text-cyan-700 ring-cyan-300/60 dark:bg-cyan-500/15 dark:text-cyan-200 dark:ring-cyan-400/30',
	sky: 'bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-400/30',
	blue: 'bg-blue-100 text-blue-700 ring-blue-300/60 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/30',
	indigo:
		'bg-indigo-100 text-indigo-700 ring-indigo-300/60 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-400/30',
	violet:
		'bg-violet-100 text-violet-700 ring-violet-300/60 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/30',
	purple:
		'bg-purple-100 text-purple-700 ring-purple-300/60 dark:bg-purple-500/15 dark:text-purple-200 dark:ring-purple-400/30',
	fuchsia:
		'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-300/60 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:ring-fuchsia-400/30',
	pink: 'bg-pink-100 text-pink-700 ring-pink-300/60 dark:bg-pink-500/15 dark:text-pink-200 dark:ring-pink-400/30',
	rose: 'bg-rose-100 text-rose-700 ring-rose-300/60 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/30'
};

export const statusDot: Record<StatusColorName, string> = {
	slate: 'bg-slate-400',
	gray: 'bg-gray-400',
	red: 'bg-red-500',
	orange: 'bg-orange-500',
	amber: 'bg-amber-500',
	yellow: 'bg-yellow-500',
	lime: 'bg-lime-500',
	green: 'bg-green-500',
	emerald: 'bg-emerald-500',
	teal: 'bg-teal-500',
	cyan: 'bg-cyan-500',
	sky: 'bg-sky-500',
	blue: 'bg-blue-500',
	indigo: 'bg-indigo-500',
	violet: 'bg-violet-500',
	purple: 'bg-purple-500',
	fuchsia: 'bg-fuchsia-500',
	pink: 'bg-pink-500',
	rose: 'bg-rose-500'
};

export function asColor(name: string): StatusColorName {
	return (STATUS_COLOR_OPTIONS as string[]).includes(name) ? (name as StatusColorName) : 'slate';
}

export const PRIORITY_OPTIONS = ['none', 'low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITY_OPTIONS)[number];

export const priorityBadge: Record<Priority, string> = {
	none: 'bg-muted text-muted-foreground',
	low: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
	medium: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
	high: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
	urgent: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200'
};

export const priorityLabel: Record<Priority, string> = {
	none: 'No priority',
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	urgent: 'Urgent'
};
