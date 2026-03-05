import { AdvisorContextBar } from './AdvisorContextBar';

/**
 * AppHeader — single responsibility: render the persistent app header shell.
 *
 * Composes:
 *   • Logo bar (always visible)
 *   • AdvisorContextBar (support_staff only — self-contained, conditionally renders)
 */
export function AppHeader() {
    return (
        <header>
            <div className="app-header">
                <span style={{ fontSize: '1.3rem' }}>🔷</span>
                <div>
                    <div className="app-header__logo">Client Updater</div>
                    <div className="app-header__subtitle">Secure Client Profile Management</div>
                </div>
            </div>
            <AdvisorContextBar />
        </header>
    );
}
