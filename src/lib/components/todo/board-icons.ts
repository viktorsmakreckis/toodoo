import type { Component } from 'svelte';

import BookIcon from '@lucide/svelte/icons/book';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import BriefcaseIcon from '@lucide/svelte/icons/briefcase';
import BrushIcon from '@lucide/svelte/icons/brush';
import BugIcon from '@lucide/svelte/icons/bug';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list';
import CodeIcon from '@lucide/svelte/icons/code';
import CompassIcon from '@lucide/svelte/icons/compass';
import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
import DumbbellIcon from '@lucide/svelte/icons/dumbbell';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import FlagIcon from '@lucide/svelte/icons/flag';
import FolderIcon from '@lucide/svelte/icons/folder';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import HammerIcon from '@lucide/svelte/icons/hammer';
import HeartIcon from '@lucide/svelte/icons/heart';
import HomeIcon from '@lucide/svelte/icons/home';
import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
import LeafIcon from '@lucide/svelte/icons/leaf';
import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
import ListTodoIcon from '@lucide/svelte/icons/list-todo';
import MailIcon from '@lucide/svelte/icons/mail';
import MapIcon from '@lucide/svelte/icons/map';
import MusicIcon from '@lucide/svelte/icons/music';
import PaletteIcon from '@lucide/svelte/icons/palette';
import PlaneIcon from '@lucide/svelte/icons/plane';
import RocketIcon from '@lucide/svelte/icons/rocket';
import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import StarIcon from '@lucide/svelte/icons/star';
import SunIcon from '@lucide/svelte/icons/sun';
import TargetIcon from '@lucide/svelte/icons/target';
import TrophyIcon from '@lucide/svelte/icons/trophy';
import UmbrellaIcon from '@lucide/svelte/icons/umbrella';
import UsersIcon from '@lucide/svelte/icons/users';
import UtensilsIcon from '@lucide/svelte/icons/utensils';
import WrenchIcon from '@lucide/svelte/icons/wrench';
import ZapIcon from '@lucide/svelte/icons/zap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LucideIcon = Component<any, Record<string, never>, ''>;

export const BOARD_ICONS: Record<string, LucideIcon> = {
	'list-todo': ListTodoIcon as LucideIcon,
	'layout-grid': LayoutGridIcon as LucideIcon,
	'layout-dashboard': LayoutDashboardIcon as LucideIcon,
	'clipboard-list': ClipboardListIcon as LucideIcon,
	target: TargetIcon as LucideIcon,
	rocket: RocketIcon as LucideIcon,
	briefcase: BriefcaseIcon as LucideIcon,
	flag: FlagIcon as LucideIcon,
	star: StarIcon as LucideIcon,
	sparkles: SparklesIcon as LucideIcon,
	trophy: TrophyIcon as LucideIcon,
	heart: HeartIcon as LucideIcon,
	zap: ZapIcon as LucideIcon,
	sun: SunIcon as LucideIcon,
	lightbulb: LightbulbIcon as LucideIcon,
	bug: BugIcon as LucideIcon,
	code: CodeIcon as LucideIcon,
	hammer: HammerIcon as LucideIcon,
	wrench: WrenchIcon as LucideIcon,
	brush: BrushIcon as LucideIcon,
	palette: PaletteIcon as LucideIcon,
	book: BookIcon as LucideIcon,
	'book-open': BookOpenIcon as LucideIcon,
	'graduation-cap': GraduationCapIcon as LucideIcon,
	'file-text': FileTextIcon as LucideIcon,
	folder: FolderIcon as LucideIcon,
	mail: MailIcon as LucideIcon,
	calendar: CalendarIcon as LucideIcon,
	'check-circle-2': CheckCircle2Icon as LucideIcon,
	home: HomeIcon as LucideIcon,
	users: UsersIcon as LucideIcon,
	'dollar-sign': DollarSignIcon as LucideIcon,
	'shopping-bag': ShoppingBagIcon as LucideIcon,
	smartphone: SmartphoneIcon as LucideIcon,
	music: MusicIcon as LucideIcon,
	utensils: UtensilsIcon as LucideIcon,
	leaf: LeafIcon as LucideIcon,
	compass: CompassIcon as LucideIcon,
	map: MapIcon as LucideIcon,
	plane: PlaneIcon as LucideIcon,
	umbrella: UmbrellaIcon as LucideIcon,
	dumbbell: DumbbellIcon as LucideIcon
};

export const BOARD_ICON_NAMES = Object.keys(BOARD_ICONS);

export const DEFAULT_BOARD_ICON = 'list-todo';

export function getBoardIcon(name: string | null | undefined): LucideIcon {
	if (name && name in BOARD_ICONS) return BOARD_ICONS[name];
	return BOARD_ICONS[DEFAULT_BOARD_ICON];
}
