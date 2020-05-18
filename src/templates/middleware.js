import middleware from '../middleware'
import { detectBrowserLanguage, rootRedirect, LOCALE_DOMAIN_KEY } from './options'
import { getLocaleFromRoute, correctDomainRoute } from './utils'

middleware.nuxti18n = async (context) => {
  const { app, route, redirect, isHMR } = context

  if (isHMR) {
    return
  }

  if (typeof window !== "undefined") {
    route.name = correctDomainRoute(window.location.host, route.name, app.store, app.i18n.locales, app.i18n.defaultLocale)
  }

  // Handle root path redirect
  if (route.path === '/' && rootRedirect) {
    redirect('/' + rootRedirect, route.query)
    return
  }
  const locale = app.i18n.locale || app.i18n.defaultLocale || null
  const routeLocale = getLocaleFromRoute(route)

  if (route.path !== '/' && app.i18n.differentDomains && (domainLanguageMismatch(app, locale, routeLocale))) {
    app.error({statusCode: 404, message: 'not found'})
  }

  if (detectBrowserLanguage && await app.i18n.__detectBrowserLanguage()) {
    return
  }

  await app.i18n.setLocale(routeLocale || locale)
}

function domainLanguageMismatch (app, currentLocale, routeLocale) {
  return domainLanguagePathOnDefault(app, currentLocale, routeLocale) ||
          defaultLanguagePathOnDomain(app, currentLocale, routeLocale)
}

function domainLanguagePathOnDefault (app, currentLocale, routeLocale) {
  const routeLocaleConfig = app.i18n.locales.find(l => l.code === routeLocale)
  const routeIsOnCustomDomain = routeLocaleConfig && LOCALE_DOMAIN_KEY in routeLocaleConfig
  return routeIsOnCustomDomain && currentLocale === app.i18n.defaultLocale
}

function defaultLanguagePathOnDomain (app, currentLocale, routeLocale) {
  const currentLocaleIsCustomDomain = LOCALE_DOMAIN_KEY in app.i18n.locales.find(l => l.code === currentLocale)
  return currentLocaleIsCustomDomain && routeLocale === app.i18n.defaultLocale
}
