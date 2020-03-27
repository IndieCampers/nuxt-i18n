import middleware from '../middleware'
import { detectBrowserLanguage, rootRedirect, LOCALE_DOMAIN_KEY } from './options'
import { getLocaleFromRoute } from './utils'

middleware.nuxti18n = async (context) => {
  const { app, route, redirect, isHMR } = context

  if (isHMR) {
    return
  }

  // Handle root path redirect
  if (route.path === '/' && rootRedirect) {
    redirect('/' + rootRedirect, route.query)
    return
  }
  const locale = app.i18n.locale || app.i18n.defaultLocale || null
  const routeLocale = getLocaleFromRoute(route)

  if (app.i18n.differentDomains && defaultLanguagePathOnDomain(app, locale, routeLocale)) {
    redirect('/404')
  }

  if (detectBrowserLanguage && await app.i18n.__detectBrowserLanguage()) {
    return
  }

  await app.i18n.setLocale(routeLocale || locale)
}

function defaultLanguagePathOnDomain (app, currentLocale, routeLocale) {
  const currentLocaleIsCustomDomain = LOCALE_DOMAIN_KEY in app.i18n.locales.find(l => l.code === currentLocale)
  return currentLocaleIsCustomDomain && routeLocale === app.i18n.defaultLocale
}
