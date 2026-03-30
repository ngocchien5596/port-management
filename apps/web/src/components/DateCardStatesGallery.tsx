'use client';

// Demo time configuration - flip useDemoNow to false for real time
const useDemoNow = true;
const demoNow = new Date("2026-01-28T15:30:00");
const CUTOFF_HOUR = 16;

const now = useDemoNow ? demoNow : new Date();
const todayDateNumber = now.getDate();
const isPastCutoff = now.getHours() >= CUTOFF_HOUR;

// Icons
const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
);

const MoonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
    </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const UtensilIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </svg>
);

// Button states
type ButtonState = 'grayX' | 'greenUtensil' | 'redX' | 'brandCheck' | 'grayPlus' | 'brandCheckDisabled' | 'grayPlusDisabled';

const ActionButton = ({ state }: { state: ButtonState }) => {
    const baseClasses = "w-11 h-11 rounded-lg flex items-center justify-center";

    switch (state) {
        case 'grayX':
            return (
                <div className={`${baseClasses} bg-gray-300`}>
                    <XIcon className="w-5 h-5 text-white" />
                </div>
            );
        case 'greenUtensil':
            return (
                <div className={`${baseClasses} bg-emerald-400`}>
                    <UtensilIcon className="w-5 h-5 text-white" />
                </div>
            );
        case 'redX':
            return (
                <div className={`${baseClasses} bg-red-400`}>
                    <XIcon className="w-5 h-5 text-white" />
                </div>
            );
        case 'brandCheck':
            return (
                <div className={`${baseClasses} bg-brand`}>
                    <CheckIcon className="w-5 h-5 text-white" />
                </div>
            );
        case 'brandCheckDisabled':
            return (
                <div className={`${baseClasses} bg-brand-soft text-brand/40`}>
                    <CheckIcon className="w-5 h-5" />
                </div>
            );
        case 'grayPlus':
            return (
                <div className={`${baseClasses} bg-white border-2 border-gray-300`}>
                    <PlusIcon className="w-5 h-5 text-gray-400" />
                </div>
            );
        case 'grayPlusDisabled':
            return (
                <div className={`${baseClasses} bg-gray-100 border-2 border-gray-200`}>
                    <PlusIcon className="w-5 h-5 text-gray-300" />
                </div>
            );
        default:
            return null;
    }
};

// Date Card component
interface DateCardProps {
    dayNumber: number | string;
    showIcons?: boolean;
    showButtons?: boolean;
    leftButton?: ButtonState;
    rightButton?: ButtonState;
    isToday?: boolean;
    isMuted?: boolean;
    isOtherMonth?: boolean;
}

const DateCard = ({
    dayNumber,
    showIcons = true,
    showButtons = true,
    leftButton = 'grayX',
    rightButton = 'grayX',
    isToday = false,
    isMuted = false,
    isOtherMonth = false,
}: DateCardProps) => {
    const cardClasses = `
        relative w-[140px] min-h-[120px] rounded-xl p-3
        ${isOtherMonth
            ? 'bg-gray-200/80'
            : isMuted
                ? 'bg-gray-100 border border-gray-200'
                : 'bg-white border border-gray-200 shadow-sm'
        }
    `;

    const dayClasses = `
        text-lg font-semibold
        ${isMuted || isOtherMonth ? 'text-gray-400' : 'text-gray-700'}
    `;

    return (
        <div className={cardClasses}>
            {/* Top row: Day + TODAY badge */}
            <div className="flex items-center gap-2">
                <span className={dayClasses}>{dayNumber}</span>
                {isToday && (
                    <span className="bg-brand text-white text-[10px] font-black px-2 py-0.5 rounded tracking-tighter shadow-sm shadow-brand/20">
                        TODAY
                    </span>
                )}
            </div>

            {/* Icons: sun and moon */}
            {showIcons && !isOtherMonth && (
                <div className="flex items-center gap-3 mt-1.5">
                    <SunIcon className={`w-3.5 h-3.5 ${isMuted ? 'text-gray-300' : 'text-gray-400'}`} />
                    <MoonIcon className={`w-3.5 h-3.5 ${isMuted ? 'text-gray-300' : 'text-gray-400'}`} />
                </div>
            )}

            {/* Action buttons */}
            {showButtons && !isOtherMonth && (
                <div className="flex items-center gap-2 mt-auto pt-3">
                    <ActionButton state={leftButton} />
                    <ActionButton state={rightButton} />
                </div>
            )}
        </div>
    );
};

