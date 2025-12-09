import React, { useState } from 'react';
import {
    LayoutDashboard,
    Network,
    Inbox,
    Settings,
    FileText,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Circle
} from 'lucide-react';

function NavItem({ icon: Icon, label, active = false, hasChildren = false, expanded = false, onClick, children, collapsed = false }) {
    if (collapsed) {
        return (
            <div className="relative group">
                <button
                    className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-colors
                               ${active
                            ? 'bg-primary-500/10 text-primary-500'
                            : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50'}`}
                    title={label}
                >
                    <Icon className="w-5 h-5" />
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-800 text-white text-sm rounded 
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors
                           ${active
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50'}`}
            >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{label}</span>
                {hasChildren && (
                    expanded
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                )}
            </button>
            {hasChildren && expanded && (
                <div className="ml-4 pl-4 border-l border-surface-200 dark:border-surface-700 mt-1 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
}

function SubNavItem({ label, active = false }) {
    return (
        <button
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                       ${active
                    ? 'text-primary-500'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}`}
        >
            <Circle className={`w-2 h-2 ${active ? 'fill-current' : ''}`} />
            <span>{label}</span>
        </button>
    );
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [servicesExpanded, setServicesExpanded] = useState(true);
    const [invoicesExpanded, setInvoicesExpanded] = useState(true);

    return (
        <aside className={`${collapsed ? 'w-16' : 'w-56'} h-full bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}>
            {/* Logo & User */}
            <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">V</span>
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-surface-800 dark:text-surface-100 truncate">TrueEstate</div>
                                <div className="text-xs text-surface-500 truncate">Vansh Bargotra</div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-surface-400 flex-shrink-0" />
                        </>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
                <NavItem icon={LayoutDashboard} label="Dashboard" active collapsed={collapsed} />
                <NavItem icon={Network} label="Nexus" collapsed={collapsed} />
                <NavItem icon={Inbox} label="Intake" collapsed={collapsed} />

                {!collapsed ? (
                    <>
                        <NavItem
                            icon={Settings}
                            label="Services"
                            hasChildren
                            expanded={servicesExpanded}
                            onClick={() => setServicesExpanded(!servicesExpanded)}
                        >
                            <SubNavItem label="Pre-active" />
                            <SubNavItem label="Active" />
                            <SubNavItem label="Blocked" />
                            <SubNavItem label="Closed" />
                        </NavItem>

                        <NavItem
                            icon={FileText}
                            label="Invoices"
                            hasChildren
                            expanded={invoicesExpanded}
                            onClick={() => setInvoicesExpanded(!invoicesExpanded)}
                        >
                            <SubNavItem label="Proforma Invoices" />
                            <SubNavItem label="Final Invoices" />
                        </NavItem>
                    </>
                ) : (
                    <>
                        <NavItem icon={Settings} label="Services" collapsed={collapsed} />
                        <NavItem icon={FileText} label="Invoices" collapsed={collapsed} />
                    </>
                )}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-2 border-t border-surface-200 dark:border-surface-700">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-surface-500 
                               hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-lg transition-colors"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
