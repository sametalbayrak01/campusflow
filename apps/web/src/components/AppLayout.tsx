import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { changeLocale, type Locale } from '../i18n'

export function AppLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const dashboardActive = location.pathname === '/'

  const selectLocale = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void changeLocale(event.target.value as Locale)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="CampusFlow">
          <span className="brand-mark">C</span>
          <span>CampusFlow</span>
        </Link>

        <nav aria-label="Main navigation">
          <NavLink className={dashboardActive ? 'nav-link active' : 'nav-link'} to="/">
            <span aria-hidden="true">⌂</span>{t('nav.dashboard')}
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/schedule">
            <span aria-hidden="true">▦</span>{t('nav.schedule')}
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/assignments">
            <span aria-hidden="true">✓</span>{t('nav.tasks')}
          </NavLink>
          <NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/courses">
            <span aria-hidden="true">◇</span>{t('nav.courses')}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <label className="language-picker">
            <span>{t('common.language')}</span>
            <select value={i18n.language} onChange={selectLocale}>
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </label>
          <div className="semester-card">
            <p className="eyebrow">{t('layout.semester')}</p>
            <strong>{t('layout.week')}</strong>
            <div className="progress" aria-label={t('layout.progress')}><span /></div>
            <small>{t('layout.finals')}</small>
          </div>
          <button className="profile" type="button">
            <span className="avatar">SA</span>
            <span><strong>{t('layout.student')}</strong><small>{t('layout.profile')}</small></span>
            <span aria-hidden="true">•••</span>
          </button>
        </div>
      </aside>

      <Outlet />
    </div>
  )
}
