
import React from 'react';
import {
	PlusIcon as HiPlusIcon,
	MinusIcon as HiMinusIcon,
	TrashIcon as HiTrashIcon,
	XMarkIcon as HiXMarkIcon,
	CheckCircleIcon as HiCheckCircleIcon,
	XCircleIcon as HiXCircleIcon,
	InformationCircleIcon as HiInformationCircleIcon,
	UserCircleIcon as HiUserCircleIcon,
	BuildingStorefrontIcon as HiBuildingStorefrontIcon,
	ShoppingBagIcon as HiShoppingBagIcon,
	HomeIcon as HiHomeIcon,
	ClipboardDocumentListIcon as HiClipboardDocumentListIcon,
	ShoppingCartIcon as HiShoppingCartIcon,
	TagIcon as HiTagIcon,
	PencilSquareIcon as HiPencilSquareIcon,
	ArrowRightOnRectangleIcon as HiArrowRightOnRectangleIcon,
	ArrowLeftOnRectangleIcon as HiArrowLeftOnRectangleIcon,
	PowerIcon as HiPowerIcon,
	CalendarIcon as HiCalendarIcon,
} from '@heroicons/react/24/outline';

interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

const withDefaultSize = (className?: string) =>
	className && className.trim().length > 0
		? className
		: 'w-5 h-5 md:w-6 md:h-6';

export const PlusIcon = ({ className, ...rest }: IconProps) => (
	<HiPlusIcon className={withDefaultSize(className)} {...rest} />
);

export const MinusIcon = ({ className, ...rest }: IconProps) => (
	<HiMinusIcon className={withDefaultSize(className)} {...rest} />
);

export const TrashIcon = ({ className, ...rest }: IconProps) => (
	<HiTrashIcon className={withDefaultSize(className)} {...rest} />
);

export const XIcon = ({ className, ...rest }: IconProps) => (
	<HiXMarkIcon className={withDefaultSize(className)} {...rest} />
);

export const CheckCircleIcon = ({ className, ...rest }: IconProps) => (
	<HiCheckCircleIcon className={withDefaultSize(className)} {...rest} />
);

export const XCircleIcon = ({ className, ...rest }: IconProps) => (
	<HiXCircleIcon className={withDefaultSize(className)} {...rest} />
);

export const InformationCircleIcon = ({ className, ...rest }: IconProps) => (
	<HiInformationCircleIcon className={withDefaultSize(className)} {...rest} />
);

export const UserCircleIcon = ({ className, ...rest }: IconProps) => (
	<HiUserCircleIcon className={withDefaultSize(className)} {...rest} />
);

export const StoreIcon = ({ className, ...rest }: IconProps) => (
	<HiBuildingStorefrontIcon className={withDefaultSize(className)} {...rest} />
);

export const ShoppingBagIcon = ({ className, ...rest }: IconProps) => (
	<HiShoppingBagIcon className={withDefaultSize(className)} {...rest} />
);

export const HomeIcon = ({ className, ...rest }: IconProps) => (
	<HiHomeIcon className={withDefaultSize(className)} {...rest} />
);

export const ClipboardListIcon = ({ className, ...rest }: IconProps) => (
	<HiClipboardDocumentListIcon className={withDefaultSize(className)} {...rest} />
);

export const ShoppingCartIcon = ({ className, ...rest }: IconProps) => (
	<HiShoppingCartIcon className={withDefaultSize(className)} {...rest} />
);

export const TagIcon = ({ className, ...rest }: IconProps) => (
	<HiTagIcon className={withDefaultSize(className)} {...rest} />
);

export const PencilIcon = ({ className, ...rest }: IconProps) => (
	<HiPencilSquareIcon className={withDefaultSize(className)} {...rest} />
);

export const LoginIcon = ({ className, ...rest }: IconProps) => (
	<HiArrowRightOnRectangleIcon className={withDefaultSize(className)} {...rest} />
);

export const LogoutIcon = ({ className, ...rest }: IconProps) => (
	<HiArrowLeftOnRectangleIcon className={withDefaultSize(className)} {...rest} />
);

export const PowerIcon = ({ className, ...rest }: IconProps) => (
	<HiPowerIcon className={withDefaultSize(className)} {...rest} />
);

export const CalendarIcon = ({ className, ...rest }: IconProps) => (
	<HiCalendarIcon className={withDefaultSize(className)} {...rest} />
);