// Example Card Wrapper
interface ExampleProps {
    caption: string;
    children: React.ReactNode;
}

const Example = ({ caption, children }: ExampleProps) => (
    <div className="flex flex-col items-start">
        <span className="text-xs text-gray-500 mb-2 truncate max-w-[140px]">{caption}</span>
        {children}
    </div>
);

export default function DateCardStatesGallery() {
    // Determine which Today card is active based on cutoff
    const todayActiveBeforeCutoff = !isPastCutoff;

    return (
        <div className="min-h-screen bg-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Date Card States Gallery</h2>

            {/* Row 1: 5 cards */}
            <div className="flex flex-wrap gap-6 mb-8">
                {/* 1) Past, not registered */}
                <Example caption="Ngày k đăng ký ăn trong quá khứ">
                    <DateCard
                        dayNumber={1}
                        leftButton="grayX"
                        rightButton="grayX"
                        isMuted
                    />
                </Example>

                {/* 2) Past, ate/missed */}
                <Example caption="Ngày đã ăn/k ăn trong quá khứ">
                    <DateCard
                        dayNumber={1}
                        leftButton="greenUtensil"
                        rightButton="redX"
                        isMuted
                    />
                </Example>

                {/* 3) Registered but locked (disabled blue) */}
                <Example caption="Ngày đã đăng ký ăn và đã bị khóa">
                    <DateCard
                        dayNumber={1}
                        leftButton="brandCheck"
                        rightButton="brandCheck"
                        isMuted
                    />
                </Example>

                {/* 4) Registered and not locked (active blue) */}
                <Example caption="Ngày đã đăng ký ăn và chưa bị khóa">
                    <DateCard
                        dayNumber={1}
                        leftButton="brandCheck"
                        rightButton="brandCheck"
                    />
                </Example>

                {/* 5) Available to register */}
                <Example caption="Ngày cho phép đăng ký">
                    <DateCard
                        dayNumber={1}
                        leftButton="grayPlus"
                        rightButton="grayPlus"
                    />
                </Example>
            </div>

            {/* Row 2: 4 cards */}
            <div className="flex flex-wrap gap-6">
                {/* 6) Other month */}
                <Example caption="Ngày thuộc tháng khác">
                    <DateCard
                        dayNumber={1}
                        showIcons={false}
                        showButtons={false}
                        isOtherMonth
                    />
                </Example>

                {/* 7) Past, ate/didn't eat */}
                <Example caption="Ngày đã ăn/k ăn trong quá khứ">
                    <DateCard
                        dayNumber={1}
                        leftButton="greenUtensil"
                        rightButton="grayX"
                        isMuted
                    />
                </Example>

                {/* 8) Today (before cutoff) */}
                <Example caption="Today (chưa quá giờ chốt)">
                    <DateCard
                        dayNumber={todayDateNumber}
                        leftButton={todayActiveBeforeCutoff ? "brandCheck" : "brandCheckDisabled"}
                        rightButton={todayActiveBeforeCutoff ? "grayPlus" : "grayPlusDisabled"}
                        isToday
                        isMuted={!todayActiveBeforeCutoff}
                    />
                </Example>

                {/* 9) Today (past cutoff) */}
                <Example caption="Today (quá giờ chốt)">
                    <DateCard
                        dayNumber={todayDateNumber}
                        leftButton={!todayActiveBeforeCutoff ? "brandCheckDisabled" : "brandCheck"}
                        rightButton={!todayActiveBeforeCutoff ? "grayPlusDisabled" : "grayPlus"}
                        isToday
                        isMuted={todayActiveBeforeCutoff}
                    />
                </Example>
            </div>

            {/* Debug info */}
            <div className="mt-8 p-4 bg-white/50 rounded-lg text-xs text-gray-500">
                <p>Demo time: {now.toLocaleString('vi-VN')}</p>
                <p>Today: {todayDateNumber}, Past cutoff ({CUTOFF_HOUR}:00): {isPastCutoff ? 'Yes' : 'No'}</p>
                <p className="mt-1 text-gray-400">Toggle `useDemoNow` to switch between demo and real time.</p>
            </div>
        </div>
    );
}
